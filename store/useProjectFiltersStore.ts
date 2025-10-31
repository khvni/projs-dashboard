// Project Filters Store - Manages project list filters
import { create } from 'zustand';
import { ProjectFilters } from '@/types';

interface ProjectFiltersState extends ProjectFilters {
  // Actions
  setStatus: (status: string[]) => void;
  setCategory: (category: string[]) => void;
  setPriority: (priority: string[]) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
}

const initialFilters: ProjectFilters = {
  status: [],
  category: [],
  priority: [],
  search: '',
};

export const useProjectFiltersStore = create<ProjectFiltersState>((set) => ({
  ...initialFilters,

  setStatus: (status) => set({ status }),
  setCategory: (category) => set({ category }),
  setPriority: (priority) => set({ priority }),
  setSearch: (search) => set({ search }),
  clearFilters: () => set(initialFilters),
}));
