import { createContext, useContext, useState, type ReactNode } from 'react';
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

export type Language = 'en' | 'es' | 'fr';

const translations = {
  en,
  es,
  fr,
} as const;

type TranslationsType = typeof translations;
type NestedKeyOf<T> = T extends object ? {
  [K in keyof T]: `${K & string}${T[K] extends object ? `.${NestedKeyOf<T[K]> & string}` : ''}`
}[keyof T] : never;

type TranslationKey = NestedKeyOf<typeof en>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let current: any = translations[language];

    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      current = current[k];
    }

    return current;
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}