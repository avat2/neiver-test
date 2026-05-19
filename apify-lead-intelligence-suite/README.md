# Apify Lead Intelligence Suite

Suite 1 de 5 para Omnia / AutoLeadsX: 10 herramientas tipo Actor para captación, análisis, enriquecimiento y priorización de leads.

## Herramientas incluidas

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

## Objetivo

No es solo extraer datos. La suite convierte señales públicas en oportunidades comerciales accionables: leads, problemas detectados, prioridad de venta, ángulos de oferta y reportes para cierre.

## Estructura

```txt
apify-lead-intelligence-suite/
  actors/
    01-local-business-hunter/
    02-website-technology-detector/
    03-social-presence-analyzer/
    04-high-intent-lead-detector/
    05-google-reviews-opportunity-scanner/
    06-lead-contact-extractor-pro/
    07-competitor-ad-intelligence/
    08-ai-lead-scoring-engine/
    09-multi-platform-prospect-finder/
    10-automated-prospect-report-generator/
  shared/
  assets/
  docs/
```

## Nota técnica

Cada actor incluye:

- `package.json`
- `Dockerfile`
- `.actor/actor.json`
- `.actor/INPUT_SCHEMA.json`
- `src/main.js`
- `README.md`
- prompt visual para imagen/thumbnail

## Deploy manual con Apify CLI

```bash
npm install -g apify-cli
apify login
cd actors/01-local-business-hunter
apify push
```

## Seguridad

No pegues tokens en el código. Usa variables de entorno o Apify secrets.
