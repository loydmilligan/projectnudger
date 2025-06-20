# Project Nudger: Product Roadmap

This document outlines the planned evolution of the Project Nudger application, from immediate quality-of-life improvements to long-term strategic features. Its purpose is to provide a clear vision for development and to prioritize work in a logical sequence.

## Current Nudging System Overview

Project Nudger's core differentiator is its intelligent nudging system that actively prevents project neglect. The current system includes:

**Nudge Triggers:**
- Project age thresholds (30+ days old, 90+ days very old)
- Active project count limits (5+ projects, 10+ projects)
- Task completion intervals that trigger notifications

**Current Nudge Actions:**
- Browser notifications with customizable messages
- ntfy.sh webhook integration for external notifications
- Text-to-speech announcements
- Dashboard status indicators

**Existing Nudge Profiles:**
- **Automatic:** System adjusts intensity based on workload analysis
- **Remember:** Gentle reminders every 10 completed tasks
- **Stay on Target:** Moderate nudging every 5 tasks, warns on new project creation
- **Lazy:** Aggressive intervention every 2 tasks, blocks new project creation

The roadmap below focuses heavily on expanding this nudging system as the application's key competitive advantage.

## Core Nudge System Features

*   **Nudge Profile Customization:** Expand beyond the current 4 modes (Auto, Remember, Stay on Target, Lazy) to allow users to create custom nudge profiles with personalized thresholds, intervals, and notification types. *(Effort: 4, Benefit: 4)*
*   **Project Nudge Factor:** Add a customizable "nudge factor" multiplier when creating projects (0.1 for low-priority projects like "3D models to print" vs 2.5 for critical projects like "apartment safety check"). *(Effort: 2, Benefit: 3)*
*   **Visual Nudging Components:** Add dashboard widgets that provide visual cues for project staleness:
    *   Project age timeline showing when nudges are scheduled
    *   Color-coded project cards with intensity based on staleness
    *   Progress bars highlighting near-completion projects that are languishing
    *(Effort: 3, Benefit: 3)*
*   **Completion-Factor Nudging:** Weight nudge intensity based on project completion percentage - projects that are 80%+ complete but stalled get more aggressive nudging to push them over the finish line. *(Effort: 3, Benefit: 4)*

## Advanced Nudge System

*   **Nudge Dashboard:** Create a dedicated "Nudge Insights" view with KPIs specifically designed to highlight project staleness:
    *   Stale project timeline with aging indicators and nudge history
    *   "Project Neglect Score" ranking showing which projects need immediate attention
    *   Overdue task heat map highlighting tasks past their due dates
    *   Near-completion project alerts (e.g., "3 projects are 90%+ complete but haven't been touched in 2 weeks")
    *(Effort: 4, Benefit: 3)*
*   **Adaptive Visual Nudging:** Implement progressive visual changes to the entire interface based on project staleness:
    *   Gradually shift color palette from pleasant to more jarring/attention-grabbing colors when projects exceed staleness thresholds
    *   Animated visual cues (pulsing, subtle shaking) for severely overdue items
    *   Dashboard background patterns that become more intrusive as neglect increases
    *(Effort: 4, Benefit: 3)*
*   **Smart Nudge Scheduling:** Move beyond simple interval-based nudging to context-aware notifications:
    *   Different nudge strategies for different times of day/week
    *   Integration with user's work patterns (less aggressive nudging during known busy periods)
    *   Escalating nudge sequences that adapt based on user response patterns
    *(Effort: 5, Benefit: 4)*

## User Interface & Experience

*   **Dedicated Settings Screen:** Migrate all settings from the modal to a full-screen, dedicated "Settings" view for a less-cramped user experience and to make room for future options. *(Effort: 2, Benefit: 3)*
*   **Project View Polish:** Refine the "Projects" view cards to show more detail at a glance, such as task counts (e.g., "5/12 complete") and a visual indicator for the project's age or priority. *(Effort: 2, Benefit: 4)*
*   **Visual Timer States:** Add more distinct visual cues to the Pomodoro timer, such as a color shift or pulsing animation when the timer is close to finishing. *(Effort: 2, Benefit: 2)*
*   **Empty State Improvements:** Enhance the "empty" views (e.g., no projects, no tasks) with more helpful text and clear calls-to-action to guide new users. *(Effort: 1, Benefit: 2)*
*   **Mobile Responsiveness:** Optimize the interface for mobile and tablet usage with touch-friendly controls and responsive layouts. *(Effort: 3, Benefit: 4)*
*   **Markdown Support:** Add markdown rendering to task descriptions, project details, and session notes for better formatting and readability. *(Effort: 3, Benefit: 2)*

## Alternative Views & Navigation

*   **Calendar View:** Display tasks and due dates in a traditional calendar interface with drag-and-drop scheduling. *(Effort: 4, Benefit: 3)*
*   **Kanban Board:** Implement board view for projects and tasks with customizable columns (To Do, In Progress, Review, Done). *(Effort: 4, Benefit: 3)*
*   **Session History Dashboard:** Dedicated view for browsing historical Pomodoro sessions, notes, and completion data with search and filtering. *(Effort: 3, Benefit: 4)*

