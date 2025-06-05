import { NextRequest, NextResponse } from 'next/server';
import { API_KEYS } from '@/lib/constants';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    // Validate required fields
    if (!body.model || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Missing required fields: model and messages' },
        { status: 400 }
      );
    }    // Get API key from environment or use default
    const apiKey = process.env.OPENROUTER_API_KEY || API_KEYS.OPENROUTER;

    // Determine HTTP-Referer
    const referer = process.env.OPENROUTER_HTTP_REFERER || 
                   request.headers.get('origin') || 
                   process.env.NEXT_PUBLIC_APP_URL || 
                   'http://localhost:3000';// Prepare the request to OpenRouter
    const openRouterRequest = {
      model: body.model,
      messages: body.messages,
      temperature: body.temperature || 0.7,
      top_p: body.top_p || 1,
      max_tokens: body.max_tokens || 2048,
      stream: body.stream || false,
      ...(body.top_k && { top_k: body.top_k }),
    };

    // Make the request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': 'Chatbot Playground',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openRouterRequest),
    });    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Handle streaming response
    if (body.stream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
