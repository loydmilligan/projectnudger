# Project Nudger + M5Stack Dial Integration PRD

## Overview
Integrate the M5Stack Dial hardware with Project Nudger web app to create a seamless physical-digital Pomodoro experience, with hardware as the primary interface but full bidirectional control capability.

## Core Requirements

### User Experience Goals
- **Hardware-first approach:** Users primarily interact with M5 Dial for session control
- **Intelligent task assignment:** Hardware sessions can be associated with web app tasks
- **AI nudge integration:** Accept AI-recommended tasks directly from hardware
- **Multiple hardware modes:** Clock, Pomodoro, Stopwatch, Auto modes
- **Graceful offline operation:** Both devices work independently when disconnected

### Technical Requirements

#### Connection Management
- Manual BLE connection initiation from web app
- Long-press (5-10s) hardware button to enter "pairing mode"
- Connection status clearly displayed on both devices  
- Web app acts as parent in conflict resolution

#### Session Synchronization
- Hardware → Web: All hardware sessions visible in web app
- Web → Hardware: Web app can start/control hardware sessions
- Session data persists across disconnections
- AI nudges only trigger when both devices agree (no active session)

#### Hardware Modes
1. **Pomodoro Mode** (existing) - Standard 25/5 minute cycles
2. **Clock Mode** - Display time when not actively used
3. **Stopwatch Mode** - Freeform timing
4. **Auto Mode** - Configurable automatic session cycling

## Detailed Implementation Plan

### Phase 1: Foundation & Connection Management
**Goal:** Establish reliable BLE communication

#### 1.1 Web App BLE Service
**Todos:**
- [ ] Create `M5DialBLEService` class with connection management
- [ ] Add BLE connection UI to TopNavBar
  - [ ] Connection status indicator (connected/disconnected/pairing)
  - [ ] "Connect M5 Dial" button
  - [ ] Connection troubleshooting help text
- [ ] Handle Web Bluetooth API errors gracefully
  - [ ] Browser compatibility detection
  - [ ] HTTPS requirement notification
  - [ ] User permission handling

**Subtodos:**
- [ ] Implement connection retry logic with exponential backoff
- [ ] Add connection timeout handling (30 seconds max)
- [ ] Store last connected device ID in localStorage
- [ ] Create connection event logging for debugging

#### 1.2 Hardware Connection Features  
**Todos:**
- [ ] Add "pairing mode" triggered by long button press
  - [ ] Visual indicator (flashing LED pattern)
  - [ ] Audio confirmation beep
  - [ ] 60-second timeout for pairing mode
- [ ] Enhance BLE advertising with device info
  - [ ] Battery level in advertising data
  - [ ] Current mode in device name
- [ ] Add connection status display on hardware

**Subtodos:**
- [ ] Implement pairing mode state machine
- [ ] Add visual feedback during connection attempts
- [ ] Handle multiple connection requests gracefully

### Phase 2: Core Synchronization Engine
**Goal:** Reliable bidirectional state sync

#### 2.1 State Management Architecture
**Todos:**
- [ ] Design unified session state model
  ```javascript
  SessionState {
    id: string,
    source: 'hardware' | 'webapp',
    type: 'work' | 'break' | 'freeform',
    startTime: Date,
    duration: number,
    taskId?: string,
    mode: 'pomodoro' | 'stopwatch' | 'auto'
  }
  ```
- [ ] Implement conflict resolution system
  - [ ] Web app always wins in conflicts
  - [ ] Grace period (5 seconds) for simultaneous starts
  - [ ] Clear user feedback on conflict resolution

**Subtodos:**
- [ ] Create session state validator
- [ ] Add state change event logging
- [ ] Implement state rollback on sync failure
- [ ] Add state checksum for integrity verification

#### 2.2 Hardware → Web Synchronization
**Todos:**
- [ ] Parse hardware status JSON updates
- [ ] Update web app `activeSession` state
- [ ] Handle hardware mode changes
- [ ] Sync hardware-only sessions to task list

**Subtodos:**
- [ ] Implement status update rate limiting (max 1/second)
- [ ] Add hardware session to "unassigned sessions" queue
- [ ] Create session assignment UI modal
- [ ] Handle malformed hardware JSON gracefully

#### 2.3 Web → Hardware Synchronization  
**Todos:**
- [ ] Send session commands to hardware
- [ ] Push current recommended task to hardware
- [ ] Sync AI nudge recommendations
- [ ] Handle command acknowledgment/failure

