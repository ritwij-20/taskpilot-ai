import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { text: "Gemini API key is missing. Please configure it in the environment variables." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format context for the AI
    const systemInstruction = `You are "Pilot", an intelligent, proactive productivity coach for the "TaskPilot AI" app.
Your goal is to help the user plan, prioritize, schedule, and complete tasks before deadlines are missed.
Do not generate generic productivity advice. Always analyze the user's actual data when providing recommendations.
Keep your tone professional, encouraging, and concise.

User's Data Context:
Tasks: ${JSON.stringify(context.tasks || [])}
Habits: ${JSON.stringify(context.habits || [])}
Goals: ${JSON.stringify(context.goals || [])}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { text: "I encountered an error while processing your request. Please try again." },
      { status: 500 }
    );
  }
}
