/**
 * AI Nudge Service
 * Handles intelligent project and task recommendations using OpenAI API
 */

/**
 * Generate project and task data export for AI analysis
 * @param {Array} projects - All user projects
 * @param {Array} tasks - All user tasks
 * @returns {Object} Formatted data for AI analysis
 */
export function prepareDataForAI(projects, tasks) {
    const now = new Date();
    
    // Calculate project completion percentages and staleness
    const projectsWithStats = projects.map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        const completedTasks = projectTasks.filter(task => task.isComplete);
        const completionPercentage = projectTasks.length > 0 ? 
            (completedTasks.length / projectTasks.length) * 100 : 0;
        
        const daysSinceCreated = project.createdAt ? 
            Math.floor((now - new Date(project.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
        
        // Find most recent task activity
        const projectTaskDates = projectTasks
            .map(task => task.completedAt || task.createdAt)
            .filter(Boolean)
            .map(date => new Date(date));
        
        const lastActivity = projectTaskDates.length > 0 ? 
            new Date(Math.max(...projectTaskDates)) : project.createdAt;
        
        const daysSinceActivity = lastActivity ? 
            Math.floor((now - new Date(lastActivity)) / (1000 * 60 * 60 * 24)) : daysSinceCreated;

        // Calculate nudge score (same algorithm as RecommendationEngine)
        const daysOld = project.createdAt ? (now - new Date(project.createdAt)) / (1000 * 60 * 60 * 24) : 0;
        const nudgeScore = (project.priority || 3) * 2 + daysOld;

        return {
            id: project.id,
            name: project.name,
            category: project.category,
            priority: project.priority || 5,
            url: project.url,
            completionPercentage: Math.round(completionPercentage),
            totalTasks: projectTasks.length,
            completedTasks: completedTasks.length,
            daysSinceCreated,
            daysSinceActivity,
            nudgeScore: Math.round(nudgeScore * 100) / 100, // Round to 2 decimal places
            isNearCompletion: completionPercentage >= 80 && completionPercentage < 100,
            isStalled: daysSinceActivity > 7 && completionPercentage > 0,
            isNeglected: daysSinceActivity > 14
        };
    });

    // Prepare task data with context
    const tasksWithContext = tasks.map(task => {
        const project = projects.find(p => p.id === task.projectId);
        const daysSinceCreated = task.createdAt ? 
            Math.floor((now - new Date(task.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < now;
        const isDueSoon = task.dueDate && 
            new Date(task.dueDate) > now && 
            Math.floor((new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24)) <= 3;

        return {
            id: task.id,
            title: task.title,
            projectId: task.projectId,
            projectName: project?.name || 'Unknown Project',
            isComplete: task.isComplete || false,
            tags: task.tags || [],
            daysSinceCreated,
            isOverdue,
            isDueSoon,
            hasNotes: !!(task.detail && task.detail.trim())
        };
    });

    return {
        projects: projectsWithStats,
        tasks: tasksWithContext,
        summary: {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status !== 'archived').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.isComplete).length,
            nearCompletionProjects: projectsWithStats.filter(p => p.isNearCompletion).length,
            stalledProjects: projectsWithStats.filter(p => p.isStalled).length,
            neglectedProjects: projectsWithStats.filter(p => p.isNeglected).length
        },
        timestamp: now.toISOString()
    };
}

/**
 * Call 1: Pure data analysis with strict JSON schema
 * @param {string} apiKey - OpenAI API key
 * @param {Object} projectData - Prepared project/task data
 * @returns {Promise<Object>} Structured analysis data
 */
export async function getDataAnalysis(apiKey, projectData) {
    if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new Error('Valid OpenAI API key is required');
    }

    const systemPrompt = `You are a data analysis engine. Your only function is to analyze the provided project and task data and populate a specific JSON schema. You must not deviate from this schema. Your entire response must be ONLY the raw JSON object, with no extra text or markdown.

**Output Schema (Strict):**

{
  "urgentTasks": ["string"],
  "nearCompletionProjects": ["string"],
  "neglectedProjects": ["string"],
  "recommendedFocus": "string",
  "nudgeIntensity": "string"
}

**Rules (Mandatory):**
1. Your entire output MUST be a single, raw JSON object.
2. DO NOT use markdown code blocks (\`\`\`json ... \`\`\`).
3. Base all recommendations strictly on the user's data.
4. Populate all fields in the schema, even if they are empty arrays \`[]\`.
5. nudgeIntensity must be "low", "medium", or "high".`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(projectData, null, 2)
                    }
                ],
                max_tokens: 400,
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;

        if (!aiResponse) {
            throw new Error('No response received from OpenAI');
        }

        console.log('🤖 Call 1 - Raw analysis response:', aiResponse);
        
        // Parse the JSON response
        let analysis;
        try {
            // Clean the response and parse
            let jsonString = aiResponse.trim();
            
            // Remove any markdown if present (shouldn't be there, but just in case)
            const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (codeBlockMatch) {
                jsonString = codeBlockMatch[1];
            }
            
            analysis = JSON.parse(jsonString);
            console.log('🤖 Call 1 - Successfully parsed analysis:', analysis);
            
        } catch (parseError) {
            console.error('🤖 Call 1 - Failed to parse analysis response:', aiResponse);
            throw new Error(`Failed to parse analysis response: ${parseError.message}`);
        }

        // Validate required fields
        const requiredFields = ['urgentTasks', 'nearCompletionProjects', 'neglectedProjects', 'recommendedFocus', 'nudgeIntensity'];
        const missingFields = requiredFields.filter(field => !(field in analysis));
        
        if (missingFields.length > 0) {
            console.warn('🤖 Call 1 - Missing fields:', missingFields);
            // Fill in missing fields
            const defaults = {
                urgentTasks: [],
                nearCompletionProjects: [],
                neglectedProjects: [],
                recommendedFocus: 'Focus on completing your highest priority tasks.',
                nudgeIntensity: 'medium'
            };
            analysis = { ...defaults, ...analysis };
        }

        return analysis;

    } catch (error) {
        console.error('🤖 Call 1 - Data Analysis Error:', error);
        throw error;
    }
}

