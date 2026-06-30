# TaskPilot AI - Architecture & Roadmap

## Architecture
- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend/Database**: Firebase Authentication, Cloud Firestore
- **AI Integration**: Gemini API (Server-side Next.js API Routes)
- **Deployment**: Google Cloud Run (via AI Studio Export)

## Folder Structure
- `/app`
  - `/api/gemini`: API routes for AI interactions
  - `/(auth)`: Authentication pages (login, register)
  - `/(dashboard)`: Protected dashboard routes
- `/components`
  - `/ui`: Reusable UI components (shadcn/ui)
  - `/auth`: Auth forms
  - `/dashboard`: Bento grid components, task lists, charts
  - `/chat`: Pilot Chat interface
- `/lib`: Utility functions, Firebase initialization
- `/contexts`: Global state (AuthContext)
- `/hooks`: Custom React hooks
- `/types`: TypeScript interfaces (User, Task, Habit, Goal)

## Firestore Database Schema
- `users/{userId}`: Profile data, preferences, AI context (e.g., peak energy hours).
- `tasks/{taskId}`: Task details, deadline, priority, status, `userId`.
- `habits/{habitId}`: Habit tracking data, completion logs, `userId`.
- `goals/{goalId}`: Goals, deadlines, milestones, progress, `userId`.
- `pilot_chat/{messageId}`: History of AI interactions for context, `userId`.

## Development Roadmap
- **Milestone 1**: Firebase Backend Setup, Authentication Flow (Email, Google, Guest), and App Navigation/Layout routing. *(Currently Active)*
- **Milestone 2**: Core Productivity Engine (Firestore CRUD for Tasks, Dashboard data integration).
- **Milestone 3**: AI Pilot Integration (Gemini API for Pilot Chat and Smart Insights based on user data).
- **Milestone 4**: Habits, Goals, and Analytics implementation.
- **Milestone 5**: Settings, Profile, Final Polish, and Responsive refinements.
