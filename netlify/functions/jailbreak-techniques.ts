import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const techniques = [
    {
      id: 'roleplay',
      name: 'Roleplay Scenarios',
      description: 'Create fictional scenarios where AI takes on specific roles',
      risk_level: 'medium',
      effectiveness: 0.7
    },
    {
      id: 'hypothetical',
      name: 'Hypothetical Questions',
      description: 'Frame requests as hypothetical or theoretical discussions',
      risk_level: 'low',
      effectiveness: 0.5
    },
    {
      id: 'context_manipulation',
      name: 'Context Manipulation',
      description: 'Provide misleading context to frame harmful requests',
      risk_level: 'high',
      effectiveness: 0.8
    },
    {
      id: 'authority_impersonation',
      name: 'Authority Impersonation',
      description: 'Claim authority or expertise to bypass restrictions',
      risk_level: 'medium',
      effectiveness: 0.6
    }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ techniques }),
  };
};