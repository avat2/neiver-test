import { Dataset, log } from 'apify';

export function normalizeUrl(url) {
  if (!url) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

export function scoreRange(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

export function buildLeadRecord(input, enrichment = {}) {
  return {
    business_name: input.business_name || input.name || null,
    website: normalizeUrl(input.website || input.domain),
    phone: input.phone || null,
    email: input.email || null,
    industry: input.industry || input.niche || null,
    city: input.city || null,
    country: input.country || null,
    source: input.source || 'manual_input',
    ...enrichment,
    created_at: new Date().toISOString(),
  };
}

export async function pushRecords(records) {
  const clean = Array.isArray(records) ? records : [records];
  for (const record of clean) {
    await Dataset.pushData(record);
  }
  log.info(`Pushed ${clean.length} record(s).`);
}

export function buildOpportunityScore({ websiteScore = 50, socialScore = 50, intentScore = 50, reviewsScore = 50, contactScore = 50 }) {
  const weighted = websiteScore * 0.25 + socialScore * 0.15 + intentScore * 0.25 + reviewsScore * 0.15 + contactScore * 0.2;
  const score = Math.round(scoreRange(weighted));
  return {
    lead_score: score,
    priority: score >= 80 ? 'HIGH' : score >= 55 ? 'MEDIUM' : 'LOW',
    estimated_value: score >= 80 ? '$15K-$50K' : score >= 55 ? '$5K-$15K' : '$1K-$5K',
  };
}
