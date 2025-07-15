import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, basePath } from '../config/firebase';

/**
 * Clean up all projects and tasks except for specified projects
 * @param {Array} projectsToKeep - Array of project names to keep
 * @returns {Object} Summary of cleanup operation
 */
export const cleanupProjectsAndTasks = async (projectsToKeep = []) => {
  const summary = {
    projectsDeleted: 0,
    projectsKept: 0,
    tasksDeleted: 0,
    tasksKept: 0,
    errors: []
  };

  try {
    // Get all projects
    const projectsRef = collection(db, basePath, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    
    const projectsToDelete = [];
    const projectIdsToKeep = [];
    
    // Identify projects to delete and keep
    projectsSnapshot.forEach((doc) => {
      const project = { id: doc.id, ...doc.data() };
      
      if (projectsToKeep.includes(project.name)) {
        projectIdsToKeep.push(project.id);
        summary.projectsKept++;
        console.log(`Keeping project: ${project.name} (${project.id})`);
      } else {
        projectsToDelete.push(project);
        console.log(`Marking for deletion: ${project.name} (${project.id})`);
      }
    });
    
    // Delete unwanted projects
    for (const project of projectsToDelete) {
      try {
        await deleteDoc(doc(db, basePath, 'projects', project.id));
        summary.projectsDeleted++;
        console.log(`Deleted project: ${project.name}`);
      } catch (error) {
        console.error(`Error deleting project ${project.name}:`, error);
        summary.errors.push(`Failed to delete project: ${project.name}`);
      }
    }
    
    // Get all tasks
    const tasksRef = collection(db, basePath, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    
    // Delete tasks not associated with kept projects
    const tasksToDelete = [];
    
    tasksSnapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() };
      
      if (projectIdsToKeep.includes(task.projectId)) {
        summary.tasksKept++;
        console.log(`Keeping task: ${task.title} (Project: ${task.projectId})`);
      } else {
        tasksToDelete.push(task);
        console.log(`Marking task for deletion: ${task.title}`);
      }
    });
    
    // Delete unwanted tasks
    for (const task of tasksToDelete) {
      try {
        await deleteDoc(doc(db, basePath, 'tasks', task.id));
        summary.tasksDeleted++;
        console.log(`Deleted task: ${task.title}`);
      } catch (error) {
        console.error(`Error deleting task ${task.title}:`, error);
        summary.errors.push(`Failed to delete task: ${task.title}`);
      }
    }
    
    return summary;
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    summary.errors.push(`General cleanup error: ${error.message}`);
    return summary;
  }
};

/**
 * Get a preview of what would be deleted without actually deleting
 * @param {Array} projectsToKeep - Array of project names to keep
 * @returns {Object} Preview of what would be deleted
 */
export const previewCleanup = async (projectsToKeep = []) => {
  const preview = {
    projectsToDelete: [],
    projectsToKeep: [],
    tasksToDelete: [],
    tasksToKeep: [],
    errors: []
  };

  try {
    // Get all projects
    const projectsRef = collection(db, basePath, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    
    const projectIdsToKeep = [];
    
    // Categorize projects
    projectsSnapshot.forEach((doc) => {
      const project = { id: doc.id, ...doc.data() };
      
      if (projectsToKeep.includes(project.name)) {
        projectIdsToKeep.push(project.id);
        preview.projectsToKeep.push({
          id: project.id,
          name: project.name,
          status: project.status
        });
      } else {
        preview.projectsToDelete.push({
          id: project.id,
          name: project.name,
          status: project.status
        });
      }
    });
    
    // Get all tasks
    const tasksRef = collection(db, basePath, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    
    // Categorize tasks
    tasksSnapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() };
      
      if (projectIdsToKeep.includes(task.projectId)) {
        preview.tasksToKeep.push({
          id: task.id,
          title: task.title,
          projectId: task.projectId
        });
      } else {
        preview.tasksToDelete.push({
          id: task.id,
          title: task.title,
          projectId: task.projectId
        });
      }
    });
    
    return preview;
    
  } catch (error) {
    console.error('Error during preview:', error);
    preview.errors.push(`Preview error: ${error.message}`);
    return preview;
  }
};