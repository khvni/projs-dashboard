// UI State Store - Manages global UI state
import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  modalData: any;
  theme: 'light' | 'dark';
  realtimeConnected: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setRealtimeConnected: (connected: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  theme: 'light',
  realtimeConnected: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  setTheme: (theme) => set({ theme }),
  setRealtimeConnected: (connected) => set({ realtimeConnected: connected }),
}));
