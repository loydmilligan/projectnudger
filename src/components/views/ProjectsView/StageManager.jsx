import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    GripVertical, 
    X, 
    Save, 
    RotateCcw,
    AlertCircle,
    Loader2 
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { validateStage, generateStageId } from '../../../utils/projectStages';

/**
 * Modal component for managing project stages (add, edit, delete, reorder)
 * Provides full CRUD functionality for project workflow customization
 */
function StageManager({ 
    isOpen, 
    onClose, 
    stages, 
    onAddStage, 
    onUpdateStage, 
    onDeleteStage, 
    onReorderStages,
    onResetToDefaults,
    isLoading = false 
}) {
    const [localStages, setLocalStages] = useState([]);
    const [editingStage, setEditingStage] = useState(null);
    const [newStage, setNewStage] = useState({ name: '', color: 'hsl(210, 60%, 55%)', description: '' });
    const [activeId, setActiveId] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize local stages when modal opens
    useEffect(() => {
        if (isOpen && stages) {
            setLocalStages([...stages]);
            setErrors({});
        }
    }, [isOpen, stages]);

    // Handle modal close
    const handleClose = () => {
        setEditingStage(null);
        setNewStage({ name: '', color: 'hsl(210, 60%, 55%)', description: '' });
        setErrors({});
        onClose();
    };

    // Handle add new stage
    const handleAddStage = async () => {
        try {
            setSaving(true);
            setErrors({});

            const stageToAdd = {
                ...newStage,
                id: generateStageId(newStage.name, localStages),
                order: localStages.length
            };

            const validation = validateStage(stageToAdd);
            if (!validation.isValid) {
                setErrors({ newStage: validation.errors.join(', ') });
                return;
            }

            const result = await onAddStage(stageToAdd);
            if (result.success) {
                setNewStage({ name: '', color: 'hsl(210, 60%, 55%)', description: '' });
            } else {
                setErrors({ newStage: result.error });
            }
        } catch (error) {
            setErrors({ newStage: error.message });
        } finally {
            setSaving(false);
        }
    };

    // Handle update stage
    const handleUpdateStage = async (stageId, updates) => {
        try {
            setSaving(true);
            setErrors({});

            const result = await onUpdateStage(stageId, updates);
            if (result.success) {
                setEditingStage(null);
            } else {
                setErrors({ [stageId]: result.error });
            }
        } catch (error) {
            setErrors({ [stageId]: error.message });
        } finally {
            setSaving(false);
        }
    };

    // Handle delete stage
    const handleDeleteStage = async (stageId) => {
        if (localStages.length <= 1) {
            setErrors({ [stageId]: 'Cannot delete the last remaining stage' });
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this stage? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            setSaving(true);
            setErrors({});

            const result = await onDeleteStage(stageId);
            if (!result.success) {
                setErrors({ [stageId]: result.error });
            }
        } catch (error) {
            setErrors({ [stageId]: error.message });
        } finally {
            setSaving(false);
        }
    };

    // Handle drag end for reordering
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            const oldIndex = localStages.findIndex(stage => stage.id === active.id);
            const newIndex = localStages.findIndex(stage => stage.id === over.id);
            
            const newOrder = arrayMove(localStages, oldIndex, newIndex);
            setLocalStages(newOrder);
            
            // Update order in database
            const newStageOrder = newOrder.map(stage => stage.id);
            await onReorderStages(newStageOrder);
        }
    };

    // Handle reset to defaults
    const handleResetToDefaults = async () => {
        const confirmReset = window.confirm('Are you sure you want to reset to default stages? This will replace all current stages.');
        if (!confirmReset) return;

        try {
            setSaving(true);
            setErrors({});

            const result = await onResetToDefaults();
            if (!result.success) {
                setErrors({ general: result.error });
            }
        } catch (error) {
            setErrors({ general: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Manage Project Stages
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* General error */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add new stage section */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Add New Stage</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="Stage name"
                                value={newStage.name}
                                onChange={e => setNewStage(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-2 text-sm"
                            />
                            <input
                                type="color"
                                value={newStage.color.match(/hsl\((\d+),/) ? `#${Math.round(parseInt(newStage.color.match(/hsl\((\d+),/)[1]) * 255 / 360).toString(16).padStart(2, '0')}${Math.round(parseInt(newStage.color.match(/(\d+)%.*(\d+)%/)[1]) * 255 / 100).toString(16).padStart(2, '0')}${Math.round(parseInt(newStage.color.match(/(\d+)%.*(\d+)%/)[2]) * 255 / 100).toString(16).padStart(2, '0')}` : '#3b82f6'}
                                onChange={e => {
                                    const hex = e.target.value;
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    const hsl = rgbToHsl(r, g, b);
                                    setNewStage(prev => ({ ...prev, color: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }));
                                }}
                                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-1 h-10"
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleAddStage}
                                    disabled={!newStage.name.trim() || saving}
                                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    <span>Add</span>
                                </button>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={newStage.description}
                            onChange={e => setNewStage(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full mt-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-2 text-sm"
                        />
                        {errors.newStage && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.newStage}</p>
                        )}
                    </div>

                    {/* Existing stages list */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium">Current Stages</h3>
                            <button
                                onClick={handleResetToDefaults}
                                disabled={saving}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                <RotateCcw size={14} />
                                <span>Reset to Defaults</span>
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={({ active }) => setActiveId(active.id)}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={localStages.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {localStages.map(stage => (
                                        <SortableStageItem
                                            key={stage.id}
                                            stage={stage}
                                            isEditing={editingStage?.id === stage.id}
                                            onEdit={() => setEditingStage(stage)}
                                            onSave={(updates) => handleUpdateStage(stage.id, updates)}
                                            onCancel={() => setEditingStage(null)}
                                            onDelete={() => handleDeleteStage(stage.id)}
                                            error={errors[stage.id]}
                                            saving={saving}
                                            canDelete={localStages.length > 1}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            <DragOverlay>
                                {activeId ? (
                                    <SortableStageItem
                                        stage={localStages.find(s => s.id === activeId)}
                                        isDragging={true}
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper component for sortable stage items
function SortableStageItem({ 
    stage, 
    isEditing = false, 
    onEdit, 
    onSave, 
    onCancel, 
    onDelete, 
    error, 
    saving = false, 
    canDelete = true,
    isDragging = false 
}) {
    const [name, setName] = useState(stage.name);
    const [description, setDescription] = useState(stage.description || '');
    const [color, setColor] = useState(stage.color);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: stage.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    useEffect(() => {
        if (isEditing) {
            setName(stage.name);
            setDescription(stage.description || '');
            setColor(stage.color);
        }
    }, [isEditing, stage]);

    const handleSave = () => {
        onSave({ name: name.trim(), description: description.trim(), color });
    };

    if (isEditing) {
        return (
            <div className="p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-2 text-sm"
                        placeholder="Stage name"
                    />
                    <input
                        type="color"
                        value={color.match(/hsl\((\d+),/) ? `#${Math.round(parseInt(color.match(/hsl\((\d+),/)[1]) * 255 / 360).toString(16).padStart(2, '0')}${Math.round(parseInt(color.match(/(\d+)%.*(\d+)%/)[1]) * 255 / 100).toString(16).padStart(2, '0')}${Math.round(parseInt(color.match(/(\d+)%.*(\d+)%/)[2]) * 255 / 100).toString(16).padStart(2, '0')}` : '#3b82f6'}
                        onChange={e => {
                            const hex = e.target.value;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            const hsl = rgbToHsl(r, g, b);
                            setColor(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
                        }}
                        className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-1 h-10"
                    />
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={!name.trim() || saving}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-sm transition-colors"
                        >
                            <Save size={14} />
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={saving}
                            className="flex items-center space-x-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-md text-sm transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-2 text-sm"
                    placeholder="Description (optional)"
                />
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
        >
            <div className="flex items-center space-x-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                    <GripVertical size={16} className="text-gray-400" />
                </div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                <div>
                    <p className="font-medium">{stage.name}</p>
                    {stage.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stage.description}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onEdit}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-600 dark:text-gray-400"
                >
                    <Edit2 size={14} />
                </button>
                {canDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 ml-2">{error}</p>}
        </div>
    );
}

// Helper function to convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export default StageManager;