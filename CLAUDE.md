# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Run linting:**
```bash
npm run lint
```

**Preview production build:**
```bash
npm run preview
```

## Application Architecture

Project Nudger is a single-page React application built with Vite that implements an opinionated task management system with Firebase backend.

### Core Architecture

- **Modular Component Structure**: Application is organized into separate view, layout, and shared components
- **Firebase Integration**: Uses Firestore for real-time data synchronization and anonymous authentication
- **State Management**: React hooks with local state management (no external state library)
- **Styling**: Tailwind CSS with custom HSL color generation for project categories
- **Real-time Features**: Firestore listeners for live data updates across all views

### Component Organization

- **`src/App.jsx`**: Main application component containing core state management and routing logic
- **`src/components/views/`**: Screen-level components (DashboardView, ProjectsView, TasksView, etc.)
- **`src/components/layout/`**: Navigation and layout components (TopNavBar, NudgerLogo)
- **`src/components/shared/`**: Reusable components used across views (TaskItem, ProjectFilters, etc.)
- **`src/config/`**: Configuration files (Firebase setup, constants)
- **`src/utils/`**: Helper functions and utilities

### Key Systems

**Nudge System**: Core feature that calculates "nudge scores" based on project age and priority to surface the most important neglected tasks. Has four levels (NONE, REMEMBER, STAY_ON_TARGET, LAZY) with configurable notification intervals.

**Pomodoro Timer**: Integrated focus sessions with work (25min) and break periods (5min/10min). Sessions are stored in Firebase and persist across browser refreshes.

**Project Prioritization**: Uses weighted scoring algorithm combining project priority (1-10) and age in days to recommend next tasks.

**Multi-Modal Notifications**: Supports browser notifications, speech synthesis, and external ntfy.sh webhooks.

### Data Structure

Firebase collections under `artifacts/{appId}/users/{userId}/`:
- `projects/` - Project documents with name, category, priority, url, createdAt
- `tasks/` - Task documents with projectId, title, detail, status, tags, dueDate, sessions array
- `settings/config` - User preferences (nudgeMode, theme, ntfyUrl, totalTasksCompleted)
- `settings/categories` - Category-to-color mappings (auto-generated HSL colors)
- `tracking/activeSession` - Current timer session state

### Views and Navigation

- **Dashboard**: Recommendation engine, nudge status, project quick-select
- **Projects**: Grid view of all projects with task previews
- **Tasks**: Master list with filtering by project, tag, and due date
- **Tracking**: Full-screen timer interface (appears when session is active)
- **Project Detail**: Individual project view with task management

### Environment Setup

Requires Firebase configuration in `.env.local`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_PROJECT_ID=
VITE_STORAGE_BUCKET=
VITE_MESSAGING_SENDER_ID=
VITE_APP_ID=
```

Firebase setup requires:
- Anonymous authentication enabled
- Firestore database in production mode
- Security rules allowing user access to their own data under the artifacts structure

### Code Conventions

- Uses React functional components with hooks exclusively
- Follows camelCase for variables and functions
- Uses Pascal case for component names
- Inline styles for dynamic colors (HSL values from database)
- Tailwind utility classes for all other styling
- Firebase operations are async/await with error handling
- Real-time listeners established in useEffect with proper cleanup