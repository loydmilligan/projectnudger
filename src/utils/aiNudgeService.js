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
 * Call OpenAI API to get AI nudge recommendations
 * @param {string} apiKey - OpenAI API key
 * @param {string} promptTemplate - Custom prompt template
 * @param {Object} projectData - Prepared project/task data
 * @returns {Promise<Object>} AI recommendations
 */
export async function getAINudgeRecommendations(apiKey, promptTemplate, projectData) {
    if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new Error('Valid OpenAI API key is required');
    }

    const systemPrompt = `${promptTemplate}

User's current project data:
${JSON.stringify(projectData, null, 2)}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: 'Please analyze my project data and provide structured recommendations in JSON format.'
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
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

        // Try to parse JSON from the AI response
        let recommendations;
        try {
            // Look for JSON in the response (may be wrapped in markdown code blocks)
            const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                             aiResponse.match(/(\{[\s\S]*\})/);
            
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[1]);
            } else {
                throw new Error('No valid JSON found in AI response');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse);
            throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
        }

        // Validate the response structure
        const requiredFields = ['urgentTasks', 'nearCompletionProjects', 'neglectedProjects', 'recommendedFocus', 'nudgeIntensity'];
        const robotFields = ['robotRecommendation', 'robotCharacter'];
        const missingFields = requiredFields.filter(field => !(field in recommendations));
        const missingRobotFields = robotFields.filter(field => !(field in recommendations));
        
        if (missingFields.length > 0) {
            console.warn('AI response missing required fields:', missingFields);
        }
        
        if (missingRobotFields.length > 0) {
            console.warn('AI response missing robot fields:', missingRobotFields);
        }
        
        // Fill in missing fields with defaults
        recommendations = {
            urgentTasks: [],
            nearCompletionProjects: [],
            neglectedProjects: [],
            recommendedFocus: 'Focus on completing your highest priority tasks.',
            nudgeIntensity: 'medium',
            robotRecommendation: 'INITIATING PRODUCTIVITY PROTOCOL. FOCUS ON YOUR HIGHEST PRIORITY TASKS, HUMAN.',
            robotCharacter: 'Generic Robot',
            ...recommendations
        };

        return {
            ...recommendations,
            timestamp: new Date().toISOString(),
            rawResponse: aiResponse
        };

    } catch (error) {
        console.error('AI Nudge Service Error:', error);
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
    // Check if AI nudges are enabled
    if (!settings.aiNudgeEnabled) {
        return null;
    }

    // Check if API key is available
    if (!settings.openaiApiKey) {
        console.warn('AI nudges enabled but no OpenAI API key provided');
        return null;
    }

    try {
        // Prepare data for AI analysis
        const projectData = prepareDataForAI(projects, tasks);
        
        // Get AI recommendations
        const recommendations = await getAINudgeRecommendations(
            settings.openaiApiKey,
            settings.aiPromptTemplate || 'You are a productivity coach. Analyze the project data and provide recommendations.',
            projectData
        );

        return recommendations;

    } catch (error) {
        console.error('Failed to generate AI nudge:', error);
        
        // Return a fallback nudge
        return {
            urgentTasks: [],
            nearCompletionProjects: [],
            neglectedProjects: [],
            recommendedFocus: 'Unable to generate AI recommendations. Please check your settings.',
            nudgeIntensity: 'low',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}