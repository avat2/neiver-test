# Deployment Guide

## Local test

```bash
cd apify-lead-intelligence-suite/actors/01-local-business-hunter
npm install
npm start
```

## Apify deploy

```bash
npm install -g apify-cli
apify login
apify push
```

## Required secrets

- OPENAI_API_KEY
- OPENAI_MODEL
- CRM_WEBHOOK_URL

## Validation checklist

- package.json exists
- Dockerfile exists
- .actor/actor.json exists
- .actor/INPUT_SCHEMA.json exists
- src/main.js exists
- README.md exists
