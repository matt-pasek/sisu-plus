import { create } from 'zustand';

type Theme = 'streamlined' | 'expressive';
type ActivePanel = 'dashboard' | 'attainments' | 'plans';

interface UiState {
  theme: Theme;
  activePanel: ActivePanel;
  setTheme: (theme: Theme) => void;
  setActivePanel: (panel: ActivePanel) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'streamlined',
  activePanel: 'dashboard',
  setTheme: (theme) => set({ theme }),
  setActivePanel: (activePanel) => set({ activePanel }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'streamlined' ? 'expressive' : 'streamlined',
    })),
}));
