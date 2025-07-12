# Project Nudger - Task and Project Enhancements Task List
---
tags:
  - project
  - project-nudger
  - enhancement
status: active
priority: high
area: development
created: 2025-07-11
title: "Project Nudger - Task and Project Enhancements Task List"
---

# Project Nudger - Task and Project Enhancements Task List

## Development Workflow

**All tasks follow this manifest-driven workflow:**

1. **Process Task:** `claude-code process_task "Task-X.X"`
2. **Implement Task:** `claude-code implement_task "tasks/prepared/Task-X.X.json"`
3. **Check Task:** `claude-code check_task "Task-X.X"`
4. **Resolve Mismatches:** `claude-code resolve_mismatch "Task-X.X"` (if needed)
5. **Commit Task:** `claude-code commit_task "Task-X.X"`

## Phase 1: Core Task Functionality Fixes (High Priority)

### Task 1: Fix Universal Task Actions
**Priority:** Critical  
**Estimated Time:** 90 minutes  
**Dependencies:** None  
**Benefit Score:** 5 | **Complexity Score:** 6

**Description:** Fix bug where some tasks cannot be checked off or have timers started - ensure all task interaction buttons work consistently across all views and contexts.

**Actions:**
- [ ] **Task 1.1:** Audit TaskItem component usage across all views
  - Examine TaskItem component in DashboardView, ProjectsView, and TasksView
  - Document inconsistent prop passing patterns
  - Identify missing handlers or event propagation issues
- [ ] **Task 1.2:** Standardize task action handlers in App.jsx
  - Ensure completeTask, startTimer, and editTask functions are properly passed to all views
  - Add consistent error handling for all task actions
  - Verify Firebase update operations work correctly
- [ ] **Task 1.3:** Fix TaskItem component prop handling
  - Update TaskItem to handle missing props gracefully
  - Add proper default values for optional props
  - Ensure consistent button rendering across contexts
- [ ] **Task 1.4:** Test task interactions across all contexts
  - Test task completion in Dashboard, Projects, and Tasks views
  - Test timer start functionality in all locations
  - Test edit functionality from all task display contexts
- [ ] **Task 1.5:** Add error feedback for failed actions
  - Implement user notifications for failed task operations
  - Add loading states for asynchronous task operations
  - Handle network errors and Firebase permission issues

**Acceptance Criteria:**
- All task interaction buttons work in Dashboard, Projects, and Tasks views
- Task completion consistently updates Firebase and UI state
- Timer start functionality works from all task locations
- Edit functionality opens task modal from any context
- Users receive appropriate feedback for failed operations

### Task 2: Enhanced Due Date Filters
**Priority:** High  
**Estimated Time:** 75 minutes  
**Dependencies:** None  
**Benefit Score:** 4 | **Complexity Score:** 4

**Description:** Add "Past Due" and "Nudged" options to the due date filter dropdown to help users focus on urgent and neglected tasks.

**Actions:**
- [ ] **Task 2.1:** Extend due date filter options
  - Add "Past Due" and "Nudged" options to existing due date filter dropdown
  - Update filter UI in TasksView component
  - Maintain existing filter functionality
- [ ] **Task 2.2:** Implement past due detection logic
  - Create utility function to identify tasks with due dates before current date
  - Handle tasks with no due date appropriately
  - Add timezone-aware date comparison
- [ ] **Task 2.3:** Implement nudged task detection
  - Analyze existing nudge system in utils/aiNudgeService.js
  - Create logic to identify tasks that have been flagged by nudge system
  - Handle tasks with no nudge history
- [ ] **Task 2.4:** Update task filtering function
  - Modify existing task filtering logic to handle new filter types
  - Ensure filters work in combination (e.g., past due + specific project)
  - Test filter performance with large task lists
- [ ] **Task 2.5:** Add visual indicators for filtered tasks
  - Add visual cues for past due tasks (red indicators)
  - Add visual cues for nudged tasks (notification badges)
  - Ensure indicators are consistent across all views

**Acceptance Criteria:**
- "Past Due" filter shows only tasks with due dates before today
- "Nudged" filter shows only tasks that have been flagged by AI nudge system
- Filters work in combination with existing project and tag filters
- Visual indicators clearly identify past due and nudged tasks
- Filter performance remains responsive with large datasets

## Phase 2: Project Management Improvements

### Task 3: Project Action Buttons
### Task 3: Project Action Buttons
**Priority:** High  
**Estimated Time:** 60 minutes  
**Dependencies:** None  
**Benefit Score:** 4 | **Complexity Score:** 4

