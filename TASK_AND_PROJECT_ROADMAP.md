# Task and Project Priority Roadmap

This document contains the prioritized features for Tasks and Projects that both development leads agreed upon, plus one additional item each.

## Task Items

### Universal Task Actions
**Description:** Fix bug where some tasks cannot be checked off or have timers started - ensure all task interaction buttons work consistently across all views and contexts.

**User Story:** As a user, I want all task interaction buttons (complete, start timer, edit) to work consistently regardless of which view I'm in, so that I can manage my tasks reliably without encountering broken functionality.

**Draft Implementation Plan:** Audit all TaskItem component usages across different views (TasksView, ProjectView, DashboardView) to identify inconsistent prop passing. Standardize the task action handlers and ensure proper event propagation. Test task interactions in all contexts to verify consistent behavior.

**Complexity Score:** 6
**Benefit Score:** 5

---

### Task Drag & Drop Reordering  
**Description:** Allow tasks to be grabbed and reordered through drag and drop functionality within task lists.

**User Story:** As a user, I want to drag and drop tasks to reorder them within a list so that I can quickly prioritize my work without having to edit each task individually.

**Draft Implementation Plan:** Integrate a drag-and-drop library (like react-beautiful-dnd or @dnd-kit). Add drag handles to TaskItem components, implement onDragEnd handlers to update task order in Firebase, and add visual feedback during dragging. Update task data structure to include order/position field.

**Complexity Score:** 7
**Benefit Score:** 4

---

### Time Tracking Improvements
**Description:** Comprehensive time tracking enhancements including visual indicators when time has been tracked against a task, settings to require time entry when completing tasks, manual time entry capabilities, session note indicators, and expandable tasks to view time/notes information.

**User Story:** As a user, I want to see at a glance which tasks have time tracked against them and be able to manually add time entries with notes, so that I can maintain accurate records of my work effort.

**Draft Implementation Plan:** Add time tracking metadata to task data model. Create visual indicators (icons/badges) for tasks with tracked time. Build a time entry modal component for manual time logging. Add expandable/collapsible sections to TaskItem for viewing time details. Implement settings toggle for required time entry on task completion.

**Complexity Score:** 8
**Benefit Score:** 3

---

### Clean Project Filter
**Description:** Remove inactive and archived projects from project filter dropdown by default to reduce clutter and improve usability.

**User Story:** As a user, I want the project filter dropdown to only show active projects by default, so that I can quickly find relevant projects without scrolling through outdated options.

**Draft Implementation Plan:** Modify the ProjectFilters component to filter out archived/inactive projects from the dropdown options. Add project status filtering logic that checks project.status field. Optionally add a "Show All Projects" toggle for users who need to see archived projects.

**Complexity Score:** 3
**Benefit Score:** 3

---

### Sub-Tasks
**Description:** Implement the ability to create nested sub-tasks under a parent task, with their own completion status and management capabilities.

**User Story:** As a user, I want to break down complex tasks into smaller sub-tasks with their own completion status, so that I can track progress on multi-step work more effectively.

**Draft Implementation Plan:** Extend task data model to include parentTaskId field and create hierarchical task relationships. Modify TaskItem component to display sub-tasks with visual indentation. Add sub-task creation UI in task detail modal. Implement completion logic where parent task completion depends on sub-task status.

**Complexity Score:** 9
**Benefit Score:** 3

---

### Enhanced Due Date Filters  
**Description:** Add "Past Due" and "Nudged" options to the due date filter dropdown to help users focus on urgent and neglected tasks.

**User Story:** As a user, I want to quickly filter tasks to see only overdue items or tasks that have been nudged, so that I can prioritize urgent work and respond to the nudging system effectively.

**Draft Implementation Plan:** Extend the due date filter dropdown in TasksView with new filter options. Add filtering logic to identify past due tasks (due date < current date) and nudged tasks (check nudge history/flags). Update the task filtering function to handle these new filter types alongside existing date filters.

