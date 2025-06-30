// src/utils/markdownTemplates.js
// Generates Obsidian-ready markdown files from Project Nudger data
// Keeping logic lightweight – we only rely on standard JS (no extra deps)

import { format } from 'date-fns';

function safe(date) {
    if (!date) return '';
    try {
        return format(typeof date === 'string' ? new Date(date) : date, 'yyyy-MM-dd HH:mm');
    } catch (_) {
        return '';
    }
}

export function generateProjectMarkdown(project, tasks = []) {
    if (!project) throw new Error('project required');
    const completed = tasks.filter(t => t.isComplete).length;
    const total = tasks.length;
    const completion = total ? Math.round((completed / total) * 100) : 0;

    const frontmatter = `---\nid: ${project.id}\ntitle: "${project.title}"\nowner: ${project.owner || ''}\ncategory: ${project.category || ''}\nstatus: ${project.status || 'active'}\ncreated: ${safe(project.createdAt)}\nupdated: ${safe(project.updatedAt)}\ncompletion: ${completion}\n---`;

    const taskLines = tasks.map(t => {
        const status = t.isComplete ? 'x' : ' ';
        return `- [${status}] [[${taskFileName(t)}]]`;
    }).join('\n');

    return `${frontmatter}

## Overview

- **Completion:** ${completion}% (${completed}/${total} tasks)
- **Category:** ${project.category || '—'}
- **Owner:** ${project.owner || '—'}

## Tasks

${taskLines || '_No tasks yet_'}
`;
}

export function generateTaskMarkdown(task, project) {
    if (!task) throw new Error('task required');
    const frontmatter = `---\nid: ${task.id}\ntitle: "${task.title}"\nproject: ${project ? project.id : task.projectId}
project_name: "${project ? (project.title || project.name) : ''}"\nstatus: ${task.status || 'idle'}\ndue: ${safe(task.dueDate)}\ncreated: ${safe(task.createdAt)}\nupdated: ${safe(task.updatedAt)}\n---`;

    const box = task.isComplete ? 'x' : ' ';
    const tagsLine = Array.isArray(task.tags) && task.tags.length
        ? ' ' + task.tags.map(t => `#${slug(t)}`).join(' ')
        : '';
    const taskLine = `- [${box}] ${task.title}${tagsLine}`;
    return `${frontmatter}

${taskLine}

${task.detail || ''}
`;
}

export function generateDashboardMarkdown(projects = [], tasks = []) {
    const header = `# Project Nudger Dashboard\n_Last sync: ${format(new Date(), 'yyyy-MM-dd HH:mm')}_`;
    const projectLines = projects.map(p => `- [[${projectFileName(p)}|${p.title || p.name}]] (${p.status || 'active'})`).join('\n');
    const urgentTasks = tasks.filter(t => !t.isComplete && t.dueDate && new Date(t.dueDate) < Date.now());
    const urgentLines = urgentTasks.map(t => `- ⚠️ [[${taskFileName(t)}]] _(due ${safe(t.dueDate)})_`).join('\n');

    return `${header}

## Projects
${projectLines || '_No projects_'}

## Urgent Tasks
${urgentLines || '🎉 No overdue tasks'}
`;
}

// Helper names (files under vaultPath/<type>/...)
export function projectFileName(project) {
    const base = slug(project.title || project.name || project.id || 'project');
    return `projects/${base}.md`;
}
export function taskFileName(task) {
    return `tasks/${slug(task.title)}-${task.id}.md`;
}

function slug(str = '') {
    if (!str) return 'untitled';
    return str.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'untitled';
}
