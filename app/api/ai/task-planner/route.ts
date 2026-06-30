import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestion: {
      type: Type.STRING,
      description: "A short, actionable insight or suggestion about how to tackle this task efficiently.",
    },
    subtasks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of logical subtasks (2-4 items) to break down the task, if applicable.",
    },
    priority: {
      type: Type.STRING,
      description: "Suggested priority: 'low', 'medium', 'high', or 'urgent'.",
    },
    estimatedTime: {
      type: Type.STRING,
      description: "Estimated time to complete, e.g., '30m', '2h', etc.",
    }
  },
  required: ["suggestion", "subtasks", "priority", "estimatedTime"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, priority } = body;

    const prompt = `
      Act as TaskPilot AI, an intelligent productivity coach.
      Analyze the following task the user wants to add:
      Title: "${title}"
      Description: "${description || 'None'}"
      Category: "${category}"
      Current Priority: "${priority}"

      Provide a smart breakdown of the task, suggest the best priority, estimate the time, and give a short coaching tip on how to execute it best.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    if (response.text) {
      return NextResponse.json(JSON.parse(response.text));
    }
    
    return NextResponse.json({ error: 'No output' }, { status: 500 });
  } catch (error) {
    console.error('Error in task-planner AI route:', error);
    return NextResponse.json({ error: 'Failed to generate task breakdown' }, { status: 500 });
  }
}
