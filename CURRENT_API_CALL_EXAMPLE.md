# Current OpenAI API Call Example

This document shows exactly what gets sent to the OpenAI API when you press the "Test AI Nudge" button.

## API Request Structure

**Endpoint**: `https://api.openai.com/v1/chat/completions`
**Method**: POST
**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer sk-proj-Re..."
}
```

## Request Body

```json
{
  "model": "gpt-3.5-turbo",
  "max_tokens": 800,
  "temperature": 0.1,
  "messages": [
    {
      "role": "system",
      "content": "[See System Message below]"
    },
    {
      "role": "user", 
      "content": "Analyze the project data and return ONLY the JSON object in the exact format specified. NO markdown, NO code blocks, NO extra text - just the raw JSON."
    }
  ]
}
```

## System Message (Actual Content Sent)

```
You are R2-D2, a robot productivity coach analyzing task data.

Return ONLY valid JSON (no markdown, no extra text) in this EXACT format:

{
  "urgentTasks": [],
  "nearCompletionProjects": [],
  "neglectedProjects": [],
  "recommendedFocus": "Brief recommendation based on the data",
  "robotRecommendation": "Same recommendation in R2-D2's voice with their personality",
  "robotCharacter": "R2-D2",
  "nudgeIntensity": "low"
}

Rules:
1. Return ONLY the JSON object above
2. Keep "robotRecommendation" under 200 characters
3. Use R2-D2's speech patterns and personality
4. Base recommendations on actual project data provided
5. NO markdown formatting, NO code blocks, NO extra text

User's current project data:
{
  "projects": [
    {
      "id": "dummy_proj_1",
      "name": "Q3 Report Finalization",
      "category": "Work",
      "priority": 10,
      "url": "",
      "completionPercentage": 33,
      "totalTasks": 3,
      "completedTasks": 1,
      "daysSinceCreated": 1,
      "daysSinceActivity": 0,
      "nudgeScore": 21,
      "isNearCompletion": false,
      "isStalled": false,
      "isNeglected": false
    },
    {
      "id": "dummy_proj_2",
      "name": "Home Reno Planning",
      "category": "Personal",
      "priority": 3,
      "url": "",
      "completionPercentage": 33,
      "totalTasks": 3,
      "completedTasks": 1,
      "daysSinceCreated": 1,
      "daysSinceActivity": 0,
      "nudgeScore": 7,
      "isNearCompletion": false,
      "isStalled": false,
      "isNeglected": false
    },
    {
      "id": "dummy_proj_3",
      "name": "Learn Rust Programming",
      "category": "Learning",
      "priority": 3,
      "url": "",
      "completionPercentage": 33,
      "totalTasks": 3,
      "completedTasks": 1,
      "daysSinceCreated": 101,
      "daysSinceActivity": 0,
      "nudgeScore": 107,
      "isNearCompletion": false,
      "isStalled": false,
      "isNeglected": false
    }
  ],
  "tasks": [
    {
      "id": "dummy_task_1",
      "title": "Draft executive summary",
      "projectId": "dummy_proj_1",
      "projectName": "Q3 Report Finalization",
      "isComplete": false,
      "tags": [],
      "daysSinceCreated": 1,
      "isOverdue": true,
      "isDueSoon": false,
      "hasNotes": true
    },
    {
      "id": "dummy_task_2",
      "title": "email professor",
      "projectId": "dummy_proj_3",
      "projectName": "Learn Rust Programming",
      "isComplete": false,
      "tags": [],
      "daysSinceCreated": 101,
      "isOverdue": true,
      "isDueSoon": false,
      "hasNotes": false
    },
    {
      "id": "dummy_task_3",
      "title": "do exericses form book",
      "projectId": "dummy_proj_3",
      "projectName": "Learn Rust Programming",
      "isComplete": false,
      "tags": [],
      "daysSinceCreated": 101,
      "isOverdue": true,
      "isDueSoon": false,
      "hasNotes": false
    }
  ],
  "summary": {
    "totalProjects": 17,
    "activeProjects": 10,
    "totalTasks": 28,
    "completedTasks": 6,
    "nearCompletionProjects": 0,
    "stalledProjects": 0,
    "neglectedProjects": 0
  },
  "timestamp": "2025-06-21T10:26:17.986Z"
}
```

## What OpenAI Actually Returns

Based on recent console logs, OpenAI returns something like this (which is the wrong format):

```json
{
  "recommendations": {
    "projects": {
      "total": 17,
      "active": 10,
      "completed": 7,
      "categories": {
        "Learning": 3,
        "software": 6,
        "Personal": 1,
        "home assistant": 1,
        "3d printing": 3,
        "Work": 2
      }
    },
    "tasks": {
      "total": 28,
      "completed": 6,
      "overdue": 4,
      "dueSoon": 0
    }
  }
}
```

## The Problem

**We ask for**: Flat JSON with `urgentTasks`, `robotRecommendation`, etc.
**OpenAI gives us**: Nested analytical data with `recommendations.projects.total`, etc.

**Result**: Our code can't find the expected fields, so it falls back to generic responses.

## Robot Character Selection

The system randomly picks from: `['R2-D2', 'C-3PO', 'HAL 9000', 'Data', 'Terminator', 'WALL-E', 'Bender', 'Optimus Prime', 'Johnny 5', 'Marvin']`

Then replaces `{ROBOT_CHARACTER}` in the prompt template with the selected character (e.g., "R2-D2").

---

This shows why we're having issues - OpenAI is essentially ignoring our schema and returning what it thinks is more useful analytical data instead of following our exact JSON format requirements.