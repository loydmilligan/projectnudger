# Project Nudger

An opinionated task management application designed to combat project neglect and procrastination through a weighted priority system and an escalating series of notifications.

## The Philosophy

Standard to-do list applications are passive. They dutifully record your tasks but do nothing to prevent older, important projects from languishing as you accumulate new ones. Project Nudger is built on a different principle: the system should actively guide you toward the most critical work. It operates as an accountability partner, making it difficult to ignore the projects that matter most but are easiest to defer.

By combining project age with a user-defined priority, the application calculates a "nudge score" to constantly surface the single most important task. Its multi-stage notification system, from gentle reminders to aggressive alerts, is designed to be a configurable but persistent force against procrastination.

## Key Features

*   **Priority-Weighted Task Recommendation:** The dashboard's primary feature is a recommendation engine that suggests the next task to work on, based on a weighted calculation of project priority and age.
*   **Integrated Pomodoro Timer:** Start a focus session for any task directly from the UI. The application tracks work and rest periods, logs session notes, and provides a dedicated tracking view.
*   **Multi-Screen Interface:**
    *   **Dashboard:** An at-a-glance view of the recommended task, current nudge status, and quick access to all projects.
    *   **Projects View:** A high-level overview of all projects, displaying metadata and upcoming tasks for each.
    *   **Tasks View:** A master list of every task across all projects, with robust filtering by project, tag, and due date.
*   **Configurable "Nudge" System:** A three-tiered notification system that escalates its intrusiveness based on your workload and project age. This can be set to automatic or manually overridden in the settings.
*   **Real-Time Database:** Built on Firebase's Firestore, all data is synced in real-time across any open sessions.
*   **Light & Dark Mode:** A theme toggle is available in the settings panel.

## Tech Stack

*   **Frontend:** React (with Hooks)
*   **Build Tool:** Vite
*   **Database & Auth:** Google Firebase (Firestore, Anonymous Authentication)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React

## Getting Started

To run this project locally, you will need Node.js and npm installed. The project uses Firebase for its backend, so a Firebase project is also required.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/project-nudger.git
    cd project-nudger
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Set Up Firebase:**
    *   Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    *   **Enable Authentication:** Go to the "Authentication" section, click "Get started," and enable the "Anonymous" sign-in provider.
    *   **Enable Firestore:** Go to the "Firestore Database" section, click "Create database," and start in **Production mode**. Choose a server location.
    *   **Get Config Keys:** In your Firebase project settings, find the configuration object for your web app. You will need these keys for the next step.
    *   **Update Firestore Rules:** In the Firestore "Rules" tab, replace the default rule with:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow users to read and write their own data under /artifacts/{appId}/users/{userId}
            match /artifacts/{appId}/users/{userId}/{document=**} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
          }
        }
        ```
        Publish the changes.

4.  **Create Local Environment File:**
    *   In the root of the project, create a file named `.env.local`.
    *   Populate this file with the configuration keys from your Firebase project. The `VITE_` prefix is required by Vite.
        ```env
        VITE_FIREBASE_API_KEY=YourActualApiKey
        VITE_FIREBASE_AUTH_DOMAIN=YourActualAuthDomain
        VITE_PROJECT_ID=YourActualProjectId
        VITE_STORAGE_BUCKET=YourActualStorageBucket
        VITE_MESSAGING_SENDER_ID=YourActualMessagingSenderId
        VITE_APP_ID=YourActualAppId
        ```
    *   The `.gitignore` file is already configured to prevent this file from being committed to your repository.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173/` (or the port specified by Vite, typically 5173 or 5174).

## Future Development

For planned features and future direction, please see the `ROADMAP.md` file in this repository.