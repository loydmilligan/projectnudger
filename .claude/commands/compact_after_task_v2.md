# Compact After Task Command (V2)

```bash
claude-code "Compact context after successful task completion while preserving essential project state.

Start your response with: '🗜️ **COMPACT_AFTER_TASK EXECUTING** - Compacting context for [TASK_ID]'

## 📋 REQUIRED INPUTS CHECK

Before proceeding, verify these inputs exist and are valid:

🔍 **INPUT REQUIREMENTS:**
- ✅ TASK_ID parameter provided (format: Task-X.X)
- ✅ Task has been successfully completed and committed
- ✅ tasks/completed/[TASK_ID].json exists
- ✅ codebase_manifest.json is updated with latest state
- ✅ Git repository has clean commit for the task
- ✅ Project is ready for next development phase

**Input Validation Results:**
- [ ] TASK_ID: [TASK_ID] - [VALID/INVALID]
- [ ] Task completion: [COMPLETED/INCOMPLETE] - tasks/completed/[TASK_ID].json
- [ ] Manifest updated: [CURRENT/OUTDATED] - codebase_manifest.json
- [ ] Git commit: [CLEAN/UNCOMMITTED] - latest task changes
- [ ] Project state: [READY/NOT_READY] for next task

**❌ STOP EXECUTION if task not completed or project state unclear**

---

## Task: Compact Context After Task Completion

**Completed Task:** [TASK_ID]

## Context Compacting Process:

### 1. Gather Essential Project State
- **Project Overview**: Load current project description and status
- **Codebase State**: Read updated codebase_manifest.json
- **Task Progress**: Read tasks.json with current completion status
- **Git State**: Verify latest commit and clean working directory
- **Development Context**: Important notes about current development phase

### 2. Identify Next Development Priority
- **Next Task**: Determine the next recommended task from tasks.json
- **Dependencies**: Check if next task dependencies are met
- **Phase Context**: Understand current development phase and priorities
- **Known Issues**: Any important issues or considerations for next work

### 3. Prepare Compact Context Prompt
Create comprehensive prompt for new Claude session:

```
# PROJECT CONTEXT - [Project Name]

## Project Overview
- **Name**: [Project name from manifest]
- **Description**: [Project description]
- **Tech Stack**: [Current tech stack]
- **Current Status**: [Development phase and progress]

## Recent Completion
- **Just Completed**: [TASK_ID] - [Task description]
- **Changes Made**: [Summary of key changes]
- **Current Baseline**: [Updated codebase state]

## Development Workflow
You are working with a manifest-driven development workflow. Available commands:
- claude-code process_task \"Task-X.X\" (prepare task for implementation)
- claude-code implement_task \"Task-X.X\" (implement prepared task)
- claude-code check_task \"Task-X.X\" (validate implementation)
- claude-code commit_task \"Task-X.X\" (commit and update baseline)
- claude-code resolve_mismatch \"Task-X.X\" (fix validation issues)
- claude-code update_final_manifest (update architectural planning)

## Current Project State
### Codebase Manifest Summary
[Key components from codebase_manifest.json]

### Task Progress
[Current tasks.json status with completed/remaining tasks]

### Next Recommended Action
**NEXT TASK**: [Next task ID and title]
**PRIORITY**: [Task priority level]
**ESTIMATED TIME**: [Task duration]
**DESCRIPTION**: [Task description]

**To continue development, run:**
claude-code process_task \"[Next-Task-ID]\"

## Important Development Notes
[Any critical context, known issues, or architectural decisions]

## File Locations
- Baseline: codebase_manifest.json
- Tasks: tasks/tasks.json  
- Commands: [list command files]
- Documentation: [key doc locations]
```

### 4. Execute Context Compact
Run the compact command with prepared prompt:
```bash
claude --compact "[Generated comprehensive prompt above]"
```

### 5. Verify Compact Success
- Confirm new session started successfully
- Verify essential context preserved
- Test that new session understands project state
- Ensure workflow commands are available

---

## 📤 REQUIRED OUTPUTS VERIFICATION

Verify these outputs were created successfully:

🎯 **OUTPUT REQUIREMENTS:**
- ✅ Comprehensive context prompt generated
- ✅ Context compact command executed successfully
- ✅ New Claude session has essential project knowledge
- ✅ Next development task clearly identified
- ✅ Workflow commands available in new session
- ✅ No critical context lost in transition

**Output Validation Results:**
- [ ] Context prompt: [COMPREHENSIVE/INCOMPLETE]
- [ ] Compact execution: [SUCCESSFUL/FAILED]
- [ ] New session knowledge: [VERIFIED/UNVERIFIED]
- [ ] Next task identified: [CLEAR/UNCLEAR]
- [ ] Commands available: [CONFIRMED/MISSING]
- [ ] Context preservation: [COMPLETE/PARTIAL]

**✅ SUCCESS CRITERIA MET** - Context compacted, new session ready for development
**❌ FAILURE** - Context compact incomplete, manual session restart needed

## Context Compact Summary:
- **Previous Task**: [TASK_ID] - Successfully completed and committed
- **Current State**: [Project status and baseline]
- **Context Compacted**: [Timestamp of compact operation]
- **Next Session Ready**: New Claude session prepared with essential context
- **Next Action**: [Next recommended task and command]
- **Estimated Savings**: [Context tokens saved vs. accumulated context]

## New Session Startup:
The new Claude session will have all essential context and can immediately continue development with:
claude-code process_task \"[Next-Task-ID]\"

Context compacting complete - ready for efficient continued development."
```