**Description:** Add edit, delete, and archive buttons to each project card for direct project management without navigating to separate views.

**Actions:**
- [ ] **Task 3.1:** Add action buttons to project cards
  - Add edit, delete, and archive buttons to ProjectsView cards
  - Use appropriate Lucide icons for each action
  - Position buttons for optimal UX without cluttering cards
- [ ] **Task 3.2:** Implement edit functionality
  - Connect edit button to existing ProjectModal component
  - Pre-populate modal with current project data
  - Ensure modal opens correctly from project card context
- [ ] **Task 3.3:** Implement delete functionality
  - Add confirmation modal for project deletion
  - Handle associated task cleanup when project is deleted
  - Update Firebase to remove project and dependent data
- [ ] **Task 3.4:** Implement archive functionality
  - Add project status field to Firebase data model if needed
  - Create archive toggle functionality
  - Update project display to respect archived status
- [ ] **Task 3.5:** Add proper error handling and feedback
  - Handle Firebase operation failures gracefully
  - Provide user feedback for successful operations
  - Add loading states for asynchronous operations

**Acceptance Criteria:**
- Edit button opens ProjectModal with existing project data
- Delete button shows confirmation and removes project and tasks
- Archive button toggles project status and updates display
- All actions provide appropriate user feedback
- Project cards maintain good visual layout with new buttons

### Task 4: Project URL Integration
**Priority:** Medium  
**Estimated Time:** 45 minutes  
**Dependencies:** None  
**Benefit Score:** 3 | **Complexity Score:** 2

**Description:** Display project URL as a clickable link on the project card when the URL field is populated.

**Actions:**
- [ ] **Task 4.1:** Add URL display logic to project cards
  - Check if project.url field exists and is valid
  - Add conditional rendering for URL display in ProjectsView
  - Ensure URL doesn't break card layout
