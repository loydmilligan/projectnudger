# Project Nudger: Product Roadmap

This document outlines the planned evolution of the Project Nudger application, from immediate quality-of-life improvements to long-term strategic features. Its purpose is to provide a clear vision for development and to prioritize work in a logical sequence.

## Phase 1: Now (Immediate Priorities)

This phase focuses on solidifying the current feature set, improving usability, and addressing core user requests.

### UI/UX Refinements

*   **Dedicated Settings Screen:** Migrate all settings from the modal to a full-screen, dedicated "Settings" view for a less-cramped user experience and to make room for future options.
*   **Project View Polish:** Refine the "Projects" view cards to show more detail at a glance, such as task counts (e.g., "5/12 complete") and a visual indicator for the project's age or priority.
*   **Visual Timer States:** Add more distinct visual cues to the Pomodoro timer, such as a color shift or pulsing animation when the timer is close to finishing.
*   **Empty State Improvements:** Enhance the "empty" views (e.g., no projects, no tasks) with more helpful text and clear calls-to-action to guide new users.

### Core Features

*   **Sub-Tasks:** Implement the ability to create nested sub-tasks under a parent task, with their own completion status.
*   **Task Reordering:** Allow users to manually drag and drop tasks within the "Project View" to set their priority.

## Phase 2: Next (Near-Term Goals)

This phase focuses on expanding the core functionality and introducing the most requested integrations and analytics features.

### Integrations

*   **Obsidian Plugin (High Priority):** Develop a community plugin for Obsidian that provides two-way synchronization.
    *   Create/update projects and tasks in Obsidian, and have them appear in the web app.
    *   Complete tasks in the web app, and have the changes reflected in the corresponding Obsidian note (e.g., by checking a checkbox).
    *   Sync Pomodoro session notes from the web app back to the relevant task in Obsidian.
*   **Calendar Integration (Read-Only):** Allow users to connect a Google Calendar or provide an iCal feed. Tasks with due dates will appear on this calendar, providing a high-level view of deadlines.

### Analytics & Gamification (KPIs)

*   **Productivity Dashboard:** Create a new "Reports" or "Stats" view that visualizes key performance indicators (KPIs).
    *   Chart of tasks completed over time (week/month).
    *   Breakdown of Pomodoro sessions by project or category.
    *   "Most Productive Day" and "Most Focused Project" metrics.
*   **Pomodoro Streaks:** Implement a "daily streak" counter on the dashboard that increments every day a user completes at least one Pomodoro session, encouraging consistent use.

### Core Features

*   **Project Archiving:** Instead of deleting old projects, allow users to "archive" them, removing them from the main views but keeping the data accessible in a separate "Archived Projects" area.
*   **Advanced Task Filtering:** In the "Tasks" view, add a full-text search box and the ability to filter by multiple tags simultaneously.
*   **Recurring Tasks:** Add the ability to create tasks that automatically repeat on a daily, weekly, or monthly basis.

## Phase 3: Later (Future Vision)

This phase focuses on expanding the platform's reach, adding advanced features, and improving security and collaboration.

### Security & Collaboration

*   **Full User Accounts:** Move beyond anonymous authentication. Implement email/password and Google Sign-In to allow users to access their data across multiple devices securely without relying on a single browser session.
*   **Project Sharing (Read-Only):** Allow a user to generate a secret link to share a read-only view of a specific project's status and task list.

### Advanced Features

*   **Project Templates:** Allow users to create "template" projects with a pre-defined set of tasks, which can be used to quickly start new, similar projects.
*   **Command Palette:** Implement a command palette (accessible via Ctrl+K / Cmd+K) for power users to quickly navigate, create tasks, and start projects without using the mouse.
*   **Custom Timer Sounds:** Allow users to choose from a selection of sounds (or upload their own) for the Pomodoro timer completion alert.

### Integrations

*   **Home Assistant Webhooks:** In the settings, allow users to define a webhook URL. The app would then send a POST request to this URL when a Pomodoro session starts, stops, or a task is completed, enabling home automation routines (e.g., change lighting during a focus session).
*   **Slack/Discord Notifications:** Add the ability to send a notification to a specific Slack or Discord channel when a task is completed.

### Gamification

*   **Achievements System:** Create a system of achievements or badges that are unlocked for hitting certain milestones (e.g., "Completed 100 tasks," "First 7-day streak," "Completed a project with over 50 tasks").