/**
 * Call 2: Robot personality generation
 * @param {string} apiKey - OpenAI API key
 * @param {string} robotCharacter - Selected robot character
 * @param {string} recommendedFocus - Text from Call 1 to rephrase
 * @returns {Promise<string>} Robot personality response
 */
export async function getRobotPersonality(apiKey, robotCharacter, recommendedFocus) {
    if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new Error('Valid OpenAI API key is required');
    }

    const systemPrompt = `You are a robot character actor. Adopt the persona of ${robotCharacter}. Rephrase the following user-provided text in your character's voice and personality. Keep your response under 200 characters.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: `Here is the text to rephrase:\n\n"${recommendedFocus}"`
                    }
                ],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const robotResponse = data.choices[0]?.message?.content;

        if (!robotResponse) {
            throw new Error('No robot response received from OpenAI');
        }

        console.log('🤖 Call 2 - Robot personality response:', robotResponse);
        return robotResponse.trim();

    } catch (error) {
        console.error('🤖 Call 2 - Robot Personality Error:', error);
        throw error;
    }
}

/**
 * Orchestrate both AI calls to get complete recommendations
 * @param {string} apiKey - OpenAI API key
 * @param {Object} projectData - Prepared project/task data
 * @returns {Promise<Object>} Complete AI recommendations
 */
export async function getAINudgeRecommendations(apiKey, projectData) {
    // Select random robot character
    const robotCharacters = [
        'R2-D2', 'C-3PO', 'HAL 9000', 'Data', 'Terminator', 
        'WALL-E', 'Bender', 'Optimus Prime', 'Johnny 5', 'Marvin'
    ];
    
    const selectedRobot = robotCharacters[Math.floor(Math.random() * robotCharacters.length)];
    console.log('🤖 Selected robot character:', selectedRobot);

    try {
        // Call 1: Get data analysis
        console.log('🤖 Making Call 1: Data Analysis...');
        const analysis = await getDataAnalysis(apiKey, projectData);
        
        // Call 2: Get robot personality (with fallback)
        let robotRecommendation;
        try {
            console.log('🤖 Making Call 2: Robot Personality...');
            robotRecommendation = await getRobotPersonality(apiKey, selectedRobot, analysis.recommendedFocus);
        } catch (robotError) {
            console.warn('🤖 Call 2 failed, using fallback robot message:', robotError.message);
            robotRecommendation = `INITIATING PRODUCTIVITY PROTOCOL. ${analysis.recommendedFocus.toUpperCase()}`;
        }
        
        // Combine results
        const recommendations = {
            ...analysis,
            robotRecommendation,
            robotCharacter: selectedRobot,
            timestamp: new Date().toISOString()
        };
        
        console.log('🤖 Final combined recommendations:', recommendations);
        return recommendations;

    } catch (error) {
        console.error('🤖 Two-call strategy failed:', error);
        throw error;
    }
}

/**
 * Generate AI nudge recommendations for a user
 * @param {Object} settings - User settings including AI configuration
 * @param {Array} projects - User projects
 * @param {Array} tasks - User tasks
 * @returns {Promise<Object>} AI recommendations or null if disabled/error
 */
export async function generateAINudge(settings, projects, tasks) {
    console.log('🤖 AI Nudge Service: Starting generation');
    console.log('Settings:', { 
        aiNudgeEnabled: settings.aiNudgeEnabled, 
        hasApiKey: !!settings.openaiApiKey,
        apiKeyLength: settings.openaiApiKey?.length || 0,
        apiKeyStart: settings.openaiApiKey?.substring(0, 10) + '...'
    });
    
    // Check if AI nudges are enabled
    if (!settings.aiNudgeEnabled) {
        console.log('AI nudges are disabled');
        return null;
    }

    // Check if API key is available
    if (!settings.openaiApiKey) {
        console.warn('AI nudges enabled but no OpenAI API key provided');
        return null;
    }

    try {
        console.log('🤖 Preparing data for AI analysis...');
        // Prepare data for AI analysis
        const projectData = prepareDataForAI(projects, tasks);
        console.log('Project data prepared:', projectData.summary);
        
        console.log('🤖 Calling OpenAI API...');
        // Get AI recommendations using two-call strategy
        const recommendations = await getAINudgeRecommendations(
            settings.openaiApiKey,
            projectData
        );

        console.log('🤖 AI recommendations received:', recommendations);
        return recommendations;

    } catch (error) {
        console.error('🤖 Failed to generate AI nudge:', error);
        
        // Return a fallback nudge
        return {
            urgentTasks: [],
            nearCompletionProjects: [],
            neglectedProjects: [],
            recommendedFocus: 'Unable to generate AI recommendations. Please check your settings.',
            nudgeIntensity: 'low',
            robotRecommendation: 'INITIATING PRODUCTIVITY PROTOCOL. FOCUS ON YOUR HIGHEST PRIORITY TASKS, HUMAN.',
            robotCharacter: 'Generic Robot',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}