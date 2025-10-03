import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createOpenRouterClient, OPENROUTER_MODELS } from '../lib/openrouter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const client = createOpenRouterClient();

    const response = await client.chat({
      model: OPENROUTER_MODELS.VISION,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and extract any text, equations, diagrams, or educational content. Describe what you see in detail. If there are math equations, provide them in LaTeX format. If there are diagrams, describe their structure and relationships.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const analysis = response.choices[0].message.content;

    res.status(200).json({
      analysis,
      model: response.model,
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    });
  }
}