- [ ] **Task 4.2:** Implement clickable link functionality
  - Make URLs clickable and open in new tab
  - Add external link icon to indicate link behavior
  - Handle various URL formats (with/without https://)
- [ ] **Task 4.3:** Add URL validation and formatting
  - Validate URL format before displaying
  - Add https:// prefix if missing
  - Handle invalid URLs gracefully
- [ ] **Task 4.4:** Style URL links appropriately
  - Use consistent styling for project URLs
  - Ensure links are visually distinct but not overwhelming
  - Test URL display on different card sizes

**Acceptance Criteria:**
- URLs display as clickable links when project.url field exists
- Links open in new tab with proper external link indication
- Invalid URLs are handled gracefully without breaking display
- URL styling is consistent and visually appropriate
- Links work correctly across different browsers

### Task 5: Optimize Project Card Layout
**Priority:** Medium  
**Estimated Time:** 45 minutes  
**Dependencies:** Task 3  
**Benefit Score:** 3 | **Complexity Score:** 3

**Description:** Reduce maximum size of project cards to eliminate excessive empty space and improve button proportions on desktop displays.

**Actions:**
- [ ] **Task 5.1:** Analyze current card sizing issues
  - Identify specific layout problems in ProjectsView
  - Document current card dimensions and spacing
  - Determine optimal card size for content
- [ ] **Task 5.2:** Adjust CSS grid and card sizing
  - Modify Tailwind classes for project card dimensions
  - Reduce maximum card width and height appropriately
  - Ensure cards remain functional on mobile devices
- [ ] **Task 5.3:** Optimize button sizing and spacing
  - Improve action button proportions within cards
  - Adjust padding and margins for better visual balance
  - Ensure buttons remain accessible on touch devices
- [ ] **Task 5.4:** Test responsive behavior
  - Verify card layout works on desktop, tablet, and mobile
  - Ensure content doesn't overflow or get cut off
  - Test with varying project name lengths and descriptions

**Acceptance Criteria:**
- Project cards are appropriately sized without excessive white space
- Action buttons are properly proportioned within cards
- Layout remains responsive across all device sizes
- Cards display content clearly without overflow issues
- Visual balance is improved on desktop displays

### Task 6: Task Completion Visual Indicator
**Priority:** High  
**Estimated Time:** 75 minutes  
**Dependencies:** None  
**Benefit Score:** 4 | **Complexity Score:** 5

**Description:** Show visual progress indicator for task completion ratio - projects with all tasks complete appear "full" with progress bars or completion percentages.

**Actions:**
- [ ] **Task 6.1:** Calculate task completion percentage
  - Create utility function to calculate completion ratio for each project
  - Handle projects with no tasks appropriately
  - Ensure calculation updates in real-time with task changes
- [ ] **Task 6.2:** Design progress bar component
  - Create reusable progress bar component with Tailwind CSS
  - Support different visual states (in-progress, complete, empty)
  - Make progress bar responsive and accessible
- [ ] **Task 6.3:** Integrate progress indicators into project cards
  - Add progress bar to project card layout in ProjectsView
  - Display completion percentage alongside progress bar
  - Ensure indicators don't disrupt existing card layout
- [ ] **Task 6.4:** Implement visual styling for completion states
  - Use different colors for various completion levels
  - Add special styling for fully completed projects
  - Include appropriate icons or badges for complete projects
- [ ] **Task 6.5:** Add progress indicators to other views
  - Include completion indicators in Dashboard project widgets
  - Ensure consistency across all project displays
  - Test performance with real-time updates

**Acceptance Criteria:**
- Progress bars accurately reflect task completion ratio
- Fully completed projects have distinct visual styling
- Progress indicators update in real-time as tasks are completed
- Visual styling is consistent across all project displays
- Performance remains good with large numbers of projects

### Task 7: Project View Polish
**Priority:** Medium  
**Estimated Time:** 90 minutes  
**Dependencies:** Task 6  
**Benefit Score:** 4 | **Complexity Score:** 4

**Description:** Refine the "Projects" view cards to show more detail at a glance, such as task counts and visual indicators for project age or priority.

**Actions:**
- [ ] **Task 7.1:** Add task count display
  - Show "X/Y complete" format on project cards
  - Calculate and display total task counts
  - Update counts in real-time as tasks change
- [ ] **Task 7.2:** Implement project age calculation and indicators
  - Calculate project age based on creation date
  - Create visual indicators for project age (colors, badges)
  - Use age information for visual priority cues
- [ ] **Task 7.3:** Add priority level indicators
  - Check if priority field exists in project data model
  - Display priority indicators with appropriate visual styling
  - Integrate priority with other visual indicators
- [ ] **Task 7.4:** Design enhanced card layout
  - Arrange new information elements for optimal readability
  - Ensure all information fits well within card constraints
  - Maintain visual hierarchy and clarity
- [ ] **Task 7.5:** Test information density and usability
  - Verify cards aren't overcrowded with information
  - Test readability across different screen sizes
  - Ensure new information adds value without cluttering

**Acceptance Criteria:**
- Task counts display clearly as "X/Y complete" format
- Project age is visually indicated with appropriate styling
- Priority levels are clearly distinguished if available
- Card layout remains clean and readable
- All new information updates in real-time

### Task 8: Clean Project Filter
**Priority:** Medium  
**Estimated Time:** 30 minutes  
**Dependencies:** None  
**Benefit Score:** 3 | **Complexity Score:** 3

**Description:** Remove inactive and archived projects from project filter dropdown by default to reduce clutter and improve usability.

**Actions:**
- [ ] **Task 8.1:** Identify project status filtering requirements
  - Determine how archived/inactive projects are marked in data
  - Analyze current project filter implementation in ProjectFilters component
  - Define what constitutes "active" vs "inactive" projects
- [ ] **Task 8.2:** Modify project filter dropdown logic
  - Update ProjectFilters component to filter out inactive projects
  - Maintain existing filter functionality for active projects
  - Ensure filter logic is performant
- [ ] **Task 8.3:** Add "Show All Projects" toggle option
  - Provide option for users to see archived projects when needed
  - Add toggle control to filter interface
  - Remember user preference for filter state
- [ ] **Task 8.4:** Test filter functionality
  - Verify active projects appear in filter dropdown
  - Test "Show All" toggle functionality
  - Ensure filter works correctly with other filtering options

**Acceptance Criteria:**
- Project filter dropdown shows only active projects by default
- Archived/inactive projects are hidden from filter by default
- "Show All Projects" option reveals archived projects when needed
- Filter performance remains good with large project datasets
- User preference for filter state is maintained

## Phase 3: Advanced Task Features

### Task 9: Task Drag & Drop Reordering
**Priority:** High  
**Estimated Time:** 120 minutes  
**Dependencies:** Task 1.1  
**Benefit Score:** 4 | **Complexity Score:** 7

**Description:** Allow tasks to be grabbed and reordered through drag and drop functionality within task lists.

**Actions:**
- [ ] **Subtask 3.1.1:** Install and configure drag-and-drop library
  - Choose between react-beautiful-dnd and @dnd-kit libraries
  - Install selected library and configure basic setup
  - Update package.json dependencies
- [ ] **Subtask 3.1.2:** Add task order field to data model
  - Add order/position field to task data structure in Firebase
  - Create migration logic for existing tasks without order
  - Ensure order field is maintained during task operations
- [ ] **Subtask 3.1.3:** Implement drag handles in TaskItem component
  - Add drag handle visual indicator to each task
  - Make TaskItem components draggable
  - Add appropriate drag and drop event handlers
- [ ] **Subtask 3.1.4:** Implement drag and drop functionality
  - Create onDragEnd handler to update task order
  - Update Firebase with new task ordering
  - Ensure real-time updates across multiple sessions
- [ ] **Subtask 3.1.5:** Add visual feedback during dragging
  - Show drag preview and drop zones
  - Add visual feedback for valid drop targets
  - Implement smooth animations for reordering
- [ ] **Subtask 3.1.6:** Test drag and drop across views
  - Test reordering in TasksView with filters active
  - Test reordering within project task lists
  - Ensure dragging works on both desktop and mobile

**Acceptance Criteria:**
- Tasks can be dragged and dropped to reorder within lists
- Task order persists in Firebase and updates in real-time
- Visual feedback clearly indicates drag operations and drop zones
- Drag and drop works correctly with filtered task lists
- Mobile touch interfaces support drag and drop operations
- Performance remains good with large task lists

### Task 3.2: Time Tracking Improvements
**Priority:** Medium  
**Estimated Time:** 150 minutes  
**Dependencies:** Task 1.1  
**Benefit Score:** 3 | **Complexity Score:** 8

**Description:** Comprehensive time tracking enhancements including visual indicators, manual time entry, session notes, and expandable task details.

**Actions:**
- [ ] **Subtask 3.2.1:** Extend task data model for time tracking
  - Add time tracking metadata fields to task structure
  - Include fields for manual time entries, session notes, total time
  - Update Firebase schema to support time tracking data
- [ ] **Subtask 3.2.2:** Create visual indicators for tracked time
  - Add icons/badges to tasks that have time tracked
  - Show total time tracked on task cards
  - Use visual cues to distinguish tasks with significant time investment
- [ ] **Subtask 3.2.3:** Build manual time entry modal component
  - Create modal for adding manual time entries with notes
  - Include date/time pickers and note field
  - Add validation for time entry data
- [ ] **Subtask 3.2.4:** Implement expandable task details
  - Add expand/collapse functionality to TaskItem components
  - Show time tracking history and session notes when expanded
  - Display time tracking summary and statistics
- [ ] **Subtask 3.2.5:** Add settings for required time entry
  - Create setting toggle for requiring time entry on task completion
  - Implement modal prompt for time entry when completing tasks
  - Allow users to skip time entry with confirmation
- [ ] **Subtask 3.2.6:** Integrate with existing timer functionality
  - Connect new time tracking to existing Pomodoro timer
  - Ensure timer sessions are properly logged in time tracking
  - Maintain backward compatibility with existing timer features

**Acceptance Criteria:**
- Visual indicators show which tasks have time tracked
- Manual time entry modal allows adding time with notes
- Expandable tasks show detailed time tracking information
- Setting toggle controls required time entry on completion
- Integration with existing timer functionality works correctly
- Time tracking data persists correctly in Firebase

### Task 3.3: Sub-Tasks Implementation
**Priority:** Medium  
**Estimated Time:** 180 minutes  
**Dependencies:** Task 1.1, Task 3.1  
**Benefit Score:** 3 | **Complexity Score:** 9

**Description:** Implement the ability to create nested sub-tasks under a parent task, with their own completion status and management capabilities.

**Actions:**
- [ ] **Subtask 3.3.1:** Extend task data model for hierarchy
  - Add parentTaskId field to task data structure
  - Create hierarchical relationships in Firebase
  - Add subtask-specific fields (depth, order within parent)
- [ ] **Subtask 3.3.2:** Modify TaskItem component for hierarchy display
  - Add visual indentation for sub-tasks
  - Show parent-child relationships clearly
  - Support expandable/collapsible task hierarchies
- [ ] **Subtask 3.3.3:** Add sub-task creation UI
  - Extend task detail modal to include sub-task creation
  - Add "Add Sub-task" button to existing tasks
  - Implement quick sub-task creation from task context menu
- [ ] **Subtask 3.3.4:** Implement completion logic for hierarchies
  - Define completion behavior for parent tasks with incomplete sub-tasks
  - Add auto-completion options for parents when all children complete
  - Handle completion cascading and validation
- [ ] **Subtask 3.3.5:** Update filtering and display logic
  - Ensure filters work correctly with hierarchical tasks
  - Implement show/hide sub-tasks functionality
  - Update search functionality to include sub-task relationships
- [ ] **Subtask 3.3.6:** Integrate with drag and drop functionality
  - Allow dragging sub-tasks within parent task scope
  - Prevent invalid hierarchy operations (dragging parent into child)
  - Maintain hierarchy constraints during reordering

**Acceptance Criteria:**
- Sub-tasks display with clear visual hierarchy and indentation
- Parent tasks show completion status based on sub-task progress
- Sub-task creation is intuitive and accessible from multiple contexts
- Filtering and search work correctly with task hierarchies
- Drag and drop respects hierarchical constraints
- Performance remains good with deep task hierarchies

## Phase 4: Advanced Project Features

### Task 4.1: Kanban-Style Project Management
**Priority:** High  
**Estimated Time:** 240 minutes  
**Dependencies:** Task 2.1, Task 3.1  
**Benefit Score:** 5 | **Complexity Score:** 9

**Description:** Transform projects screen into a kanban board with configurable project stage buckets, project drag & drop between stages, and enhanced filtering.

**Actions:**
- [ ] **Subtask 4.1.1:** Design kanban board layout component
  - Create responsive kanban board layout with configurable columns
  - Design column headers with stage names and project counts
  - Ensure layout works well on desktop and tablet devices
- [ ] **Subtask 4.1.2:** Add project stage field to data model
  - Extend project data structure to include stage/status field
  - Define default stages (Planning, In Progress, Review, Complete)
  - Create migration for existing projects to have default stage
- [ ] **Subtask 4.1.3:** Implement stage management UI
  - Create stage configuration interface in settings
  - Allow users to add, edit, and remove custom stages
  - Add stage color customization and ordering
- [ ] **Subtask 4.1.4:** Implement project drag and drop between stages
  - Use existing drag-and-drop library for project movement
  - Update Firebase when projects are moved between stages
  - Add visual feedback for stage transitions
- [ ] **Subtask 4.1.5:** Update project filtering for kanban view
  - Extend existing filtering to work with kanban layout
  - Add stage-specific filtering options
  - Maintain category and other filter functionality
- [ ] **Subtask 4.1.6:** Add kanban view toggle and settings
  - Create view mode toggle (Grid view vs Kanban view)
  - Remember user preference for view mode
  - Ensure feature is discoverable and user-friendly

**Acceptance Criteria:**
- Kanban board displays projects in configurable stage columns
- Projects can be dragged between stages with real-time updates
- Stage configuration allows customization of workflow stages
- View toggle allows switching between grid and kanban layouts
- Filtering works correctly in kanban view
- Performance remains good with large numbers of projects
- Mobile/tablet experience is functional and intuitive

## Implementation Priority Order

### Recommended Development Sequence:

**Week 1: Critical Fixes**
1. Task 1.1: Fix Universal Task Actions (Critical - fixes existing bugs)
2. Task 1.2: Enhanced Due Date Filters (High value, moderate complexity)

**Week 2: Project Management Polish**
3. Task 2.1: Project Action Buttons (High impact for project management)
4. Task 2.2: Project URL Integration (Quick win)
5. Task 2.3: Optimize Project Card Layout (Depends on 2.1)

**Week 3: Visual Improvements**
6. Task 2.4: Task Completion Visual Indicator (High value visual improvement)
7. Task 2.5: Project View Polish (Builds on 2.4)
8. Task 2.6: Clean Project Filter (Quick usability improvement)

**Week 4: Advanced Task Features**
9. Task 3.1: Task Drag & Drop Reordering (High value, complex)
10. Task 3.2: Time Tracking Improvements (Complex but valuable)

**Week 5: Complex Features**
11. Task 3.3: Sub-Tasks Implementation (Most complex task feature)
12. Task 4.1: Kanban-Style Project Management (Most complex overall)

## Total Estimated Time: 19.5 hours

## Dependencies & Prerequisites

- **React/Firebase Knowledge:** Understanding of existing codebase structure
- **Drag & Drop Library:** Decision between react-beautiful-dnd vs @dnd-kit
- **Design System:** Consistent styling with existing Tailwind implementation
- **Firebase Schema:** Understanding of current data model for extensions

## Key Integration Points

- **App.jsx:** Main state management and Firebase operations
- **ProjectsView.jsx:** Primary location for project-related improvements
- **TaskItem Component:** Core component for task-related enhancements
- **Firebase Config:** Data model extensions for new features
- **ProjectFilters Component:** Filter enhancements and new options