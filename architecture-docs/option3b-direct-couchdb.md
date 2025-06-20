# Nudger-Obsidian Integration: Option 3B - Direct CouchDB Database Access

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

## Existing CouchDB Infrastructure

**Self-hosted LiveSync Setup**: Dockerized CouchDB instance providing robust synchronization services for Obsidian vault across multiple devices (phone and laptop).

**CouchDB Characteristics**:
- Document-based NoSQL database with strong consistency guarantees
- Built-in replication and conflict resolution capabilities
- RESTful HTTP API for direct database operations
- ACID compliance for reliable transaction processing
- Proven stability in existing multi-device synchronization environment

**Current Database Role**: Serves as central synchronization hub for Self-hosted LiveSync plugin, maintaining encrypted vault data and coordinating updates between authenticated devices.

## Proposed Solution: Direct CouchDB Database Access

**Note**: Technical details below are illustrative examples to convey implementation approach, not specific implementation requirements.

### Architecture Overview

Nudger writes data directly to the existing CouchDB instance, bypassing the LiveSync plugin protocol layer. This approach treats the CouchDB database as a shared data store that both Nudger and the LiveSync system can access independently.

### Major Implementation Steps

1. **Establish Direct CouchDB Connection**
   - Implement CouchDB HTTP client within Nudger application
   - Configure database authentication and connection management
   - Access the same CouchDB instance currently used by LiveSync infrastructure

2. **Reverse Engineer Data Format and Encryption**
   - Analyze existing CouchDB documents to understand LiveSync data structures
   - Decode Obsidian's encryption scheme used by Self-hosted LiveSync
   - Implement compatible encryption/decryption for new documents

3. **Data Transformation and Document Creation**
   - Convert Nudger Firebase data into CouchDB document format
   - Transform project and task information into Obsidian-compatible markdown structure
   - Create proper document metadata and revision tracking for CouchDB

4. **Database Operations and Conflict Management**
   - Implement database write operations using CouchDB's RESTful API
   - Handle document revisions and potential conflicts with existing LiveSync operations
   - Ensure data integrity and prevent corruption of existing vault data

### Data Flow

```
Nudger Firebase → Nudger CouchDB Client → CouchDB Database → LiveSync Plugin → Obsidian Vault
```

### Integration Points

- **CouchDB Instance**: Direct connection to existing dockerized CouchDB database
- **Document Format**: Native CouchDB documents matching LiveSync expectations
- **Encryption Layer**: Compatible encryption ensuring data can be decrypted by LiveSync plugin
- **Database API**: Standard CouchDB HTTP operations for document creation and updates

### Technical Considerations

**Encryption Reverse Engineering**: Requires understanding and implementing Self-hosted LiveSync's encryption methodology
**Data Format Compatibility**: Must exactly match LiveSync plugin's expected document structure and metadata
**Conflict Resolution**: Risk of creating conflicts between direct writes and LiveSync synchronization operations
**Database Integrity**: Potential for corrupting existing vault data if document format or operations are incorrect
**Authentication**: Need to properly authenticate with CouchDB instance without disrupting existing device access