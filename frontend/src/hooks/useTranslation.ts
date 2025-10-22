import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { translate } from '@/i18n/translate';
import type { TranslationKey } from '@/i18n/translations';

export const useTranslation = () => {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const t = useCallback(
    (key: TranslationKey, replacements?: Record<string, string | number>) =>
      translate(language, key, replacements),
    [language]
  );

  return { t, language, setLanguage };
};