**Complexity Score:** 4
**Benefit Score:** 4

## Project Items

### Project Action Buttons ✅ COMPLETED
**Description:** Add edit, delete, and archive buttons to each project card for direct project management without navigating to separate views.

**User Story:** As a user, I want to edit, delete, or archive projects directly from the project card, so that I can manage my projects efficiently without extra navigation steps.

**Implementation Status:** ✅ COMPLETED in Task-3.1 (Archive functionality validated in Task-3.4)
- Edit button with Lucide Edit2 icon implemented and functional
- Delete button with Lucide Trash2 icon and confirmation modal implemented 
- Archive button with Lucide Archive icon implemented and functional
- Proper button styling, positioning, and hover effects implemented
- Connected to Firebase operations with error handling and user feedback
- Bonus: ArchivedProjectsView with reactivation functionality added

**Complexity Score:** 4 (Actual)
**Benefit Score:** 4 (Achieved)

---

### Task Completion Visual Indicator
**Description:** Show visual progress indicator for task completion ratio - projects with all tasks complete appear "full" with progress bars or completion percentages.

**User Story:** As a user, I want to see at a glance how much progress I've made on each project through visual completion indicators, so that I can quickly identify projects that are nearly finished or need attention.

**Draft Implementation Plan:** Calculate task completion percentage for each project (completed tasks / total tasks). Add progress bar component to project cards showing completion ratio. Implement visual styling changes for fully completed projects (different colors, icons). Update project card layout to accommodate progress indicators.

**Complexity Score:** 5
**Benefit Score:** 4

---

### Project URL Integration
**Description:** Display project URL as a clickable link on the project card when the URL field is populated, allowing quick access to related resources.

**User Story:** As a user, I want to click on project URLs directly from the project card, so that I can quickly access related websites, documentation, or resources without having to edit the project.

**Draft Implementation Plan:** Add URL display logic to project card component that shows clickable links when project.url field exists. Implement proper link styling and external link indicators (icon, new tab opening). Add URL validation and formatting to ensure proper link behavior.

**Complexity Score:** 2
**Benefit Score:** 3

---

### Optimize Project Card Layout
**Description:** Reduce maximum size of project cards to eliminate excessive empty space and improve button proportions on desktop displays.

**User Story:** As a user, I want project cards to be appropriately sized for their content, so that I can see more projects at once and the interface looks polished rather than having excessive white space.

**Draft Implementation Plan:** Adjust CSS grid and card sizing in ProjectsView component to reduce maximum card width/height. Optimize button sizing and spacing within cards for better proportions. Test responsive behavior across different screen sizes to ensure cards remain functional.

**Complexity Score:** 3
**Benefit Score:** 3

---

### Project View Polish
**Description:** Refine the "Projects" view cards to show more detail at a glance, such as task counts (e.g., "5/12 complete") and a visual indicator for the project's age or priority.

**User Story:** As a user, I want to see key project information like task counts and project age directly on the project card, so that I can assess project status without clicking into individual projects.

**Draft Implementation Plan:** Add task count calculation and display to project cards showing "X/Y complete" format. Implement project age calculation and visual indicators (colors, badges) based on creation date. Add priority level indicators if priority field exists. Update project card component to accommodate additional information display.

**Complexity Score:** 4
**Benefit Score:** 4

---

### Kanban-Style Project Management
**Description:** Transform projects screen into a kanban board with configurable project stage buckets, project drag & drop between stages, and enhanced project filtering by category and status.

**User Story:** As a user, I want to organize my projects in a kanban board with customizable stages like "Planning", "In Progress", "Review", and "Complete", so that I can visualize and manage my project workflow more effectively.

**Draft Implementation Plan:** Create kanban board layout component with configurable columns/stages. Implement project drag-and-drop between columns using drag-and-drop library. Add project stage field to data model and stage management UI. Create column configuration settings and integrate with existing project filtering. Update project data structure to support stage-based organization.

**Complexity Score:** 9
**Benefit Score:** 5