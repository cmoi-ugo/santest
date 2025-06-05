import React, { createContext, useContext, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/config';
import arTranslations from '@/locales/ar.json';
import bnTranslations from '@/locales/bn.json';
import cnTranslations from '@/locales/cn.json';
import deTranslations from '@/locales/de.json';
import enTranslations from '@/locales/en.json';
import esTranslations from '@/locales/es.json';
import frTranslations from '@/locales/fr.json';
import hiTranslations from '@/locales/hi.json';
import itTranslations from '@/locales/it.json';
import jpTranslations from '@/locales/jp.json';
import ptTranslations from '@/locales/pt.json';
import ruTranslations from '@/locales/ru.json';

type Language = 'fr' | 'en' | 'es' | 'de' | 'pt' | 'ar' | 'cn' | 'ru' | 'hi' | 'bn' | 'jp' | 'it';
type Translations = typeof frTranslations;

const DEFAULT_LANGUAGE = 'fr';

const translations: Record<Language, Translations> = {
  fr: frTranslations,
  en: enTranslations,
  es: esTranslations,
  it: itTranslations,
  de: deTranslations,
  pt: ptTranslations,
  ar: arTranslations,
  cn: cnTranslations,
  ru: ruTranslations,
  hi: hiTranslations,
  bn: bnTranslations,
  jp: jpTranslations,
};

/**
 * Configuration des langues disponibles avec leurs métadonnées
 */
export const availableLanguages = {
  fr: { name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  it: { name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  de: { name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Português', nativeName: 'Português', flag: '🇵🇹' },
  ru: { name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  ar: { name: 'العربية', nativeName: 'العربية', flag: '🇦🇷' },
  cn: { name: '中文', nativeName: '中文', flag: '🇨🇳' },
  jp: { name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  hi: { name: 'हिन्दी', nativeName: 'हिन्दी', flag: '🇭🇮' },
  bn: { name: 'বাংলা', nativeName: 'বাংলা', flag: '🇧🇳' },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: typeof availableLanguages;
}

/**
 * Détecte la langue du navigateur avec fallback sur français
 */
const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0] as Language;
  return Object.keys(availableLanguages).includes(browserLang) ? browserLang : 'fr';
};

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: () => '',
  availableLanguages,
});

/**
 * Provider pour la gestion multilingue avec détection automatique et fallback
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    if (saved && Object.keys(availableLanguages).includes(saved)) {
      return saved;
    }
    return getBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value && language !== DEFAULT_LANGUAGE) {
      let fallbackValue: any = translations.fr;
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
      }
      if (fallbackValue && typeof fallbackValue === 'string') {
        value = fallbackValue;
      }
    }

    if (!value) {
      return key;
    }
    
    if (typeof value !== 'string') return key;
    
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val)),
        value
      );
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      availableLanguages 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);