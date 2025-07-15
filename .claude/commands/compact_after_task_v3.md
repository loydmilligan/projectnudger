# Compact After Task Command (V3)

```bash
claude-code "Create compact context file after successful task completion for efficient development continuation.

Start your response with: '🗜️ **COMPACT_AFTER_TASK_V3 EXECUTING** - Creating compact context for Task-[TASK_ID]'

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

## Task: Create Compact Context File After Task Completion

**Completed Task:** Task-[TASK_ID]

## Context Preparation Process:

### 1. Gather Essential Project State
- **Project Overview**: Load current project description and status
- **Codebase State**: Read updated codebase_manifest.json
- **Task Progress**: Read tasks/tasks.json with current completion status
- **Git State**: Verify latest commit and clean working directory
- **Development Context**: Important notes about current development phase

### 2. Identify Next Development Priority
- **Next Task**: Determine the next recommended task from tasks/tasks.json
- **Dependencies**: Check if next task dependencies are met
- **Phase Context**: Understand current development phase and priorities
- **Known Issues**: Any important issues or considerations for next work

### 3. Create Compact Context File

Generate `.compact_ready` file in project root:

```markdown
# PROJECT CONTEXT - [Project Name]

## Continue Development
\`claude-code process_task \"[Next-Task-ID]\"\`

## Just Completed
- **Task**: [TASK_ID] - [Task description]
- **Changes**: [Summary of key changes made]
- **Commit**: [Latest commit hash]
- **Status**: Successfully completed and committed

## Project Status
- **Name**: [Project name from manifest]
- **Tech Stack**: [Current tech stack]
- **Phase**: [Current development phase]
- **Progress**: [X/Y tasks completed]

## Current Baseline
**Manifest Location**: codebase_manifest.json
**Last Updated**: [Timestamp from manifest]
**Key Components**: [List main components from manifest]

## Next Priority
**Task**: [Next-Task-ID] - [Next task title]
**Description**: [Next task description]
**Dependencies**: [Any dependencies - should be met]
**Estimated Effort**: [If available]

## Development Workflow
Available commands for manifest-driven development:
- \`claude-code process_task \"Task-X.X\"\` - Prepare task for implementation
- \`claude-code implement_task \"Task-X.X\"\` - Implement prepared task
- \`claude-code check_task \"Task-X.X\"\` - Validate implementation
- \`claude-code commit_task \"Task-X.X\"\` - Commit and update baseline
- \`claude-code resolve_mismatch \"Task-X.X\"\` - Fix validation issues

## Project Files
- **Baseline**: codebase_manifest.json
- **Tasks**: tasks/tasks.json
- **Completed**: tasks/completed/[TASK_ID].json
- **Documentation**: [Key doc locations]

## Important Notes
[Any critical context, known issues, or architectural decisions that need to be preserved]

---
**Ready for continued development**
Next: \`claude-code process_task \"[Next-Task-ID]\"\`
```

### 4. Verify Context File Creation
- Confirm `.compact_ready` file was created successfully
- Validate all essential information is included
- Check that next task identification is accurate
- Ensure context is comprehensive but concise

### 5. Cleanup Previous Context Files
- Remove any previous `.compact_ready` files
- Clean up temporary files if any exist
- Ensure project directory is clean

---

## 📤 REQUIRED OUTPUTS VERIFICATION

Verify these outputs were created successfully:

🎯 **OUTPUT REQUIREMENTS:**
- ✅ Compact context file created at `.compact_ready`
- ✅ Next development task clearly identified
- ✅ Essential project state preserved
- ✅ Workflow commands documented
- ✅ Context is comprehensive but concise
- ✅ Ready for manual compact execution

**Output Validation Results:**
- [ ] Context file: [CREATED/FAILED] - .compact_ready
- [ ] Next task: [IDENTIFIED/UNCLEAR] - [Next-Task-ID]
- [ ] Project state: [COMPREHENSIVE/INCOMPLETE]
- [ ] Workflow docs: [INCLUDED/MISSING]
- [ ] Context quality: [CONCISE/VERBOSE/INCOMPLETE]
- [ ] Manual execution: [READY/NOT_READY]

**✅ SUCCESS CRITERIA MET** - Context file ready for manual compact
**❌ FAILURE** - Context file incomplete or not created

## Manual Execution Instructions:

**To compact context and continue development:**
1. Run: `claude --compact .compact_ready`
2. In new session, continue with: `claude-code process_task \"[Next-Task-ID]\"`

## Context File Summary:
- **Previous Task**: [TASK_ID] - Successfully completed
- **Current State**: [Project status and baseline]
- **Context File**: `.compact_ready` created in project root
- **Next Action**: [Next recommended task and command]
- **Manual Step**: Run `claude --compact .compact_ready` to continue

Context preparation complete - ready for manual compact execution."
```
