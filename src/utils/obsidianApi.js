// src/utils/obsidianApi.js
// Minimal REST API client for Obsidian Local REST plugin

import { getMergedObsidianConfig } from '../config/obsidian';

const DEFAULT_TIMEOUT = 8000; // ms

function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), ms)
    );
    return Promise.race([promise, timeout]);
}

export default class ObsidianApi {
    /**
     * @param {object} userConfig – user-saved settings
     */
    constructor(userConfig = {}) {
        this.cfg = getMergedObsidianConfig(userConfig);
        if (!this.cfg.endpoint) {
            console.warn('[ObsidianApi] No endpoint configured');
        }
    }

    _buildHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.cfg.apiKey) headers['Authorization'] = `Bearer ${this.cfg.apiKey}`;
        return headers;
    }

    async _request(path, options = {}) {
        if (!this.cfg.endpoint) throw new Error('Obsidian endpoint not set');
        const url = `${this.cfg.endpoint}${path}`;
        const baseHeaders = this._buildHeaders();
        // Merge headers allowing per-call overrides
        const fetchOpts = { ...options, headers: { ...baseHeaders, ...(options.headers || {}) } };
        return withTimeout(fetch(url, fetchOpts), DEFAULT_TIMEOUT).then(async res => {
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`Obsidian API error ${res.status}: ${body}`);
            }
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                return res.json();
            }
            // Fallback to raw text (e.g., markdown file contents or empty responses)
            return res.text();
        });
    }

    // === Public methods ===
    async testConnection() {
        return this._request('/', { method: 'GET' });
    }

    /**
     * PUT note; returns true if file was newly created (HTTP 201), false if replaced (204)
     */
    async writeNote(path, content) {
        const fullPath = `/vault/${encodeURI(this._fullPath(path))}`;
        const url = `${this.cfg.endpoint}${fullPath}`;
        const headers = { ...this._buildHeaders(), 'Content-Type': 'text/markdown' };
        const res = await withTimeout(fetch(url, { method: 'PUT', headers, body: content }), DEFAULT_TIMEOUT);
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Obsidian API error ${res.status}: ${body}`);
        }
        return res.status === 201; // 201 Created vs 204 No Content
    }

    createOrReplaceNote(path, content) {
        return this._request(`/vault/${encodeURI(this._fullPath(path))}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'text/markdown' },
            body: content,
        });
    }

    /* Alias—PUT creates or overwrites, so both update and create use same call */
    updateNote(path, content) {
        return this.writeNote(path, content);
    }

    // Backwards compatibility for existing code
    createNote(path, content) {
        return this.writeNote(path, content);
    }

    

    deleteNote(path) {
        return this._request(`/vault/${encodeURI(this._fullPath(path))}`, {
            method: 'DELETE',
        });
    }

    getNote(path) {
        return this._request(`/vault/${encodeURI(this._fullPath(path))}`, {
            method: 'GET',
            // Prefer markdown; caller can request JSON via Accept header override
        });
    }

    listNotes(dirPath = '') {
        const dir = this._fullPath(dirPath);
        const pathSegment = dir ? `${encodeURI(dir)}/` : '';
        return this._request(`/vault/${pathSegment}`, { method: 'GET' });
    }

    _fullPath(relPath) {
        // Gracefully handle empty or undefined vaultPath
        if (!this.cfg.vaultPath) return relPath;
        return `${this.cfg.vaultPath}/${relPath}`.replace(/\\/g, '/');
    }
}
