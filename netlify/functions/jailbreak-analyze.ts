import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { model_id, sample_responses = [] } = JSON.parse(event.body || '{}');

    if (!model_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'model_id is required' }),
      };
    }

    // Simple analysis logic
    const vulnerability_score = Math.random() * 0.3 + 0.4; // 0.4-0.7
    const techniques = ['roleplay', 'hypothetical', 'context_manipulation'];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        vulnerability_score,
        recommended_techniques: techniques,
        analysis: {
          model_id,
          response_count: sample_responses.length,
          analysis_method: 'netlify_function'
        }
      }),
    };
  } catch (error) {
    console.error('Error analyzing model:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};