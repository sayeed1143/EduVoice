import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createOpenRouterClient, OPENROUTER_MODELS } from '../lib/openrouter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, content, difficulty = 'medium', numQuestions = 10, materialIds } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const client = createOpenRouterClient();

    const prompt = `Generate ${numQuestions} ${difficulty} level quiz questions about "${topic}" based on the provided content. 

${content ? `Content:\n${content}\n\n` : ''}

Return a JSON object with this structure:
{
  "questions": [
    {
      "id": "unique_id",
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct"
    }
  ]
}

Make sure questions are educational, accurate, and test understanding of key concepts.`;

    const response = await client.chat({
      model: OPENROUTER_MODELS.REASONING,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const quizData = JSON.parse(response.choices[0].message.content || '{}');

    res.status(200).json({
      quiz: {
        title: `${topic} - Quiz`,
        questions: quizData.questions || [],
        difficulty,
        materialIds: materialIds || [],
      },
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate quiz',
    });
  }
}
