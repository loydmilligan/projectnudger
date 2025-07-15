# Commit Task Then Compact Command (V3)

```bash
claude-code "Commit completed task implementation and create compact context file for efficient development continuation.

Start your response with: '💾🗜️ **COMMIT_TASK_THEN_COMPACT_V3 EXECUTING** - Committing Task-[TASK_ID] then creating compact context'

## 📋 REQUIRED INPUTS CHECK

Before proceeding, verify these inputs exist and are valid:

🔍 **INPUT REQUIREMENTS:**
- ✅ TASK_ID parameter provided (format: Task-X.X)
- ✅ tasks/validation/[TASK_ID]-validation.json exists
- ✅ Validation status is PASS or MINOR_ISSUES
- ✅ Git repository is initialized and accessible
- ✅ Working directory is clean or changes are task-related
- ✅ codebase_manifest.json exists (to be updated)
- ✅ tasks/tasks.json exists for progress tracking

**Input Validation Results:**
- [ ] TASK_ID: [TASK_ID] - [VALID/INVALID]
- [ ] Validation report: [EXISTS/MISSING] - tasks/validation/[TASK_ID]-validation.json
- [ ] Validation status: [PASS/MINOR_ISSUES/MAJOR_ISSUES] - [ACCEPTABLE/UNACCEPTABLE]
- [ ] Git repository: [INITIALIZED/NOT_INITIALIZED]
- [ ] Working directory: [CLEAN/HAS_CHANGES] - [TASK_RELATED/UNRELATED]
- [ ] Baseline manifest: [EXISTS/MISSING] - codebase_manifest.json
- [ ] Tasks file: [EXISTS/MISSING] - tasks/tasks.json

**❌ STOP EXECUTION if validation failed or critical inputs missing**

---

## Task: Commit Task Implementation Then Create Compact Context

**Task ID:** Task-[TASK_ID]

## Phase 1: Task Commit Process

### 1. Pre-Commit Verification
- Load validation report to confirm task completion status
- Verify all critical and concerning issues have been resolved
- Ensure no uncommitted debugging or temporary code remains
- Confirm all task-related files are ready for commit
- Check that build/compile succeeds if applicable

### 2. Update Baseline Manifest
**CRITICAL STEP:** Update the project's baseline manifest with actual state:
- Load the actual_manifest from validation report
- **Replace** codebase_manifest.json content with actual_manifest
- This establishes the new baseline for future tasks
- Verify the updated manifest is valid JSON/format
- Include manifest update in the commit

### 3. Stage All Task-Related Changes
Identify and stage all files changed during task implementation:
- New files created during implementation
- Modified files changed during implementation  
- Updated dependency files (package.json, etc.)
- Configuration files modified
- Documentation updates
- **Updated codebase_manifest.json**

Review staged changes to ensure only task-related modifications are included.

### 4. Create Descriptive Commit Message

**Format:** `Task-[TASK_ID]: [Brief description]`

**Detailed Commit Body:**
```
Task-[TASK_ID]: [Brief description]

Implementation Summary:
- [Key change 1]
- [Key change 2] 
- [Key change 3]

Files Created:
- [new_file1.ext] - [purpose]
- [new_file2.ext] - [purpose]

Files Modified:
- [existing_file1.ext] - [what changed]
- [existing_file2.ext] - [what changed]

Dependencies Added:
- [dependency1] - [reason]
- [dependency2] - [reason]

Validation Status: [PASS/MINOR_ISSUES]
Breaking Changes: [YES/NO - describe if yes]
Baseline Manifest Updated: YES

Ready for compact context and next development phase.
```

### 5. Execute Git Commit
```bash
git add .
git commit -m "Task-[TASK_ID]: [Brief description]" -m "[Detailed body]"
```

### 6. Post-Commit Task Management
- Record commit hash for task tracking
- Move task preparation file to completed directory
- Update task status in tracking system
- Archive validation report with commit reference

### 7. Update Task Tracking
Move and update task files:
- Move `tasks/prepared/[TASK_ID].json` to `tasks/completed/[TASK_ID].json`
- Add commit information to completed task file
- Update tasks/tasks.json progress if applicable

## Phase 2: Compact Context Creation

### 8. Verify Commit Success
**CRITICAL CHECKPOINT:** Only proceed to compact context creation if commit was successful:
- [ ] Git commit completed successfully
- [ ] Commit hash recorded
- [ ] Baseline manifest updated
- [ ] Task files moved to completed directory
- [ ] Working directory is clean

**❌ STOP IF COMMIT FAILED** - Do not create compact context if commit was unsuccessful

### 9. Gather Essential Context for Next Development Phase

#### Project State Analysis:
- **Current State**: Read updated codebase_manifest.json
- **Task Progress**: Read tasks/tasks.json with updated completion status
- **Git State**: Latest commit hash and clean working directory
- **Next Priority**: Identify next recommended task from tasks/tasks.json

#### Context Preparation:
- **Dependencies Check**: Verify next task dependencies are met
- **Phase Assessment**: Understand current development phase
- **Issue Identification**: Note any blockers or important considerations

### 10. Create Comprehensive Compact Context File

Generate `.compact_ready` file in project root:

```markdown
# PROJECT CONTEXT - [Project Name]

