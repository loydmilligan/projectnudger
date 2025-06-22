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
 * @param {string} apiKey - API key for the chosen provider
 * @param {string} provider - AI provider ('openai', 'gemini', 'anthropic')
 * @param {Object} projectData - Prepared project/task data
 * @returns {Promise<Object>} Structured analysis data
 */
export async function getDataAnalysis(apiKey, provider, projectData) {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    // Validate API key format based on provider
    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
        throw new Error('Valid OpenAI API key is required (starts with sk-)');
    }
    if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
        throw new Error('Valid Anthropic API key is required (starts with sk-ant-)');
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
        let response;
        
        if (provider === 'openai') {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        } else if (provider === 'gemini') {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\nData to analyze:\n${JSON.stringify(projectData, null, 2)}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 400
                    }
                })
            });
        } else if (provider === 'anthropic') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 400,
                    temperature: 0.1,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: JSON.stringify(projectData, null, 2)
                        }
                    ]
                })
            });
        } else {
            throw new Error(`Unsupported AI provider: ${provider}`);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`${provider} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        let aiResponse;

        if (provider === 'openai') {
            aiResponse = data.choices[0]?.message?.content;
        } else if (provider === 'gemini') {
            aiResponse = data.candidates[0]?.content?.parts[0]?.text;
        } else if (provider === 'anthropic') {
            aiResponse = data.content[0]?.text;
        }

        if (!aiResponse) {
            throw new Error(`No response received from ${provider}`);
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
 * @param {string} apiKey - API key for the chosen provider
 * @param {string} provider - AI provider ('openai', 'gemini', 'anthropic')
 * @param {string} robotCharacter - Selected robot character
 * @param {string} recommendedFocus - Text from Call 1 to rephrase
 * @returns {Promise<string>} Robot personality response
 */
export async function getRobotPersonality(apiKey, provider, robotCharacter, recommendedFocus) {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    const systemPrompt = `You are a robot character actor. Adopt the persona of ${robotCharacter}. Rephrase the following user-provided text in your character's voice and personality. Keep your response under 200 characters.`;

    try {
        let response;
        
        if (provider === 'openai') {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        } else if (provider === 'gemini') {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\nHere is the text to rephrase:\n\n"${recommendedFocus}"`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 100
                    }
                })
            });
        } else if (provider === 'anthropic') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 100,
                    temperature: 0.7,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: `Here is the text to rephrase:\n\n"${recommendedFocus}"`
                        }
                    ]
                })
            });
        } else {
            throw new Error(`Unsupported AI provider: ${provider}`);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`${provider} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        let robotResponse;

        if (provider === 'openai') {
            robotResponse = data.choices[0]?.message?.content;
        } else if (provider === 'gemini') {
            robotResponse = data.candidates[0]?.content?.parts[0]?.text;
        } else if (provider === 'anthropic') {
            robotResponse = data.content[0]?.text;
        }

        if (!robotResponse) {
            throw new Error(`No robot response received from ${provider}`);
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
 * @param {string} apiKey - API key for the chosen provider
 * @param {string} provider - AI provider ('openai', 'gemini', 'anthropic')
 * @param {Object} projectData - Prepared project/task data
 * @returns {Promise<Object>} Complete AI recommendations
 */
export async function getAINudgeRecommendations(apiKey, provider, projectData) {
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
        const analysis = await getDataAnalysis(apiKey, provider, projectData);
        
        // Call 2: Get robot personality (with fallback)
        let robotRecommendation;
        try {
            console.log('🤖 Making Call 2: Robot Personality...');
            robotRecommendation = await getRobotPersonality(apiKey, provider, selectedRobot, analysis.recommendedFocus);
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
 * @param {Object} activeSession - Current active session (to prevent generation during sessions)
 * @returns {Promise<Object>} AI recommendations or null if disabled/error
 */
export async function generateAINudge(settings, projects, tasks, activeSession = null) {
    console.log('🤖 AI Nudge Service: Starting generation');
    console.log('Settings:', { 
        aiNudgeEnabled: settings.aiNudgeEnabled, 
        hasApiKey: !!settings.openaiApiKey,
        apiKeyLength: settings.openaiApiKey?.length || 0,
        apiKeyStart: settings.openaiApiKey?.substring(0, 10) + '...'
    });
    
    // Check if there's an active session (prevent during active work/break)
    if (activeSession) {
        console.log('🤖 Skipping AI nudge - session is active:', activeSession.type);
        return null;
    }
    
    // Check if AI nudges are enabled
    if (!settings.aiNudgeEnabled) {
        console.log('AI nudges are disabled');
        return null;
    }

    // Determine provider and get API key
    const provider = settings.aiProvider || 'openai';
    let apiKey;
    
    if (provider === 'openai') {
        apiKey = settings.openaiApiKey;
    } else if (provider === 'gemini') {
        apiKey = settings.geminiApiKey;
    } else if (provider === 'anthropic') {
        apiKey = settings.anthropicApiKey;
    }
    
    if (!apiKey) {
        console.warn(`AI nudges enabled but no ${provider} API key provided`);
        return null;
    }

    try {
        console.log('🤖 Preparing data for AI analysis...');
        // Prepare data for AI analysis
        const projectData = prepareDataForAI(projects, tasks);
        console.log('Project data prepared:', projectData.summary);
        
        console.log(`🤖 Calling ${provider} API...`);
        // Get AI recommendations using two-call strategy
        const recommendations = await getAINudgeRecommendations(
            apiKey,
            provider,
            projectData
        );

        console.log('🤖 AI recommendations received:', recommendations);
        
        // Trigger notifications at service level (only once per generation)
        if (recommendations.robotRecommendation) {
            console.log('🤖 Triggering notifications...');
            
            // TTS (check if enabled)
            if (settings?.aiNudgeTtsEnabled !== false && 'speechSynthesis' in window) {
                console.log('🤖 Playing TTS...');
                const utterance = new SpeechSynthesisUtterance(recommendations.robotRecommendation);
                speechSynthesis.speak(utterance);
            }

            // ntfy notification (check if both enabled and URL configured)
            if (settings?.aiNudgeNtfyEnabled !== false && settings?.ntfyUrl && recommendations.robotCharacter) {
                console.log('🤖 Sending ntfy notification...');
                const message = `🤖 ${recommendations.robotCharacter}: ${recommendations.robotRecommendation}`;
                fetch(settings.ntfyUrl, { 
                    method: 'POST', 
                    body: message, 
                    headers: { 'Title': 'AI Nudge Alert' } 
                }).catch(err => console.warn('Failed to send ntfy notification:', err));
            }
        }
        
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