## Task & Project Management

*   **Sub-Tasks:** Implement the ability to create nested sub-tasks under a parent task, with their own completion status. *(Effort: 3, Benefit: 3)*
*   **Task Reordering:** Allow users to manually drag and drop tasks within the "Project View" to set their priority. *(Effort: 2, Benefit: 2)*
*   **Project Templates:** Create reusable project templates with pre-defined tasks, due dates, and dependencies. Include built-in templates for common workflows:
    *   Software development project (planning, development, testing, deployment phases)
    *   Home improvement project (research, planning, execution, cleanup)
    *   Research project (literature review, data collection, analysis, writing)
    *(Effort: 4, Benefit: 5)*
*   **Project Attachments:** Allow file uploads and links to be attached to projects for reference materials and documentation. *(Effort: 3, Benefit: 3)*
*   **Project Archiving:** Instead of deleting old projects, allow users to "archive" them, removing them from the main views but keeping the data accessible in a separate "Archived Projects" area. *(Effort: 2, Benefit: 5)*
*   **Advanced Task Filtering:** In the "Tasks" view, add a full-text search box and the ability to filter by multiple tags simultaneously. *(Effort: 3, Benefit: 3)*
*   **Recurring Tasks:** Add the ability to create tasks that automatically repeat on a daily, weekly, or monthly basis. *(Effort: 3, Benefit: 4)*

## Pomodoro Timer & Session Management

*   **Improved Rest Timer:** Enhanced break timer with activity suggestions, breathing exercises, or light stretching reminders. *(Effort: 2, Benefit: 5)*
*   **Session Notes Visibility:** Create dedicated screens for viewing and editing session notes and completion notes with rich formatting. *(Effort: 3, Benefit: 4)*
*   **Custom Timer Sounds:** Allow users to choose from a selection of sounds (or upload their own) for the Pomodoro timer completion alert. *(Effort: 2, Benefit: 1)*

## Analytics & Gamification

*   **Nudge-Focused Challenges:** Implement achievement-based challenges that reward good nudge behavior:
    *   "Beat the Nudge" - complete a task within 1 hour of receiving a nudge notification
    *   "Nudge-Free Week" - go 7 days without receiving any nudges
    *   "Last Mile Hero" - complete 3 near-finished projects before they get nudged
    *(Effort: 3, Benefit: 4)*
*   **Pomodoro Gamification:** Add streak counters, session achievements, and productivity badges for timer usage. *(Effort: 3, Benefit: 3)*
*   **Productivity Dashboard:** Create a new "Reports" or "Stats" view that visualizes key performance indicators (KPIs):
    *   Chart of tasks completed over time (week/month)
    *   Breakdown of Pomodoro sessions by project or category
    *   "Most Productive Day" and "Most Focused Project" metrics
    *(Effort: 4, Benefit: 3)*
*   **Pomodoro Streaks:** Implement a "daily streak" counter on the dashboard that increments every day a user completes at least one Pomodoro session, encouraging consistent use. *(Effort: 2, Benefit: 3)*
*   **Achievements System:** Create a system of achievements or badges that are unlocked for hitting certain milestones (e.g., "Completed 100 tasks," "First 7-day streak," "Completed a project with over 50 tasks"). *(Effort: 3, Benefit: 5)*

## Data Management & Platform

*   **Data Export/Import:** Allow users to export their data (JSON/CSV) and import from other task management systems. *(Effort: 3, Benefit: 4)*
*   **Full User Accounts:** Move beyond anonymous authentication. Implement email/password and Google Sign-In to allow users to access their data across multiple devices securely without relying on a single browser session. *(Effort: 5, Benefit: 3)*
*   **Project Sharing (Read-Only):** Allow a user to generate a secret link to share a read-only view of a specific project's status and task list. *(Effort: 3, Benefit: 1)*

## Integrations

*   **Obsidian Plugin (High Priority):** Develop a community plugin for Obsidian that provides two-way synchronization:
    *   Create/update projects and tasks in Obsidian, and have them appear in the web app
    *   Complete tasks in the web app, and have the changes reflected in the corresponding Obsidian note (e.g., by checking a checkbox)
    *   Sync Pomodoro session notes from the web app back to the relevant task in Obsidian
    *(Effort: 5, Benefit: 5)*
*   **Calendar Integration (Read-Only):** Allow users to connect a Google Calendar or provide an iCal feed. Tasks with due dates will appear on this calendar, providing a high-level view of deadlines. *(Effort: 4, Benefit: 3)*
*   **Home Assistant Webhooks:** In the settings, allow users to define a webhook URL. The app would then send a POST request to this URL when a Pomodoro session starts, stops, or a task is completed, enabling home automation routines (e.g., change lighting during a focus session). *(Effort: 2, Benefit: 4)*
*   **Slack/Discord/Telegram Notifications:** Add the ability to send a notification to a specific Slack or Discord channel when a task is completed. *(Effort: 2, Benefit: 4)*

## Power User Features

*   **Command Palette:** Implement a command palette (accessible via Ctrl+K / Cmd+K) for power users to quickly navigate, create tasks, and start projects without using the mouse. *(Effort: 3, Benefit: 2)*