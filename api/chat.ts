import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createOpenRouterClient, OPENROUTER_MODELS } from '../lib/openrouter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, materialIds } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const client = createOpenRouterClient();

    const systemPrompt = `You are EduVoice AI, a helpful educational assistant. You explain concepts clearly and can create visual mind maps. Always respond in an educational and supportive manner.
      
${context ? `Context from uploaded materials:\n${context}\n\n` : ''}
      
Respond with helpful educational content. If the user asks about creating a mind map or visual representation, mention that you can help visualize the concepts on the 3D canvas.`;

    const response = await client.chat({
      model: OPENROUTER_MODELS.CHAT,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiMessage = response.choices[0].message.content;

    res.status(200).json({
      response: aiMessage,
      model: response.model,
      materialIds: materialIds || [],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process chat',
    });
  }
}
