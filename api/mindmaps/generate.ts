import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createOpenRouterClient, OPENROUTER_MODELS } from '../lib/openrouter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, content, materialIds } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const client = createOpenRouterClient();

    const prompt = `Create a 3D mind map structure for the topic "${topic}" based on the following content. Return a JSON object with nodes and connections suitable for 3D visualization.

${content ? `Content:\n${content}\n\n` : ''}

Return the response in this JSON format:
{
  "nodes": [
    {
      "id": "unique_id",
      "label": "Node Label",
      "position": [x, y, z],
      "type": "central|branch|leaf",
      "color": "hex_color",
      "size": number
    }
  ],
  "connections": [
    {
      "from": "node_id",
      "to": "node_id",
      "label": "optional_connection_label",
      "strength": number
    }
  ]
}

Make the 3D layout interesting with nodes at different depths (z-axis) and create a visually appealing educational structure.`;

    const response = await client.chat({
      model: OPENROUTER_MODELS.REASONING,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 3000,
    });

    const mindMapData = JSON.parse(response.choices[0].message.content || '{}');

    res.status(200).json({
      mindMap: {
        title: `${topic} - 3D Mind Map`,
        nodes: mindMapData.nodes || [],
        connections: mindMapData.connections || [],
        materialIds: materialIds || [],
      },
    });
  } catch (error) {
    console.error('Mind map generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate mind map',
    });
  }
}