**Subtodos:**
- [ ] Implement command queuing system
- [ ] Add command timeout and retry logic
- [ ] Create command success/failure notifications
- [ ] Handle hardware busy state (during songs/animations)

### Phase 3: Enhanced Features
**Goal:** Leverage integration for better UX

#### 3.1 AI Nudge Hardware Integration
**Todos:**
- [ ] Modify AI nudge trigger conditions
  - [ ] Skip when hardware session active
  - [ ] Check hardware connection status
- [ ] Add "Accept Task" functionality to hardware
  - [ ] Display task name on hardware screen
  - [ ] Single button press to accept and start
  - [ ] Send acceptance back to web app
- [ ] Implement nudge delivery to hardware
  - [ ] Send nudge text for scrolling display
  - [ ] Trigger hardware audio/visual alerts

**Subtodos:**
- [ ] Add task truncation for hardware display limits
- [ ] Implement nudge timeout (auto-dismiss after 2 minutes)
- [ ] Add nudge acceptance analytics
- [ ] Handle task unavailable error (task completed elsewhere)

#### 3.2 Multiple Hardware Modes
**Todos:**
- [ ] Implement Clock Mode
  - [ ] Display current time when idle
  - [ ] Configurable time format (12/24 hour)
  - [ ] Date display option
- [ ] Implement Stopwatch Mode  
  - [ ] Freeform timing with start/stop/reset
  - [ ] Session notes capability
  - [ ] Export to web app as unassigned session
- [ ] Implement Auto Mode
  - [ ] Configurable work/break durations
  - [ ] Automatic session cycling
  - [ ] Pause/resume entire cycle

**Subtodos:**
- [ ] Add mode switching UI on hardware
- [ ] Persist mode selection across power cycles
- [ ] Add mode-specific settings (auto-cycle count, etc.)
- [ ] Implement smooth transitions between modes

### Phase 4: Polish & Reliability
**Goal:** Production-ready integration

#### 4.1 Offline Operation & Reconnection
**Todos:**
- [ ] Handle disconnection during active sessions
  - [ ] Continue session independently on both devices
  - [ ] Sync session data on reconnection
  - [ ] Resolve time discrepancies
- [ ] Implement session queue for offline operations
- [ ] Add reconnection logic with user notification

**Subtodos:**
- [ ] Implement session data conflict resolution
- [ ] Add "sync in progress" UI indicators
- [ ] Handle partial sync failures gracefully
- [ ] Create offline session recovery system

#### 4.2 Error Handling & User Feedback
**Todos:**
- [ ] Comprehensive error message system
- [ ] Connection troubleshooting guide
- [ ] Hardware diagnostic information
- [ ] User feedback for all major operations

**Subtodos:**
- [ ] Add error reporting to console for debugging
- [ ] Implement user-friendly error translations
- [ ] Create connection health monitoring
- [ ] Add hardware battery level warnings

## Risk Mitigation Strategies

### Technical Risks
1. **State Desynchronization**
   - Mitigation: Implement checksums and periodic full state sync
   - Fallback: Manual sync button with conflict resolution UI

2. **BLE Connection Reliability**
   - Mitigation: Automatic reconnection attempts with exponential backoff
   - Fallback: Clear offline mode indicators and manual reconnection

3. **Web Bluetooth API Limitations**
   - Mitigation: Comprehensive browser compatibility detection
   - Fallback: Graceful degradation to web-only mode

4. **Complex State Management**
   - Mitigation: Single source of truth (web app) with hardware as display/input
   - Fallback: Independent operation modes with periodic sync

### User Experience Risks
1. **User Confusion About Control**
   - Mitigation: Clear visual indicators of which device is controlling
   - Fallback: Always show both device states side-by-side

2. **Session Data Loss**
   - Mitigation: Immediate persistence of all session events
   - Fallback: Session recovery dialog on reconnection

3. **Battery Life Impact**
   - Mitigation: Configurable BLE connection intervals
   - Fallback: Low-power mode with reduced sync frequency

## Success Metrics
- Connection success rate > 95%
- Session sync accuracy > 99%
- User preference for hardware vs web control
- AI nudge acceptance rate from hardware
- Session completion rate improvement

## Next Steps
1. Review and validate requirements with stakeholders
2. Create technical architecture document
3. Set up development environment for BLE testing
4. Begin Phase 1 implementation with basic connection management