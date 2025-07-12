import { writeBatch, doc, collection } from 'firebase/firestore';
import { db, basePath } from '../config/firebase';

export const generateDummyData = async (skipConfirmation = false) => {
   if (!skipConfirmation) {
       // Return a confirmation request object for the calling component to handle
       return { 
           needsConfirmation: true, 
           message: "This will add several dummy projects and tasks to your database, replacing existing data. Are you sure?" 
       };
   }

   try {
       const batch = writeBatch(db);
       const dummyCategories = {
            "Work": "hsl(210, 70%, 50%)",
            "Personal": "hsl(140, 70%, 50%)",
            "Learning": "hsl(45, 70%, 50%)"
        };

       batch.set(doc(db, basePath, 'settings', 'categories'), dummyCategories);

       const projectsToAdd = [
           {
                id: 'dummy_proj_1',
                name: 'Q3 Report Finalization',
                owner: 'Matt Mariani',
                category: 'Work',
                priority: 10,
                status: 'active',
                createdAt: new Date()
            },
           {
                id: 'dummy_proj_2',
                name: 'Home Reno Planning',
                owner: 'Mara Mariani',
                category: 'Personal',
                priority: 5,
                status: 'active',
                createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000)
            },
           {
                id: 'dummy_proj_3',
                name: 'Learn Rust Programming',
                owner: 'Matt Mariani',
                category: 'Learning',
                priority: 3,
                status: 'inactive',
                createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000)
            },
       ];

       const tasksToAdd = [
           {
                projectId: 'dummy_proj_1',
                title: "Compile financial data",
                detail: "Get spreadsheets from finance team.",
                status: 'idle',
                isComplete: false
            },
           {
                projectId: 'dummy_proj_1',
                title: "Draft executive summary",
                detail: "",
                status: 'idle',
                isComplete: false
            },
           {
                projectId: 'dummy_proj_2',
                title: "Get quotes for kitchen cabinets",
                detail: "",
                status: 'idle',
                isComplete: false
            },
           {
                projectId: 'dummy_proj_2',
                title: "Choose paint colors",
                detail: "Leaning towards a neutral gray.",
                status: 'idle',
                isComplete: false
            },
           {
                projectId: 'dummy_proj_3',
                title: "Read the official Rust book",
                detail: "Focus on chapters 1-5.",
                status: 'idle',
                isComplete: false
            },
       ];

       projectsToAdd.forEach(proj =>
            batch.set(doc(db, basePath, 'projects', proj.id), proj)
       );
       tasksToAdd.forEach(task =>
            batch.set(doc(collection(db, basePath, 'tasks')), task)
       );

       await batch.commit();
       return { success: true, message: "Dummy data generated successfully!" };
   } catch (error) {
       console.error("Dummy data generation failed:", error);
       return { success: false, message: "Failed to generate dummy data. Check console for details.", error };
   }
};