## Continue Development
\`claude-code process_task \"[Next-Task-ID]\"\`

## Just Completed & Committed
- **Task**: [TASK_ID] - [Task title]
- **Summary**: [What was implemented]
- **Commit**: [Git commit hash]
- **Files Changed**: [Count] files created, [Count] files modified
- **Status**: Successfully completed, validated, and committed

## Project Status
- **Name**: [Project name]
- **Description**: [Brief project description]
- **Tech Stack**: [Current technology stack]
- **Development Phase**: [Current phase and overall progress]
- **Baseline**: codebase_manifest.json updated with Task-[TASK_ID] changes

## Current Architecture
**Key Components**: [Major components from codebase_manifest.json]
**Recent Changes**: [Architectural changes from this task]
**Integration Points**: [How new components connect]

## Task Progress
### Recently Completed
- [List of last 3-5 completed tasks with brief descriptions]

### Current Phase: [Phase Name]
[Current phase description and goals]

### Next Recommended Task
**Task**: [Next-Task-ID] - [Task title]
**Priority**: [Task priority level]
**Description**: [Task description]
**Dependencies**: [Any dependencies - should be met]
**Estimated Effort**: [Duration if available]

## Development Workflow
You have access to manifest-driven development commands:

**Core Workflow:**
- \`claude-code process_task \"Task-X.X\"\` - Prepare task for implementation
- \`claude-code implement_task \"Task-X.X\"\` - Implement prepared task  
- \`claude-code check_task \"Task-X.X\"\` - Validate implementation against expected
- \`claude-code commit_task \"Task-X.X\"\` - Commit and update baseline
- \`claude-code resolve_mismatch \"Task-X.X\"\` - Fix validation issues

**Optimization:**
- \`claude-code compact_after_task \"Task-X.X\"\` - Create compact context after completion
- \`claude-code commit_task_then_compact \"Task-X.X\"\` - Commit and create compact context

## Project Structure
- **Baseline Manifest**: codebase_manifest.json (updated with Task-[TASK_ID] changes)
- **Task Definitions**: tasks/tasks.json
- **Completed Tasks**: tasks/completed/
- **Documentation**: [key documentation paths]

## Current Git State
- **Latest Commit**: [commit hash] - Task-[TASK_ID] completion
- **Branch**: [current branch]
- **Status**: Clean working directory, ready for next task

## Important Development Notes
[Any critical architectural decisions, known issues, or development constraints that need to be preserved]

---
**READY FOR CONTINUED DEVELOPMENT**
Next: \`claude-code process_task \"[Next-Task-ID]\"\`
```

### 11. Verify Context File Creation
- Confirm `.compact_ready` file was created successfully
- Validate all essential information is included
- Check that next task identification is accurate
- Ensure context is comprehensive but concise

### 12. Cleanup Previous Context Files
- Remove any previous `.compact_ready` files
- Clean up temporary files if any exist
- Ensure project directory is clean

---

## 📤 REQUIRED OUTPUTS VERIFICATION

Verify these outputs were created successfully:

🎯 **OUTPUT REQUIREMENTS:**
- ✅ Task successfully committed with proper git history
- ✅ codebase_manifest.json updated with new baseline
- ✅ Task files moved to completed directory
- ✅ Compact context file created at `.compact_ready`
- ✅ Next development task clearly identified
- ✅ Context is comprehensive and ready for manual compact

**Output Validation Results:**
- [ ] Git commit: [SUCCESSFUL/FAILED] - [commit hash]
- [ ] Manifest update: [COMPLETED/FAILED] - codebase_manifest.json
- [ ] Task archival: [COMPLETED/FAILED] - tasks/completed/[TASK_ID].json
- [ ] Context file: [CREATED/FAILED] - .compact_ready
- [ ] Next task: [IDENTIFIED/UNCLEAR] - [Next-Task-ID]
- [ ] Context quality: [COMPREHENSIVE/INCOMPLETE]

**✅ SUCCESS CRITERIA MET** - Task committed and compact context ready
**❌ FAILURE** - Either commit failed or context creation incomplete

## Manual Execution Instructions:

**To compact context and continue development:**
1. Run: `claude --compact .compact_ready`
2. In new session, continue with: `claude-code process_task \"[Next-Task-ID]\"`

## Operation Summary:
- **Task Committed**: Task-[TASK_ID] - [commit hash]
- **Baseline Updated**: codebase_manifest.json reflects new state
- **Context Created**: `.compact_ready` file in project root
- **Next Action**: Manual compact execution required
- **Development Ready**: Context optimized for continued work

## Completion Status:
✅ **Task Development Cycle Complete**
✅ **Project State Preserved and Updated** 
✅ **Compact Context Ready for Manual Execution**

The task is fully committed and context is prepared for efficient continuation."
```
