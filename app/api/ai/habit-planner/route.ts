import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    successStrategy: {
      type: Type.STRING,
      description: "A concise, scientifically-backed strategy (like atomic habits or habit stacking) tailored to successfully building this specific habit.",
    },
    habitTrigger: {
      type: Type.STRING,
      description: "A suggested physical or time-based trigger for this habit (e.g., 'After brushing my teeth', 'At 8:00 AM at my desk').",
    },
    recommendedFrequency: {
      type: Type.STRING,
      description: "Recommended frequency: 'daily', 'weekdays', or 'weekly'.",
    },
    targetDays: {
      type: Type.INTEGER,
      description: "Suggested initial target streak in days (e.g., 21 or 30).",
    }
  },
  required: ["successStrategy", "habitTrigger", "recommendedFrequency", "targetDays"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, frequency } = body;

    const prompt = `
      Act as TaskPilot AI, an intelligent behavioral and habit coach.
      Analyze the following habit the user wants to build:
      Title: "${title}"
      Reason/Description: "${description || 'None'}"
      Current Frequency: "${frequency}"

      Generate a smart strategy to make this habit stick. Provide an actionable trigger, recommend the best frequency, and set a realistic initial streak target.
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
    console.error('Error in habit-planner AI route:', error);
    return NextResponse.json({ error: 'Failed to generate habit strategy' }, { status: 500 });
  }
}
