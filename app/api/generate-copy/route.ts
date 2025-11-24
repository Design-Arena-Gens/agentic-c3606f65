import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Use Claude API to analyze image and generate copy
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      // Return default suggestions if no API key
      return NextResponse.json({
        headline: 'Amazing Product!',
        subheadline: 'Get yours today and experience the difference',
        cta: 'Shop Now',
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: image.type,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `Analyze this product image and create compelling ad copy. Return ONLY a JSON object with this exact structure (no markdown, no backticks, just the JSON):
{
  "headline": "short catchy headline (max 30 characters)",
  "subheadline": "persuasive description (max 80 characters)",
  "cta": "call to action (max 15 characters)"
}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate copy');
    }

    const data = await response.json();
    const textContent = data.content[0].text;

    // Parse the JSON from the response
    let copyData;
    try {
      copyData = JSON.parse(textContent);
    } catch (e) {
      // If parsing fails, extract JSON from markdown code blocks
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        copyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response');
      }
    }

    return NextResponse.json(copyData);
  } catch (error) {
    console.error('Error generating copy:', error);

    // Return default suggestions on error
    return NextResponse.json({
      headline: 'Amazing Product!',
      subheadline: 'Get yours today and experience the difference',
      cta: 'Shop Now',
    });
  }
}
