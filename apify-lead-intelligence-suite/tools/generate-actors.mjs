import fs from 'node:fs';
import path from 'node:path';
import actors from '../actors.json' assert { type: 'json' };

const root = path.resolve('actors');
fs.mkdirSync(root, { recursive: true });

function inputSchema(actor) {
  return {
    title: `${actor.name} Input`,
    type: 'object',
    schemaVersion: 1,
    properties: {
      queries: { title: 'Search queries / business names', type: 'array', editor: 'stringList', default: [] },
      urls: { title: 'Website URLs', type: 'array', editor: 'stringList', default: [] },
      niche: { title: 'Business niche', type: 'string', editor: 'textfield', default: 'roofing' },
      city: { title: 'City', type: 'string', editor: 'textfield', default: 'Miami' },
      country: { title: 'Country', type: 'string', editor: 'textfield', default: 'US' },
      maxResults: { title: 'Max results', type: 'integer', editor: 'number', default: 50, minimum: 1, maximum: 500 },
      useCrawler: { title: 'Crawl provided URLs', type: 'boolean', editor: 'checkbox', default: false }
    }
  };
}

function mockAnalyzeCode(actor) {
  return `export const config = {
  name: ${JSON.stringify(actor.name)},
  slug: ${JSON.stringify(actor.slug)},
  recommendedOffer: ${JSON.stringify(actor.recommendedOffer)},
  nextAction: ${JSON.stringify(actor.nextAction)},
  mockAnalyze(input = {}) {
    const text = JSON.stringify(input).toLowerCase();
    const weakWebsite = text.includes('wordpress') || text.includes('wix') || text.includes('old') || text.includes('slow');
    const hasWebsite = Boolean(input.website);
    const hasIntent = text.includes('hiring') || text.includes('ads') || text.includes('growth') || text.includes('expansion');
    return {
      category: ${JSON.stringify(actor.category)},
      findings: [
        weakWebsite ? 'Website appears to need modernization' : 'No critical website weakness detected from initial input',
        hasIntent ? 'High-intent growth signal detected' : 'Intent signal requires enrichment',
        hasWebsite ? 'Website available for crawling/enrichment' : 'Website missing or not provided'
      ],
      scores: {
        websiteScore: weakWebsite ? 85 : hasWebsite ? 65 : 35,
        socialScore: 55,
        intentScore: hasIntent ? 90 : 50,
        reviewsScore: 60,
        contactScore: hasWebsite ? 70 : 40
      }
    };
  }
};
`;
}

for (const actor of actors) {
  const dir = path.join(root, actor.id);
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.actor'), { recursive: true });

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: actor.slug,
    version: '0.1.0',
    type: 'module',
    scripts: { start: 'node src/main.js' },
    dependencies: { apify: '^3.2.6', crawlee: '^3.10.5' }
  }, null, 2));

  fs.writeFileSync(path.join(dir, 'Dockerfile'), `FROM apify/actor-node:20\nCOPY package*.json ./\nRUN npm install --omit=dev\nCOPY . ./\nCMD ["npm", "start"]\n`);

  fs.writeFileSync(path.join(dir, '.actor/actor.json'), JSON.stringify({
    actorSpecification: 1,
    name: actor.slug,
    title: actor.name,
    description: actor.description,
    version: '0.1',
    dockerfile: './Dockerfile',
    input: './INPUT_SCHEMA.json'
  }, null, 2));

  fs.writeFileSync(path.join(dir, '.actor/INPUT_SCHEMA.json'), JSON.stringify(inputSchema(actor), null, 2));

  fs.writeFileSync(path.join(dir, 'src/config.js'), mockAnalyzeCode(actor));
  fs.writeFileSync(path.join(dir, 'src/main.js'), `import { runGenericLeadActor } from '../../../shared/actor-runner.js';\nimport { config } from './config.js';\n\nawait runGenericLeadActor(config);\n`);

  fs.writeFileSync(path.join(dir, 'README.md'), `# ${actor.name}\n\n${actor.description}\n\n## Category\n${actor.category}\n\n## Recommended offer\n${actor.recommendedOffer}\n\n## Next action\n${actor.nextAction}\n\n## Run locally\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n\n## Deploy to Apify\n\n\`\`\`bash\napify login\napify push\n\`\`\`\n`);
}

console.log(`Generated ${actors.length} actors.`);
