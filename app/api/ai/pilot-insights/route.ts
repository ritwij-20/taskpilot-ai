import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendation: {
      type: Type.STRING,
      description: "A highly personalized, actionable, direct recommendation addressing the user's actual tasks, goals, and habits. Must explicitly reference specific titles of their tasks, goals, or habits. Do not use general placeholder advice or generic text.",
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed but concise coaching rationale of why this recommendation was given, referencing priority conflicts, deadline urgency, energy peaks, habit streak benefits, or burnout protection.",
    },
    badge: {
      type: Type.STRING,
      description: "A 2-3 word urgent indicator badge, e.g. 'Deadline Focus', 'Streak Alert', 'Optimal Window', 'Burnout Warning', 'Pace Ahead'.",
    },
    todaySchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Time range, e.g., '09:00 AM - 10:30 AM'" },
          activity: { type: Type.STRING, description: "Action or task title to focus on" },
          type: { type: Type.STRING, description: "Class: 'Focus Block', 'Habit Stack', 'Goal Progress', or 'Rest'" }
        },
        required: ["time", "activity", "type"]
      },
      description: "A 3-4 item timeline representing the optimal structured schedule for today."
    },
    productivityScoreTrend: {
      type: Type.STRING,
      description: "A brief phrase describing productivity score trajectory, e.g., '+15% boost expected', 'Streak on track'."
    }
  },
  required: ["recommendation", "explanation", "badge", "todaySchedule", "productivityScoreTrend"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tasks, habits, goals, localTime, userEmail } = body;

    const prompt = `
      Act as TaskPilot AI, an intelligent, premier productivity and cognitive optimization coach.
      Analyze the user's real-time productivity ecosystem:
      Current Date/Time: ${localTime || new Date().toISOString()}
      User Email: ${userEmail || 'Anonymous'}

      User Tasks:
      ${JSON.stringify(tasks || [], null, 2)}

      User Habits:
      ${JSON.stringify(habits || [], null, 2)}

      User Goals:
      ${JSON.stringify(goals || [], null, 2)}

      Analyze this data for:
      - Deadlines and urgencies (e.g., tasks with dueDate soon or marked 'urgent')
      - Overlap/Conflicts
      - Completion rates (completed vs pending work)
      - Habit building progress
      - Goal milestones and target days remaining
      - Burnout risks (too many high/urgent items)

      Generate a highly context-specific, professional coaching insight. It must reference actual task, habit, and goal titles.
      For example, instead of saying "work on your tasks", say "focus on your Data Structures homework".
      If the user has no tasks, habits, or goals, suggest a clean onboarding recommendation encouraging them to create their first task and habit to initiate the Pilot guidance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
    
    return NextResponse.json({ error: 'No response text' }, { status: 500 });
  } catch (error: any) {
    console.error('Error in pilot-insights AI route:', error);
    
    if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable due to high demand. Please try again later.',
        code: 429 
      }, { status: 429 });
    }

    return NextResponse.json({ error: 'Failed to generate productivity pilot insights' }, { status: 500 });
  }
}
