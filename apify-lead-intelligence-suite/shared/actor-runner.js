import { Actor, Dataset, log } from 'apify';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { buildLeadRecord, buildOpportunityScore, normalizeUrl } from './utils.js';

export async function runGenericLeadActor(config) {
  await Actor.init();
  const input = await Actor.getInput() || {};
  const {
    queries = [],
    urls = [],
    niche,
    city,
    country = 'US',
    maxResults = 50,
    useCrawler = false,
  } = input;

  log.info(`Running ${config.name}`);

  const baseRecords = [];

  for (const query of queries) {
    baseRecords.push(buildLeadRecord({
      business_name: query,
      niche,
      city,
      country,
      source: config.slug,
    }, config.mockAnalyze({ query, niche, city, country })));
  }

  for (const rawUrl of urls) {
    const website = normalizeUrl(rawUrl);
    baseRecords.push(buildLeadRecord({
      business_name: rawUrl,
      website,
      niche,
      city,
      country,
      source: config.slug,
    }, config.mockAnalyze({ website, niche, city, country })));
  }

  if (useCrawler && urls.length) {
    const requestQueue = await RequestQueue.open();
    for (const url of urls) {
      const cleanUrl = normalizeUrl(url);
      if (cleanUrl) await requestQueue.addRequest({ url: cleanUrl });
    }

    const crawler = new CheerioCrawler({
      requestQueue,
      maxRequestsPerCrawl: maxResults,
      async requestHandler({ request, $, enqueueLinks }) {
        const title = $('title').first().text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const bodyText = $('body').text().replace(/\s+/g, ' ').slice(0, 1000);
        await Dataset.pushData({
          source_url: request.loadedUrl,
          page_title: title,
          meta_description: description,
          sample_text: bodyText,
          analysis: config.mockAnalyze({ website: request.loadedUrl, title, description, bodyText }),
          created_at: new Date().toISOString(),
        });
        await enqueueLinks({ strategy: 'same-domain', limit: 5 });
      },
    });

    await crawler.run();
  }

  const records = baseRecords.slice(0, maxResults).map((record) => ({
    ...record,
    opportunity: buildOpportunityScore(record.scores || {}),
    recommended_offer: config.recommendedOffer,
    next_action: config.nextAction,
  }));

  await Dataset.pushData(records);
  await Actor.exit();
}
