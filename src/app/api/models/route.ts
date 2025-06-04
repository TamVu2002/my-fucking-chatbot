import { NextResponse } from 'next/server';

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
    request?: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens?: number;
  };
}

interface CachedModels {
  data: OpenRouterModel[];
  timestamp: number;
}

let modelsCache: CachedModels | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  try {
    // Check if we have valid cached data
    if (modelsCache && Date.now() - modelsCache.timestamp < CACHE_DURATION) {
      const freeModels = modelsCache.data.filter(model => 
        parseFloat(model.pricing.prompt) === 0 && 
        parseFloat(model.pricing.completion) === 0 &&
        (!model.pricing.request || parseFloat(model.pricing.request) === 0)
      );
      return NextResponse.json({ data: freeModels });
    }

    // Fetch fresh data from OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const allModels: OpenRouterModel[] = result.data || [];

    // Cache the results
    modelsCache = {
      data: allModels,
      timestamp: Date.now(),
    };

    // Filter for free models
    const freeModels = allModels.filter(model => 
      parseFloat(model.pricing.prompt) === 0 && 
      parseFloat(model.pricing.completion) === 0 &&
      (!model.pricing.request || parseFloat(model.pricing.request) === 0)
    );

    return NextResponse.json({ data: freeModels });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
