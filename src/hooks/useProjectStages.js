import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, basePath } from '../config/firebase';
import { 
    getDefaultStages, 
    validateStage, 
    sortStagesByOrder, 
    generateStageId,
    reorderStages
} from '../utils/projectStages';

/**
 * Custom hook for managing project stages state and Firebase operations
 * Provides complete stage management functionality including CRUD operations,
 * real-time updates, and validation
 */
export const useProjectStages = () => {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // Initialize stages from Firebase
    useEffect(() => {
        const stagesDocRef = doc(db, basePath, 'settings', 'projectStages');
        
        const unsubscribe = onSnapshot(stagesDocRef, 
            (doc) => {
                try {
                    if (doc.exists()) {
                        const data = doc.data();
                        if (data.stages && Array.isArray(data.stages)) {
                            setStages(sortStagesByOrder(data.stages));
                        } else {
                            // No stages found, initialize with defaults
                            const defaultStages = getDefaultStages();
                            setStages(defaultStages);
                            // Save defaults to Firebase
                            setDoc(stagesDocRef, { stages: defaultStages }, { merge: true })
                                .catch(err => console.error('Error saving default stages:', err));
                        }
                    } else {
                        // Document doesn't exist, create with defaults
                        const defaultStages = getDefaultStages();
                        setStages(defaultStages);
                        setDoc(stagesDocRef, { stages: defaultStages })
                            .catch(err => console.error('Error creating stages document:', err));
                    }
                    setLoading(false);
                    setError(null);
                } catch (err) {
                    console.error('Error processing stages data:', err);
                    setError('Failed to load project stages');
                    setLoading(false);
                }
            },
            (err) => {
                console.error('Error listening to stages:', err);
                setError('Failed to connect to project stages');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Save stages to Firebase
    const saveStages = useCallback(async (newStages) => {
        try {
            setSaving(true);
            setError(null);
            
            const stagesDocRef = doc(db, basePath, 'settings', 'projectStages');
            await setDoc(stagesDocRef, { stages: newStages }, { merge: true });
            
            return { success: true };
        } catch (err) {
            console.error('Error saving stages:', err);
            setError('Failed to save project stages');
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    // Add a new stage
    const addStage = useCallback(async (stageData) => {
        try {
            setSaving(true);
            setError(null);

            // Generate ID if not provided
            const stageId = stageData.id || generateStageId(stageData.name, stages);
            
            const newStage = {
                id: stageId,
                name: stageData.name,
                color: stageData.color,
                description: stageData.description || '',
                order: stageData.order !== undefined ? stageData.order : stages.length
            };

            // Validate the new stage
            const validation = validateStage(newStage);
            if (!validation.isValid) {
                throw new Error(`Invalid stage data: ${validation.errors.join(', ')}`);
            }

            // Check for duplicate IDs
            if (stages.some(stage => stage.id === newStage.id)) {
                throw new Error(`Stage with ID "${newStage.id}" already exists`);
            }

            const updatedStages = [...stages, newStage];
            const result = await saveStages(sortStagesByOrder(updatedStages));
            
            if (result.success) {
                return { success: true, stage: newStage };
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error adding stage:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [stages, saveStages]);

    // Update an existing stage
    const updateStage = useCallback(async (stageId, stageData) => {
        try {
            setSaving(true);
            setError(null);

            const stageIndex = stages.findIndex(stage => stage.id === stageId);
            if (stageIndex === -1) {
                throw new Error(`Stage with ID "${stageId}" not found`);
            }

            const updatedStage = {
                ...stages[stageIndex],
                ...stageData,
                id: stageId // Ensure ID cannot be changed
            };

            // Validate the updated stage
            const validation = validateStage(updatedStage);
            if (!validation.isValid) {
                throw new Error(`Invalid stage data: ${validation.errors.join(', ')}`);
            }

            const updatedStages = [...stages];
            updatedStages[stageIndex] = updatedStage;
            
            const result = await saveStages(sortStagesByOrder(updatedStages));
            
            if (result.success) {
                return { success: true, stage: updatedStage };
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error updating stage:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [stages, saveStages]);

    // Delete a stage
    const deleteStage = useCallback(async (stageId) => {
        try {
            setSaving(true);
            setError(null);

            const stageIndex = stages.findIndex(stage => stage.id === stageId);
            if (stageIndex === -1) {
                throw new Error(`Stage with ID "${stageId}" not found`);
            }

            // Prevent deletion if it's the only stage
            if (stages.length <= 1) {
                throw new Error('Cannot delete the last remaining stage');
            }

            const updatedStages = stages.filter(stage => stage.id !== stageId);
            const result = await saveStages(updatedStages);
            
            if (result.success) {
                return { success: true, deletedStageId: stageId };
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error deleting stage:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [stages, saveStages]);

    // Reorder stages
    const reorderStageList = useCallback(async (newStageOrder) => {
        try {
            setSaving(true);
            setError(null);

            const reorderedStages = reorderStages(stages, newStageOrder);
            const result = await saveStages(reorderedStages);
            
            if (result.success) {
                return { success: true, stages: reorderedStages };
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error reordering stages:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [stages, saveStages]);

    // Reset to default stages
    const resetToDefaults = useCallback(async () => {
        try {
            setSaving(true);
            setError(null);

            const defaultStages = getDefaultStages();
            const result = await saveStages(defaultStages);
            
            if (result.success) {
                return { success: true, stages: defaultStages };
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error resetting to default stages:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [saveStages]);

    // Get a stage by ID
    const getStageById = useCallback((stageId) => {
        return stages.find(stage => stage.id === stageId) || null;
    }, [stages]);

    // Check if a stage ID exists
    const stageExists = useCallback((stageId) => {
        return stages.some(stage => stage.id === stageId);
    }, [stages]);

    // Get the next stage in order
    const getNextStage = useCallback((currentStageId) => {
        const currentIndex = stages.findIndex(stage => stage.id === currentStageId);
        if (currentIndex === -1 || currentIndex === stages.length - 1) {
            return null;
        }
        return stages[currentIndex + 1];
    }, [stages]);

    // Get the previous stage in order
    const getPreviousStage = useCallback((currentStageId) => {
        const currentIndex = stages.findIndex(stage => stage.id === currentStageId);
        if (currentIndex <= 0) {
            return null;
        }
        return stages[currentIndex - 1];
    }, [stages]);

    return {
        // State
        stages: sortStagesByOrder(stages),
        loading,
        error,
        saving,
        
        // CRUD operations
        addStage,
        updateStage,
        deleteStage,
        reorderStageList,
        resetToDefaults,
        
        // Utility functions
        getStageById,
        stageExists,
        getNextStage,
        getPreviousStage
    };
};