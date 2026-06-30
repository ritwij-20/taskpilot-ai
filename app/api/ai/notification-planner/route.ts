import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const { task, userContext } = await req.json();

  const prompt = `
    You are TaskPilot AI, an intelligent productivity coach.
    Analyze this task and user context to determine the optimal reminder schedule.
    
    Task: ${JSON.stringify(task)}
    User Context: ${JSON.stringify(userContext)}
    
    Return ONLY a JSON array of ISO strings representing the times to send reminders.
    Example: ["2026-06-30T10:00:00Z", "2026-06-30T14:30:00Z"]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  try {
    const reminders = JSON.parse(response.text || "[]");
    return NextResponse.json({ reminders });
  } catch (e) {
    return NextResponse.json({ reminders: [] });
  }
}
