import { defaultLanguage, Language } from './config';
import { translations, TranslationKey } from './translations';

const INTERPOLATION_REGEX = /{{\s*(\w+)\s*}}/g;

type ReplacementValues = Record<string, string | number>;

export const translate = (language: Language, key: TranslationKey, replacements?: ReplacementValues) => {
  const fallback = translations[defaultLanguage][key];
  const template = translations[language]?.[key] ?? fallback;

  if (!template) {
    return key;
  }

  if (!replacements) {
    return template;
  }

  return template.replace(INTERPOLATION_REGEX, (_, token: string) => {
    const value = replacements[token];
    return value != null ? String(value) : '';
  });
};
