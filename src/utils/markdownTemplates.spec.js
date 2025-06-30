// Basic smoke tests for markdownTemplates (run with `node markdownTemplates.spec.js`)
import assert from 'assert/strict';
import {
  generateProjectMarkdown,
  generateTaskMarkdown,
  generateDashboardMarkdown,
  projectFileName,
  taskFileName
} from './markdownTemplates.js';

const demoProject = { id: 'p1', title: 'Demo Project', category: 'Test', owner: 'Alice', createdAt: Date.now() };
const demoTask = { id: 't1', title: 'Task One', projectId: 'p1', createdAt: Date.now() };

// File names
assert.equal(projectFileName(demoProject), 'projects/demo-project.md');
assert.ok(taskFileName(demoTask).startsWith('tasks/task-one-'));

// Markdown generation should include frontmatter delimiters
assert.ok(generateProjectMarkdown(demoProject, [demoTask]).startsWith('---'));
assert.ok(generateTaskMarkdown(demoTask, demoProject).startsWith('---'));
assert.ok(generateDashboardMarkdown([demoProject], [demoTask]).includes('# Project Nudger Dashboard'));

console.log('✓ markdownTemplates basic tests passed');
