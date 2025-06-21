### **Improved AI Prompt v2: The Two-Call Strategy**

To eliminate instruction conflicts and improve reliability, we will refactor the AI interaction into two sequential API calls. The first call will handle pure data analysis and strict JSON formatting. The second, much simpler call will handle the creative persona-based writing.

#### Call 1: Data Analysis & Recommendation

This call's sole purpose is to analyze the data and return a structured JSON object. All creative and persona-based instructions have been removed to maximize the probability of receiving clean, valid JSON.

System Message:

You are a data analysis engine. Your only function is to analyze the provided project and task data and populate a specific JSON schema. You must not deviate from this schema. Your entire response must be ONLY the raw JSON object, with no extra text or markdown.

\*\*Output Schema (Strict):\*\*

{

  "urgentTasks": \["string"\],

  "nearCompletionProjects": \["string"\],

  "neglectedProjects": \["string"\],

  "recommendedFocus": "string",

  "nudgeIntensity": "string"

}

\*\*Rules (Mandatory):\*\*

1\.  Your entire output MUST be a single, raw JSON object.

2\.  DO NOT use markdown code blocks (\`\`\`json ... \`\`\`).

3\.  Base all recommendations strictly on the user's data.

4\.  Populate all fields in the schema, even if they are empty arrays \`\[\]\`.

User Message (Example):

This is the full data payload that would be sent to the AI.

{

  "projects": \[

    {

      "id": "proj\_1",

      "name": "Q4 Server Migration",

      "category": "Work",

      "priority": 10,

      "completionPercentage": 80,

      "totalTasks": 5,

      "completedTasks": 4,

      "daysSinceCreated": 25,

      "daysSinceActivity": 1,

      "isNearCompletion": true

    },

    {

      "id": "proj\_2",

      "name": "Learn Advanced SQL",

      "category": "Learning",

      "priority": 3,

      "completionPercentage": 10,

      "totalTasks": 10,

      "completedTasks": 1,

      "daysSinceCreated": 120,

      "daysSinceActivity": 35,

      "isNeglected": true

    }

  \],

  "tasks": \[

    {

      "id": "task\_1a",

      "title": "Final DNS Cutover",

      "projectId": "proj\_1",

      "projectName": "Q4 Server Migration",

      "isComplete": false,

      "isOverdue": true

    },

    {

      "id": "task\_2a",

      "title": "Read Chapter 5: Window Functions",

      "projectId": "proj\_2",

      "projectName": "Learn Advanced SQL",

      "isComplete": false,

      "isOverdue": false

    }

  \],

  "summary": {

    "totalActiveProjects": 2,

    "totalIncompleteTasks": 2

  },

  "timestamp": "2025-06-21T20:00:00.000Z"

}

Example Output (from Call 1):

Based on the User Message above, the AI's *entire response* should be the following raw JSON.

{

  "urgentTasks": \["Final DNS Cutover"\],

  "nearCompletionProjects": \["Q4 Server Migration"\],

  "neglectedProjects": \["Learn Advanced SQL"\],

  "recommendedFocus": "The highest priority is the 'Q4 Server Migration' project which is 80% complete. The final task 'Final DNS Cutover' is overdue and should be addressed immediately.",

  "nudgeIntensity": "high"

}

*This call is optimized for data integrity.*

#### Call 2: Creative Persona Generation

This call is triggered only after a successful response from Call 1\. It is a simple, creative task that is far less likely to fail.

System Message:

You are a robot character actor. Adopt the persona of {ROBOT\_CHARACTER}. Rephrase the following user-provided text in your character's voice and personality. Keep your response under 200 characters.

User Message (Example):

The {RECOMMENDED\_FOCUS\_TEXT} placeholder is replaced with the recommendedFocus value from the output of Call 1\.

Here is the text to rephrase:

"The highest priority is the 'Q4 Server Migration' project which is 80% complete. The final task 'Final DNS Cutover' is overdue and should be addressed immediately."

Example Output (from Call 2, assuming {ROBOT\_CHARACTER} is R2-D2):

The AI's entire response should be only the following plain text string.

Beep-boop-whirr\! Danger, Master\! 'Final DNS Cutover' requires immediate attention. Overdue task protocols initiated. Complete it, you must\! Bweeeep\!

### New Application Workflow

This new architecture requires a change in the application's logic:

1. Trigger AI Nudge: The user clicks the "Test AI Nudge" button.  
2. Make API Call 1: The application sends the data analysis prompt to the AI.  
3. Parse & Validate: The application receives the response. It attempts to JSON.parse() the text.  
   * On Success: It now has a valid JSON object with the analytical data. It immediately uses this to populate the urgentTasks, neglectedProjects, etc., fields in the UI.  
   * On Failure: It logs the error and displays a fallback message, but the failure is now far less likely.  
4. Make API Call 2: Using the recommendedFocus string from the successful response of Call 1, the application makes the second, creative API call.  
5. Update UI: Upon receiving the response from Call 2 (which is just a plain string), it updates the robotRecommendation field in the UI.

### Rationale

This two-step process isolates concerns. The first call is purely mechanical and analytical, making it easy for the model to succeed at the critical task of formatting. The second call is purely creative and has no complex structural requirements, also making it easy to succeed. This separation of concerns is a core principle of robust software design and should dramatically increase the reliability of this feature.

