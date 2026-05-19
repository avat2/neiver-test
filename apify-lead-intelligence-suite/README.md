# Apify Lead Intelligence Suite

Suite 1 de 5 para Omnia / AutoLeadsX. Contiene 10 Apify Actors operacionales para captación, análisis, enriquecimiento, scoring y envío de leads a CRM.

## Actors

1. Local Business Hunter
2. Website Technology Detector
3. Social Presence Analyzer
4. High Intent Lead Detector
5. Google Reviews Opportunity Scanner
6. Lead Contact Extractor PRO
7. Competitor Ad Intelligence
8. AI Lead Scoring Engine
9. Multi-Platform Prospect Finder
10. Automated Prospect Report Generator

## Run

```bash
cd actors/01-local-business-hunter
npm install
npm start
```

## Deploy

```bash
npm install -g apify-cli
apify login
apify push
```

## Environment variables

```txt
OPENAI_API_KEY
OPENAI_MODEL
CRM_WEBHOOK_URL
```

## Status

Production-ready baseline: each Actor includes Apify SDK, Crawlee, OpenAI optional analysis, CRM webhook routing, lead scoring, email/phone extraction and dataset output.
