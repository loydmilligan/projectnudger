// src/components/shared/ObsidianSyncProgressModal.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ObsidianSyncProgressModal({ state, result, error, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm flex flex-col items-center" onClick={e => e.stopPropagation()}>
                {state === 'syncing' && (
                    <>
                        <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Syncing to Obsidian…</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Please keep this tab open. Your notes will appear in your vault shortly.
                        </p>
                    </>
                )}

                {state === 'completed' && (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <h3 className="text-lg font-semibold mb-2">Sync Complete</h3>
                        {result && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-4">
                                {result.created} created, {result.updated} updated, {result.total} total files.
                            </p>
                        )}
                        <button onClick={onClose} className="px-4 py-2 rounded-md bg-indigo-600 text-white mt-1">Close</button>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        <h3 className="text-lg font-semibold mb-2">Sync Failed</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 text-center mb-4">{error || 'Unknown error'}</p>
                        <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700">Dismiss</button>
                    </>
                )}
            </div>
        </div>
    );
}
