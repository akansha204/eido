import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, paperContent, mode } = await req.json();

    if (!message || !paperContent || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an AI research assistant.

Use the following research paper content to answer the question.

Mode: ${mode}

Instructions:
* If beginner → explain in simple terms, avoid jargon, use analogies
* If technical → give detailed, precise, domain-specific explanations
* Base answers ONLY on the provided paper content

Paper Content:
${paperContent}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from LLM' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
