import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    habitLoop: {
      type: Type.STRING,
      description: "A short, actionable strategy describing the Cue, Routine, and Reward for this habit.",
    },
    achievableTarget: {
      type: Type.STRING,
      description: "A recommended achievable target to start with so the user doesn't burn out.",
    },
    reminderTime: {
      type: Type.STRING,
      description: "A suggested time of day for the reminder in HH:MM format (24-hour clock).",
    },
    motivationMessage: {
      type: Type.STRING,
      description: "A short, highly personalized and motivating message based on the habit.",
    },
    icon: {
      type: Type.STRING,
      description: "A single emoji that best represents this habit.",
    }
  },
  required: ["habitLoop", "achievableTarget", "reminderTime", "motivationMessage", "icon"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, frequency, difficulty } = body;

    const prompt = `
      Act as TaskPilot AI, an intelligent productivity and habit coach.
      Analyze the following habit the user wants to build:
      Name: "${title}"
      Description: "${description || 'None'}"
      Frequency: "${frequency}"
      Difficulty: "${difficulty}"

      Provide an actionable habit-building plan using the schema provided. Keep suggestions practical and scientifically grounded (e.g., atomic habits methodology).
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
    console.error('Error in habit-coach AI route:', error);
    return NextResponse.json({ error: 'Failed to generate habit plan' }, { status: 500 });
  }
}
