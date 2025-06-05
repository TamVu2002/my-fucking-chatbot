import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get techniques from Python service
    const pythonServiceUrl = process.env.JAILBREAK_SERVICE_URL || 'http://127.0.0.1:8000';
    
    const response = await fetch(`${pythonServiceUrl}/techniques`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json(result);
    }  } catch {
    console.warn('Python service unavailable, using fallback techniques');
  }

  // Fallback techniques list
  return NextResponse.json({
    techniques: [
      {
        name: "cognitive_bias",
        description: "Exploits cognitive biases in AI training",
        effectiveness: "high",
        complexity: "medium"
      },
      {
        name: "roleplay",
        description: "Uses fictional scenarios and character roleplay",
        effectiveness: "high",
        complexity: "low"
      },
      {
        name: "token_smuggling",
        description: "Encodes prompts to avoid detection",
        effectiveness: "medium",
        complexity: "medium"
      },
      {
        name: "semantic",
        description: "Generates semantic variations of prompts",
        effectiveness: "medium",
        complexity: "high"
      },
      {
        name: "multi_step",
        description: "Multi-turn conversation attacks",
        effectiveness: "very_high",
        complexity: "high"
      }
    ],
    fallback_mode: true
  });
}
