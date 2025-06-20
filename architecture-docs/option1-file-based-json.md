# Nudger-Obsidian Integration: Option 1 - File-Based JSON Export/Import

## Project Overview

**Project Nudger** is an opinionated task management application designed to combat project neglect and procrastination through an intelligent weighted priority system and escalating notification framework. The core philosophy is that standard to-do applications are passive, while Project Nudger actively guides users toward critical work that might otherwise languish.

### Unique Architecture
- **Single-file monolith**: Entire application contained in one 855-line React component (`src/App.jsx`)
- **Frontend-heavy design**: Minimal backend logic, maximum client-side functionality
- **Firebase backend**: Leverages Firestore for real-time data sync and anonymous authentication
- **Real-time reactive**: Uses Firebase listeners for live data updates across sessions

## Directory Structure

```
Project Nudger/
├── public/
│   └── vite.svg                    # Default Vite icon
├── src/
│   ├── App.jsx                     # CORE: Entire application logic (855 lines)
│   ├── main.jsx                    # React entry point
│   ├── index.css                   # Global styles and Tailwind imports
│   └── assets/
│       └── react.svg               # React logo asset
├── index.html                      # Main HTML template
├── login.html                      # Standalone login page
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Dependency lock file
├── vite.config.js                  # Vite build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint configuration
├── README.md                       # Project documentation
├── ROADMAP.md                      # Feature roadmap with effort/benefit analysis
├── CLAUDE.md                       # AI assistant guidance
└── nudger-export-2025-06-19.json   # Sample data export
```

### Key Files Explained

- **`src/App.jsx`**: The entire application - components, state management, Firebase operations, and UI logic in one file
- **`package.json`**: Defines React 19, Firebase 11.9, Vite build system, Tailwind CSS, and Lucide React icons
- **`vite.config.js`**: Configures React plugin and ESNext build target for modern JavaScript
- **Firebase configuration**: Embedded in App.jsx, uses environment variables for API keys

## Tech Stack

**Frontend Framework**: React 19.1.0 with functional components and hooks exclusively
**Build Tool**: Vite 6.3.5 for fast development and optimized production builds  
**Styling**: Tailwind CSS 3.4.0 with custom HSL color generation and dark mode support
**Icons**: Lucide React 0.517.0 for consistent iconography
**Backend**: Google Firebase (Firestore + Anonymous Authentication)
**Database**: Firestore with real-time listeners and structured collections
**Deployment**: Static site deployment (Vite build output)

## Current Core Features

**Intelligent Task Recommendation**: Weighted algorithm combining project priority (1-10) and age in days to surface most critical neglected work
**Multi-Level Nudge System**: Four modes (Automatic, Remember, Stay on Target, Lazy) with escalating notification strategies
**Integrated Pomodoro Timer**: 25-minute work sessions with 5/10-minute breaks, session logging, and break management
**Real-time Data Sync**: Firebase listeners ensure immediate updates across browser sessions
**Project-Based Organization**: Tasks grouped under projects with categories, priorities, and visual color coding
**Multi-Modal Notifications**: Browser notifications, speech synthesis, and external webhook support (ntfy.sh)

## Current High-Priority Roadmap Items

1. **Improved Rest Timer** (Effort: 2, Benefit: 5) - Essential for functional Pomodoro system
2. **Project Archiving** (Effort: 2, Benefit: 5) - Critical data management for long-term users
3. **Achievements System** (Effort: 3, Benefit: 5) - Major motivational enhancement
4. **Project Templates** (Effort: 4, Benefit: 5) - Significant workflow improvement
5. **Mobile Responsiveness** (Effort: 3, Benefit: 4) - Essential for modern usage patterns

## Integration Objective

**Goal**: Establish one-way synchronization from Nudger to Obsidian to enable note-taking, project planning, and task management within the Obsidian ecosystem while maintaining Nudger as the source of truth for task completion and time tracking.

**Success Criteria**:
- Reliable data transfer with minimal failure points
- Automated synchronization requiring minimal manual intervention
- Current data representation in Obsidian (reasonable staleness tolerance)
- Intuitive user experience in both applications

## Proposed Solution: File-Based JSON Export/Import

**Note**: Technical details below are illustrative examples to convey implementation approach, not specific implementation requirements.

### Architecture Overview

Nudger exports structured JSON data to a shared directory accessible by both applications. An Obsidian plugin monitors this directory and imports/processes the data into readable note format.

### Major Implementation Steps

1. **Enhance Existing Export Functionality**
   - Extend current JSON export feature to support automated/scheduled exports
   - Add file writing to shared directory (e.g., `/mnt/c/Users/mmariani/Documents/Obsidian/obsMM/Nudger/`)
   - Include export timestamping and versioning for conflict detection

2. **Create Obsidian Import Plugin**
   - Develop community plugin using Obsidian's plugin API
   - Implement file watching/polling mechanism for new exports
   - Parse JSON structure into Obsidian-compatible markdown format

3. **Data Processing and Note Generation**
   - Transform project data into individual markdown files
   - Generate consolidated views using Obsidian's Dataview plugin
   - Maintain metadata in frontmatter for querying and organization

4. **Automation and Scheduling**
   - Implement configurable export triggers (time-based, change-based, manual)
   - Add error handling and retry logic for file operations
   - Provide user feedback and status reporting

### Data Flow

```
Nudger Firebase → Nudger Export → Shared Directory → Obsidian Plugin → Obsidian Vault
```

### Integration Points

- **Shared directory**: `/mnt/c/Users/mmariani/Documents/Obsidian/obsMM/Nudger/`
- **Export format**: Enhanced version of existing JSON structure
- **Obsidian representation**: Individual project notes with Dataview integration
- **Update mechanism**: File-based polling or file system watching

### Technical Considerations

**File System Dependencies**: Requires reliable cross-platform file access between WSL and Windows
**Timing Coordination**: Need to determine optimal export frequency vs. data currency requirements
**Error Handling**: File permission issues, disk space limitations, and concurrent access scenarios
**Data Consistency**: Handling partial writes and ensuring atomic file operations