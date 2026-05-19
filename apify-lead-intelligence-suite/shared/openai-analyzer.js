import OpenAI from 'openai';

export async function analyzeLeadWithAI({ lead, actorName, model = 'gpt-4.1-mini' }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ai_enabled: false,
      summary: 'OPENAI_API_KEY not configured. Using deterministic scoring only.',
      sales_angle: lead?.recommended_offer || 'Offer website automation and lead capture improvements.',
      risk_notes: []
    };
  }

  const client = new OpenAI({ apiKey });
  const prompt = `You are a B2B lead intelligence analyst for an automation agency. Analyze this lead for ${actorName}. Return JSON only with: summary, pain_points, sales_angle, recommended_offer, urgency, objections, first_message. Lead: ${JSON.stringify(lead)}`;

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Return valid compact JSON only.' },
      { role: 'user', content: prompt }
    ]
  });

  try {
    return {
      ai_enabled: true,
      ...JSON.parse(response.choices[0].message.content)
    };
  } catch {
    return {
      ai_enabled: true,
      raw_analysis: response.choices[0].message.content
    };
  }
}
