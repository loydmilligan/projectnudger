// src/config/obsidian.js
// Default configuration and helpers for Obsidian REST integration

export const DEFAULT_OBSIDIAN_CONFIG = {
    endpoint: '',              // e.g. "http://localhost:27123"
    apiKey: '',                // Local REST API key – leave blank if plugin has no auth
    vaultPath: 'Nudger',       // Sub-folder inside the vault where files will be written
    autoSync: 'manual',        // 'manual' | 'onChange' | 'timer'
};

/**
 * Merge user-saved settings (from Firebase) with safe defaults.
 * @param {object} userConfig
 * @returns {typeof DEFAULT_OBSIDIAN_CONFIG}
 */
export function getMergedObsidianConfig(userConfig = {}) {
    // Filter out undefined/null/blank string values so defaults stay intact
    const sanitized = Object.fromEntries(
        Object.entries(userConfig).filter(([_, v]) => {
            if (v === undefined || v === null) return false;
            if (typeof v === 'string' && v.trim() === '') return false;
            return true;
        })
    );
    const merged = { ...DEFAULT_OBSIDIAN_CONFIG, ...sanitized };
    if (!merged.vaultPath || merged.vaultPath.trim() === '') {
        merged.vaultPath = DEFAULT_OBSIDIAN_CONFIG.vaultPath;
    }
    return merged;
}
