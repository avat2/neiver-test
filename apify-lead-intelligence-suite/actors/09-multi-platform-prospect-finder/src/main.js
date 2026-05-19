import { Actor, Dataset, log } from 'apify';
import { CheerioCrawler, RequestQueue } from 'crawlee';

function normalizeUrl(url) {
  if (!url) return null;
  try {
    const clean = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(clean).toString();
  } catch {
    return null;
  }
}

function scoreLead({ hasWebsite, hasEmail, hasPhone, hasWeakness, hasIntent }) {
  const score = Math.min(100, Math.max(0,
    (hasWebsite ? 20 : 0) +
    (hasEmail ? 20 : 0) +
    (hasPhone ? 15 : 0) +
    (hasWeakness ? 25 : 0) +
    (hasIntent ? 20 : 0)
  ));
  return {
    lead_score: score,
    priority: score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW',
    estimated_value: score >= 80 ? '$15K-$50K' : score >= 50 ? '$5K-$15K' : '$1K-$5K'
  };
}

function detectWeakness(text = '') {
  const t = text.toLowerCase();
  return ['wordpress', 'wix', 'slow', 'old', 'no crm', 'no automation', 'broken', 'outdated'].some(x => t.includes(x));
}

async function analyzeWithOpenAI(lead, actorName) {
  if (!process.env.OPENAI_API_KEY) return null;
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Return compact valid JSON only.' },
      { role: 'user', content: `Analyze this B2B lead for ${actorName}. Return summary, pain_points, sales_angle, recommended_offer, urgency, first_message. Lead: ${JSON.stringify(lead)}` }
    ]
  });
  try { return JSON.parse(response.choices[0].message.content); } catch { return { raw: response.choices[0].message.content }; }
}

async function sendWebhook(payload) {
  if (!process.env.CRM_WEBHOOK_URL) return { sent: false };
  const res = await fetch(process.env.CRM_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { sent: res.ok, status: res.status };
}

await Actor.init();
const input = await Actor.getInput() || {};
const {
  actorName = 'Lead Intelligence Actor',
  actorSlug = 'lead-intelligence-actor',
  queries = [],
  urls = [],
  niche = 'roofing',
  city = 'Miami',
  country = 'US',
  maxResults = 50,
  useCrawler = false,
  sendToCrm = false,
  enableAiAnalysis = false
} = input;

const results = [];

for (const query of queries.slice(0, maxResults)) {
  const text = `${query} ${niche} ${city}`;
  const lead = {
    business_name: query,
    website: null,
    email: null,
    phone: null,
    niche,
    city,
    country,
    source: actorSlug,
    findings: ['Seed lead generated from query', 'Requires enrichment'],
    created_at: new Date().toISOString()
  };
  lead.opportunity = scoreLead({ hasWebsite: false, hasEmail: false, hasPhone: false, hasWeakness: detectWeakness(text), hasIntent: /ads|hiring|growth|expansion|lead/i.test(text) });
  if (enableAiAnalysis) lead.ai_analysis = await analyzeWithOpenAI(lead, actorName);
  if (sendToCrm) lead.crm = await sendWebhook({ actorName, lead });
  results.push(lead);
}

if (useCrawler && urls.length) {
  const queue = await RequestQueue.open();
  for (const raw of urls) {
    const url = normalizeUrl(raw);
    if (url) await queue.addRequest({ url });
  }
  const crawler = new CheerioCrawler({
    requestQueue: queue,
    maxRequestsPerCrawl: maxResults,
    async requestHandler({ request, $ }) {
      const title = $('title').first().text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      const body = $('body').text().replace(/\s+/g, ' ').slice(0, 2500);
      const email = body.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
      const phone = body.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || null;
      const lead = {
        business_name: title || request.loadedUrl,
        website: request.loadedUrl,
        email,
        phone,
        niche,
        city,
        country,
        source: actorSlug,
        page_title: title,
        meta_description: description,
        findings: [
          detectWeakness(`${title} ${description} ${body}`) ? 'Potential website or automation weakness detected' : 'No obvious weakness detected',
          email ? 'Email found' : 'Email not found',
          phone ? 'Phone found' : 'Phone not found'
        ],
        created_at: new Date().toISOString()
      };
      lead.opportunity = scoreLead({ hasWebsite: true, hasEmail: !!email, hasPhone: !!phone, hasWeakness: detectWeakness(`${title} ${description} ${body}`), hasIntent: /ads|hiring|growth|expansion|lead/i.test(body) });
      if (enableAiAnalysis) lead.ai_analysis = await analyzeWithOpenAI(lead, actorName);
      if (sendToCrm) lead.crm = await sendWebhook({ actorName, lead });
      results.push(lead);
    }
  });
  await crawler.run();
}

await Dataset.pushData(results);
log.info(`Finished ${actorName}. Pushed ${results.length} results.`);
await Actor.exit();
