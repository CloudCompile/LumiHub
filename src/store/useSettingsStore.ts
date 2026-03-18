import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  performanceMode: boolean;
  showGlass: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  setShowGlass: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      performanceMode: true,
      showGlass: false,
      setPerformanceMode: (enabled) => set({ performanceMode: enabled }),
      setShowGlass: (enabled) => set({ showGlass: enabled }),
    }),
    {
      name: 'lumihub-settings',
    }
  )
);
