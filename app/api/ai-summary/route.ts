import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { title, description, apiKey } = await request.json();

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  const prompt = `You are a concise financial analyst. Given this news article, provide exactly 3 bullet points of key insights for investors. Be brief and factual.

Title: ${title}
Summary: ${description || '(no summary available)'}

Respond with ONLY 3 bullet points (• symbol), no intro or closing text.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message ?? `Anthropic error ${res.status}`;
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? '';

  return NextResponse.json({ summary: text });
}
