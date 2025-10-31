// Kanban Board Store - Manages drag-and-drop state
import { create } from 'zustand';
import { TaskWithRelations, KanbanColumn } from '@/types';

interface KanbanState {
  activeTaskId: string | null;
  activeColumn: KanbanColumn | null;
  isDragging: boolean;

  // Actions
  setActiveTask: (taskId: string | null, column: KanbanColumn | null) => void;
  setIsDragging: (dragging: boolean) => void;
  clearActive: () => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  activeTaskId: null,
  activeColumn: null,
  isDragging: false,

  setActiveTask: (taskId, column) => set({ activeTaskId: taskId, activeColumn: column }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  clearActive: () => set({ activeTaskId: null, activeColumn: null, isDragging: false }),
}));
