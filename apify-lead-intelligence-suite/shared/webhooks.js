export async function sendToWebhook(payload, webhookUrl = process.env.CRM_WEBHOOK_URL) {
  if (!webhookUrl) {
    return { sent: false, reason: 'CRM_WEBHOOK_URL not configured' };
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return {
    sent: response.ok,
    status: response.status,
    statusText: response.statusText,
  };
}

export function buildCrmPayload({ lead, actor, aiAnalysis }) {
  return {
    source: 'apify-lead-intelligence-suite',
    actor,
    lead,
    aiAnalysis,
    routing: {
      priority: lead?.opportunity?.priority || 'MEDIUM',
      pipeline: 'AutoLeadsX Prospects',
      owner: 'sales-agent',
    },
    created_at: new Date().toISOString(),
  };
}
