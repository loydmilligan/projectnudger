// Tests for Task-3.1: Project Action Buttons
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  mockFirebase,
  createMockProject,
  createMockTask,
  renderWithProviders
} from './test-utils.jsx';
import ProjectsView from '../src/components/views/ProjectsView.jsx';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Edit2: ({ size, ...props }) => <span data-testid="edit2-icon" {...props}>Edit2</span>,
  Trash2: ({ size, ...props }) => <span data-testid="trash2-icon" {...props}>Trash2</span>,
  Archive: ({ size, ...props }) => <span data-testid="archive-icon" {...props}>Archive</span>
}));

describe('Project Action Buttons - Task 3.1', () => {
  let mockProps;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockProps = {
      projects: [
        createMockProject({ id: 'project-1', name: 'Test Project 1', category: 'work' }),
        createMockProject({ id: 'project-2', name: 'Test Project 2', category: 'personal' })
      ],
      tasks: [
        createMockTask({ id: 'task-1', projectId: 'project-1', isComplete: false, title: 'Task 1' }),
        createMockTask({ id: 'task-2', projectId: 'project-1', isComplete: false, title: 'Task 2' }),
        createMockTask({ id: 'task-3', projectId: 'project-2', isComplete: false, title: 'Task 3' })
      ],
      setSelectedProjectId: vi.fn(),
      categories: { work: '#3B82F6', personal: '#10B981' },
      ownerFilter: 'All',
      setOwnerFilter: vi.fn(),
      owners: ['All', 'John Doe'],
      onCompleteTask: vi.fn(),
      onStartTask: vi.fn(),
      onEditTask: vi.fn(),
      onEditProject: vi.fn(),
      onDeleteProject: vi.fn(),
      onArchiveProject: vi.fn()
    };
  });

  it('renders project action buttons (edit, archive, delete)', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    // Should render action buttons for each project
    const editButtons = screen.getAllByTestId('edit2-icon');
    const archiveButtons = screen.getAllByTestId('archive-icon');
    const deleteButtons = screen.getAllByTestId('trash2-icon');
    
    expect(editButtons).toHaveLength(2); // One for each project
    expect(archiveButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onEditProject when edit button is clicked', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    const editButtons = screen.getAllByTestId('edit2-icon');
    const firstEditButton = editButtons[0].closest('button');
    
    fireEvent.click(firstEditButton);
    
    expect(mockProps.onEditProject).toHaveBeenCalledTimes(1);
    expect(mockProps.onEditProject).toHaveBeenCalledWith(mockProps.projects[0]);
  });

  it('calls onArchiveProject when archive button is clicked', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    const archiveButtons = screen.getAllByTestId('archive-icon');
    const firstArchiveButton = archiveButtons[0].closest('button');
    
    fireEvent.click(firstArchiveButton);
    
    expect(mockProps.onArchiveProject).toHaveBeenCalledTimes(1);
    expect(mockProps.onArchiveProject).toHaveBeenCalledWith('project-1');
  });

  it('calls onDeleteProject when delete button is clicked', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    const deleteButtons = screen.getAllByTestId('trash2-icon');
    const firstDeleteButton = deleteButtons[0].closest('button');
    
    fireEvent.click(firstDeleteButton);
    
    expect(mockProps.onDeleteProject).toHaveBeenCalledTimes(1);
    expect(mockProps.onDeleteProject).toHaveBeenCalledWith('project-1');
  });

  it('maintains existing project card layout with action buttons', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    // Should still show project names
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    
    // Should still show categories
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    
    // Should still show View Details buttons
    const viewDetailsButtons = screen.getAllByText('View Details');
    expect(viewDetailsButtons).toHaveLength(2);
  });

  it('prevents event propagation when action buttons are clicked', () => {
    const setSelectedProjectId = vi.fn();
    const props = { ...mockProps, setSelectedProjectId };
    
    renderWithProviders(<ProjectsView {...props} />);
    
    const editButtons = screen.getAllByTestId('edit2-icon');
    const firstEditButton = editButtons[0].closest('button');
    
    // Click edit button should not trigger project selection
    fireEvent.click(firstEditButton);
    
    expect(props.onEditProject).toHaveBeenCalled();
    expect(setSelectedProjectId).not.toHaveBeenCalled();
  });

  it('shows task count for projects', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    // Should show "Next Tasks:" headers
    const taskHeaders = screen.getAllByText('Next Tasks:');
    expect(taskHeaders).toHaveLength(2);
    
    // Should show task titles
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('applies proper styling classes to action buttons', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    const editButtons = screen.getAllByTestId('edit2-icon');
    const editButton = editButtons[0].closest('button');
    
    // Check that button has appropriate classes for styling
    expect(editButton).toHaveClass('p-1.5', 'rounded-md', 'transition-colors');
  });

  it('provides appropriate tooltips for action buttons', () => {
    renderWithProviders(<ProjectsView {...mockProps} />);
    
    const editButtons = screen.getAllByTestId('edit2-icon');
    const archiveButtons = screen.getAllByTestId('archive-icon');
    const deleteButtons = screen.getAllByTestId('trash2-icon');
    
    const editButton = editButtons[0].closest('button');
    const archiveButton = archiveButtons[0].closest('button');
    const deleteButton = deleteButtons[0].closest('button');
    
    expect(editButton).toHaveAttribute('title', 'Edit project');
    expect(archiveButton).toHaveAttribute('title', 'Archive project');
    expect(deleteButton).toHaveAttribute('title', 'Delete project');
  });
});