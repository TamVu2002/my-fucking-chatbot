import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the Python jailbreak service
    const pythonServiceUrl = process.env.JAILBREAK_SERVICE_URL || 'http://127.0.0.1:8000';
    
    const response = await fetch(`${pythonServiceUrl}/analyze-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Fallback model analysis
      const modelId = body.model_id?.toLowerCase() || '';
      
      let filter_strength = 'medium';
      let vulnerability_score = 0.6;
      
      if (modelId.includes('claude') || modelId.includes('gpt-4')) {
        filter_strength = 'strong';
        vulnerability_score = 0.3;
      } else if (modelId.includes('free') || modelId.includes('uncensored')) {
        filter_strength = 'weak';
        vulnerability_score = 0.9;
      }

      return NextResponse.json({
        filter_strength,
        vulnerability_score,
        recommended_techniques: vulnerability_score > 0.7 
          ? ['roleplay', 'token_smuggling', 'cognitive_bias']
          : ['multi_step', 'semantic'],
        bypass_strategies: [
          'Use academic framing for legitimacy',
          'Employ multi-step conversation sequences',
          'Combine multiple techniques for better results'
        ],
        fallback_mode: true
      });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Model analysis API error:', error);
    
    return NextResponse.json({
      filter_strength: 'medium',
      vulnerability_score: 0.5,
      recommended_techniques: ['roleplay', 'semantic'],
      bypass_strategies: ['Use careful academic framing'],
      fallback_mode: true,
      error: true
    });
  }
}
