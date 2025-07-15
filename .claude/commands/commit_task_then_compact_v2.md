# Commit Task Then Compact Command (V2)

```bash
claude-code "Commit completed task implementation and then compact context for efficient development continuation.

Start your response with: '💾🗜️ **COMMIT_TASK_THEN_COMPACT EXECUTING** - Committing [TASK_ID] then compacting context'

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

## Task: Commit Task Implementation Then Compact Context

**Task ID:** [TASK_ID]

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

**Format:** `[TASK_ID]: [Brief description]`

**Detailed Commit Body:**
```
[TASK_ID]: [Brief description]

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
Task Completion: [percentage or status]

Ready for context compact and next development phase.
```

### 5. Execute Git Commit
```bash
git add .
git commit -m \"[TASK_ID]: [Brief description]\" -m \"[Detailed body]\"
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
- Update tasks.json progress if applicable

## Phase 2: Context Compact Process

### 8. Verify Commit Success
**CRITICAL CHECKPOINT:** Only proceed to compact if commit was successful:
- [ ] Git commit completed successfully
- [ ] Commit hash recorded
- [ ] Baseline manifest updated
- [ ] Task files moved to completed directory
- [ ] Working directory is clean

**❌ STOP IF COMMIT FAILED** - Do not compact context if commit was unsuccessful

### 9. Prepare Next Development Context

#### Gather Essential State:
- **Project Overview**: Current project description and status
- **Codebase State**: Read updated codebase_manifest.json
- **Task Progress**: Read tasks.json with updated completion status
- **Git State**: Latest commit hash and clean working directory
- **Development Phase**: Current phase and remaining work

#### Identify Next Priority:
- **Next Task**: Determine next recommended task from tasks.json
- **Dependencies**: Verify next task dependencies are met
- **Phase Context**: Understand current development priorities
- **Blockers**: Any issues preventing next task start

### 10. Generate Comprehensive Context Prompt

Create detailed prompt for new Claude session:

```
# PROJECT DEVELOPMENT CONTEXT - [Project Name]

## Project Overview
- **Name**: [Project name]
- **Description**: [Brief project description]
- **Tech Stack**: [Current technology stack]
- **Development Status**: [Current phase and overall progress]

## Just Completed
- **Task**: [TASK_ID] - [Task title]
- **Summary**: [What was implemented]
- **Commit**: [Git commit hash]
- **New Baseline**: codebase_manifest.json updated with latest state

## Development Workflow Available
You have access to a manifest-driven development workflow with these commands:

**Core Workflow:**
- claude-code process_task \"Task-X.X\" - Prepare task for implementation
- claude-code implement_task \"Task-X.X\" - Implement prepared task  
- claude-code check_task \"Task-X.X\" - Validate implementation against expected
- claude-code commit_task \"Task-X.X\" - Commit and update baseline
- claude-code resolve_mismatch \"Task-X.X\" - Fix validation issues

**Optimization Commands:**
- claude-code update_final_manifest - Update architectural planning
- claude-code compact_after_task \"Task-X.X\" - Context compact after completion
- claude-code commit_task_then_compact \"Task-X.X\" - Commit and compact

## Current Project State

### Technology Stack
[Current tech stack from manifest]

### Key Components Implemented
[Major components from codebase_manifest.json]

### Architecture
[Brief architecture overview]

## Task Progress Status
### Completed Tasks
[List of completed tasks with brief descriptions]

### Current Phase: [Phase Name]
[Current phase description and goals]

### Next Recommended Task
**TASK**: [Next-Task-ID] - [Task title]
**PRIORITY**: [Task priority]
**ESTIMATED TIME**: [Duration]
**DEPENDENCIES**: [Any dependencies - should be met]
**DESCRIPTION**: [Task description]

**To continue development immediately:**
```bash
claude-code process_task \"[Next-Task-ID]\"
```

## Important Development Notes
[Any critical architectural decisions, known issues, or development constraints]

## Project File Structure
- **Baseline Manifest**: codebase_manifest.json (updated with [TASK_ID] changes)
- **Task Definitions**: tasks/tasks.json
- **Completed Tasks**: tasks/completed/
- **Development Commands**: [command file locations]
- **Documentation**: [key documentation paths]

## Current Git State
- **Latest Commit**: [commit hash] - [TASK_ID] completion
- **Branch**: [current branch]
- **Status**: Clean working directory, ready for next task

---

**READY FOR CONTINUED DEVELOPMENT**
Start next task with: claude-code process_task \"[Next-Task-ID]\"
```

### 11. Execute Context Compact
```bash
claude --compact "[Generated comprehensive prompt above]"
```

---

## 📤 REQUIRED OUTPUTS VERIFICATION

Verify these outputs were created successfully:

🎯 **OUTPUT REQUIREMENTS:**
- ✅ Task successfully committed with proper git history
- ✅ codebase_manifest.json updated with new baseline
- ✅ Task files moved to completed directory
- ✅ Comprehensive context prompt generated for new session
- ✅ Context compact executed successfully
- ✅ New Claude session ready with essential project knowledge

**Output Validation Results:**
- [ ] Git commit: [SUCCESSFUL/FAILED] - [commit hash]
- [ ] Manifest update: [COMPLETED/FAILED] - codebase_manifest.json
- [ ] Task archival: [COMPLETED/FAILED] - tasks/completed/[TASK_ID].json
- [ ] Context prompt: [COMPREHENSIVE/INCOMPLETE]
- [ ] Compact execution: [SUCCESSFUL/FAILED]
- [ ] New session readiness: [VERIFIED/UNVERIFIED]

**✅ SUCCESS CRITERIA MET** - Task committed and context compacted successfully
**❌ FAILURE** - Either commit failed or context compact incomplete

## Operation Summary:
- **Task Committed**: [TASK_ID] - [commit hash]
- **Baseline Updated**: codebase_manifest.json reflects new state
- **Context Compacted**: [timestamp]
- **New Session**: Ready with essential project context
- **Next Action**: claude-code process_task \"[Next-Task-ID]\"
- **Development Efficiency**: Context optimized for continued work

## Completion Status:
✅ **Task Development Cycle Complete**
✅ **Project State Preserved and Updated** 
✅ **Context Optimized for Next Development Phase**

The task is fully committed and the development environment is optimized for efficient continuation with the next task."
```