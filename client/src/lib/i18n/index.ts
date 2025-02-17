import React, { createContext, useContext, useState, type ReactNode } from 'react';
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

export type Language = 'en' | 'es' | 'fr';

const translations = {
  en,
  es,
  fr,
} as const;

type DeepKeys<T> = T extends object 
  ? { [K in keyof T]: K extends string 
    ? T[K] extends object 
      ? `${K}.${DeepKeys<T[K]>}` | K
      : K 
    : never 
  }[keyof T]
  : never;

type TranslationKey = DeepKeys<typeof en>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const defaultContext: I18nContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
};

const I18nContext = createContext<I18nContextType>(defaultContext);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: TranslationKey): string => {
    const keys = key.split('.') as string[];
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

  return React.createElement(I18nContext.Provider, {
    value: {
      language,
      setLanguage,
      t
    },
    children
  });
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}