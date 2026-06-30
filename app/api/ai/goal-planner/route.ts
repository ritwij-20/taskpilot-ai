import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    strategy: {
      type: Type.STRING,
      description: "A comprehensive but concise execution strategy for achieving this goal.",
    },
    milestones: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A chronological list of 3-5 major milestones to track progress.",
    },
    estimatedWeeklyTime: {
      type: Type.STRING,
      description: "Estimated hours per week required, e.g., '5 hours/week'",
    },
    motivationQuote: {
      type: Type.STRING,
      description: "An inspiring quote relevant to the goal's category.",
    },
    deadlineWarning: {
      type: Type.STRING,
      description: "A short warning if the target date seems unrealistic for the goal. If realistic, return an empty string.",
    }
  },
  required: ["strategy", "milestones", "estimatedWeeklyTime", "motivationQuote", "deadlineWarning"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, targetDate } = body;

    const prompt = `
      Act as TaskPilot AI, an intelligent productivity and goal-setting coach.
      Analyze the following goal the user wants to achieve:
      Title: "${title}"
      Description: "${description || 'None'}"
      Category: "${category}"
      Target Date: "${targetDate || 'None provided'}"

      Generate a smart roadmap. Break it down into logical milestones, estimate weekly time commitments, and detect if the deadline is realistic.
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
    console.error('Error in goal-planner AI route:', error);
    return NextResponse.json({ error: 'Failed to generate goal roadmap' }, { status: 500 });
  }
}
