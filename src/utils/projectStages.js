/**
 * Project Stage Management Utilities
 * 
 * Provides utility functions for managing project stages including
 * default configurations, validation, and migration logic.
 */

/**
 * Default project stages configuration
 * These represent a typical workflow from planning to completion
 */
export const getDefaultStages = () => [
    {
        id: 'planning',
        name: 'Planning',
        color: 'hsl(210, 60%, 55%)', // Blue
        order: 0,
        description: 'Projects in initial planning phase'
    },
    {
        id: 'in-progress',
        name: 'In Progress',
        color: 'hsl(45, 85%, 55%)', // Orange
        order: 1,
        description: 'Projects currently being worked on'
    },
    {
        id: 'review',
        name: 'Review',
        color: 'hsl(280, 60%, 55%)', // Purple
        order: 2,
        description: 'Projects awaiting review or feedback'
    },
    {
        id: 'complete',
        name: 'Complete',
        color: 'hsl(120, 50%, 50%)', // Green
        order: 3,
        description: 'Completed projects'
    }
];

/**
 * Validates a stage object to ensure it has all required properties
 * @param {Object} stage - The stage object to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validateStage = (stage) => {
    const errors = [];
    
    if (!stage) {
        errors.push('Stage object is required');
        return { isValid: false, errors };
    }
    
    if (!stage.id || typeof stage.id !== 'string' || stage.id.trim() === '') {
        errors.push('Stage must have a valid id');
    }
    
    if (!stage.name || typeof stage.name !== 'string' || stage.name.trim() === '') {
        errors.push('Stage must have a valid name');
    }
    
    if (!stage.color || typeof stage.color !== 'string' || stage.color.trim() === '') {
        errors.push('Stage must have a valid color');
    }
    
    if (typeof stage.order !== 'number' || stage.order < 0) {
        errors.push('Stage must have a valid order (non-negative number)');
    }
    
    // Validate color format (should be HSL)
    if (stage.color && !stage.color.match(/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/)) {
        errors.push('Stage color must be in HSL format (e.g., "hsl(210, 60%, 55%)")');
    }
    
    // Validate ID format (should be lowercase with hyphens only)
    if (stage.id && !stage.id.match(/^[a-z][a-z0-9-]*$/)) {
        errors.push('Stage ID must start with a letter and contain only lowercase letters, numbers, and hyphens');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Migrates existing projects to use stages if they don't already have them
 * @param {Array} projects - Array of project objects
 * @param {Array} stages - Array of available stages
 * @returns {Array} - Array of projects with stage field added where missing
 */
export const migrateProjectsToStages = (projects, stages = null) => {
    if (!projects || !Array.isArray(projects)) {
        return [];
    }
    
    const availableStages = stages || getDefaultStages();
    const defaultStage = availableStages[0]?.id || 'planning';
    
    return projects.map(project => {
        // If project already has a stage, keep it (if it's valid)
        if (project.stage) {
            const stageExists = availableStages.some(stage => stage.id === project.stage);
            if (stageExists) {
                return project;
            }
        }
        
        // Assign stage based on project status or default to first stage
        let newStage = defaultStage;
        
        if (project.status === 'completed' || project.status === 'complete') {
            const completeStage = availableStages.find(stage => 
                stage.id === 'complete' || stage.name.toLowerCase().includes('complete')
            );
            if (completeStage) {
                newStage = completeStage.id;
            }
        } else if (project.status === 'archived') {
            // Keep archived projects in their current stage or mark as complete
            const completeStage = availableStages.find(stage => 
                stage.id === 'complete' || stage.name.toLowerCase().includes('complete')
            );
            if (completeStage) {
                newStage = completeStage.id;
            }
        }
        
        return {
            ...project,
            stage: newStage
        };
    });
};

/**
 * Sorts stages by their order property
 * @param {Array} stages - Array of stage objects
 * @returns {Array} - Sorted array of stages
 */
export const sortStagesByOrder = (stages) => {
    if (!stages || !Array.isArray(stages)) {
        return [];
    }
    
    return [...stages].sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Finds a stage by its ID
 * @param {Array} stages - Array of stage objects
 * @param {string} stageId - ID of the stage to find
 * @returns {Object|null} - Found stage object or null
 */
export const findStageById = (stages, stageId) => {
    if (!stages || !Array.isArray(stages) || !stageId) {
        return null;
    }
    
    return stages.find(stage => stage.id === stageId) || null;
};

/**
 * Groups projects by their stage
 * @param {Array} projects - Array of project objects
 * @param {Array} stages - Array of stage objects
 * @returns {Object} - Object with stage IDs as keys and arrays of projects as values
 */
export const groupProjectsByStage = (projects, stages) => {
    if (!projects || !Array.isArray(projects)) {
        return {};
    }
    
    const availableStages = stages || getDefaultStages();
    const grouped = {};
    
    // Initialize groups for all stages
    availableStages.forEach(stage => {
        grouped[stage.id] = [];
    });
    
    // Group projects by stage
    projects.forEach(project => {
        const stageId = project.stage || availableStages[0]?.id || 'planning';
        if (!grouped[stageId]) {
            grouped[stageId] = [];
        }
        grouped[stageId].push(project);
    });
    
    return grouped;
};

/**
 * Generates a unique stage ID based on the stage name
 * @param {string} stageName - The name of the stage
 * @param {Array} existingStages - Array of existing stages to check for conflicts
 * @returns {string} - Generated unique stage ID
 */
export const generateStageId = (stageName, existingStages = []) => {
    if (!stageName || typeof stageName !== 'string') {
        return '';
    }
    
    // Convert to lowercase and replace spaces with hyphens
    let baseId = stageName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Ensure it starts with a letter
    if (baseId && !baseId.match(/^[a-z]/)) {
        baseId = 'stage-' + baseId;
    }
    
    if (!baseId) {
        baseId = 'stage';
    }
    
    // Check for conflicts and append number if needed
    let uniqueId = baseId;
    let counter = 1;
    
    while (existingStages.some(stage => stage.id === uniqueId)) {
        uniqueId = `${baseId}-${counter}`;
        counter++;
    }
    
    return uniqueId;
};

/**
 * Reorders stages based on new order array
 * @param {Array} stages - Array of stage objects
 * @param {Array} newOrder - Array of stage IDs in new order
 * @returns {Array} - Reordered array of stages with updated order properties
 */
export const reorderStages = (stages, newOrder) => {
    if (!stages || !Array.isArray(stages) || !newOrder || !Array.isArray(newOrder)) {
        return stages || [];
    }
    
    const stageMap = new Map(stages.map(stage => [stage.id, stage]));
    const reordered = [];
    
    // Add stages in the new order
    newOrder.forEach((stageId, index) => {
        const stage = stageMap.get(stageId);
        if (stage) {
            reordered.push({
                ...stage,
                order: index
            });
        }
    });
    
    // Add any stages that weren't in the new order at the end
    stages.forEach(stage => {
        if (!newOrder.includes(stage.id)) {
            reordered.push({
                ...stage,
                order: reordered.length
            });
        }
    });
    
    return reordered;
};