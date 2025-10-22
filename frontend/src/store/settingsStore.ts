import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { defaultLanguage, Language } from '@/i18n/config';

interface SettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const detectLanguage = (): Language => {
  if (typeof navigator !== 'undefined') {
    const locale = navigator.language?.toLowerCase();
    if (locale?.startsWith('de')) {
      return 'de';
    }
  }

  return defaultLanguage;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'pv-settings-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({ language: state.language })
    }
  )
);
