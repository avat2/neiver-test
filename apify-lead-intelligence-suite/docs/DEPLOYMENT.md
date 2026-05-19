# Deployment Guide — Apify Lead Intelligence Suite

## 1. Generate Actor folders

From `apify-lead-intelligence-suite/`:

```bash
node tools/generate-actors.mjs
```

This creates the 10 Actor folders under `actors/`.

## 2. Test one Actor locally

```bash
cd actors/01-local-business-hunter
npm install
npm start
```

Example `apify_storage/key_value_stores/default/INPUT.json`:

```json
{
  "queries": ["roofing company miami", "hvac contractor hialeah"],
  "urls": ["example.com"],
  "niche": "roofing",
  "city": "Miami",
  "country": "US",
  "maxResults": 25,
  "useCrawler": false
}
```

## 3. Deploy to Apify

```bash
npm install -g apify-cli
apify login
cd actors/01-local-business-hunter
apify push
```

Repeat for each actor.

## 4. Recommended Apify secrets

Use Apify secrets or environment variables. Do not commit API keys.

```txt
OPENAI_API_KEY
GOOGLE_MAPS_API_KEY
SERPAPI_KEY
APIFY_TOKEN
CRM_WEBHOOK_URL
```

## 5. Production roadmap

- Replace mockAnalyze with real APIs.
- Add Google Maps enrichment.
- Add social platform parsers where allowed.
- Add email validation API.
- Add PDF report rendering.
- Add CRM webhooks.
- Add scheduler tasks.
