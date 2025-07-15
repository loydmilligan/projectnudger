// Simple cleanup script to remove all projects except the specified ones
// Run this with: node cleanup-projects.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration - you'll need to update this with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // You can find this in your Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Base path for your Firestore collections
const basePath = 'projectNudger'; // Update this to match your actual base path

// Projects to keep
const projectsToKeep = ["3dprints", "Trinium Sales", "Update Home assistant"];

async function cleanupProjects() {
  console.log('Starting cleanup...');
  console.log('Projects to keep:', projectsToKeep);

  let summary = {
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
    
    console.log('\nAnalyzing projects...');
    projectsSnapshot.forEach((docSnap) => {
      const project = { id: docSnap.id, ...docSnap.data() };
      
      if (projectsToKeep.includes(project.name)) {
        projectIdsToKeep.push(project.id);
        summary.projectsKept++;
        console.log(`✓ Keeping: ${project.name} (${project.id})`);
      } else {
        projectsToDelete.push(project);
        console.log(`✗ Will delete: ${project.name} (${project.id})`);
      }
    });
    
    // Delete unwanted projects
    console.log('\nDeleting projects...');
    for (const project of projectsToDelete) {
      try {
        await deleteDoc(doc(db, basePath, 'projects', project.id));
        summary.projectsDeleted++;
        console.log(`✓ Deleted project: ${project.name}`);
      } catch (error) {
        console.error(`✗ Error deleting project ${project.name}:`, error);
        summary.errors.push(`Failed to delete project: ${project.name}`);
      }
    }
    
    // Get all tasks
    const tasksRef = collection(db, basePath, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    
    console.log('\nAnalyzing tasks...');
    const tasksToDelete = [];
    
    tasksSnapshot.forEach((docSnap) => {
      const task = { id: docSnap.id, ...docSnap.data() };
      
      if (projectIdsToKeep.includes(task.projectId)) {
        summary.tasksKept++;
        console.log(`✓ Keeping task: ${task.title} (Project: ${task.projectId})`);
      } else {
        tasksToDelete.push(task);
        console.log(`✗ Will delete task: ${task.title} (Project: ${task.projectId || 'unknown'})`);
      }
    });
    
    // Delete unwanted tasks
    console.log('\nDeleting tasks...');
    for (const task of tasksToDelete) {
      try {
        await deleteDoc(doc(db, basePath, 'tasks', task.id));
        summary.tasksDeleted++;
        console.log(`✓ Deleted task: ${task.title}`);
      } catch (error) {
        console.error(`✗ Error deleting task ${task.title}:`, error);
        summary.errors.push(`Failed to delete task: ${task.title}`);
      }
    }
    
    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`Projects kept: ${summary.projectsKept}`);
    console.log(`Projects deleted: ${summary.projectsDeleted}`);
    console.log(`Tasks kept: ${summary.tasksKept}`);
    console.log(`Tasks deleted: ${summary.tasksDeleted}`);
    
    if (summary.errors.length > 0) {
      console.log('\nErrors encountered:');
      summary.errors.forEach(error => console.log(`- ${error}`));
    } else {
      console.log('\n✓ Cleanup completed successfully!');
    }
    
  } catch (error) {
    console.error('Fatal error during cleanup:', error);
  }
}

// Run the cleanup
cleanupProjects().then(() => {
  console.log('\nCleanup script finished.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});