import React, { createContext, useContext, useState, useEffect } from 'react';
import frTranslations from '@/locales/fr.json';
import enTranslations from '@/locales/en.json';
import esTranslations from '@/locales/es.json';
import deTranslations from '@/locales/de.json';
import ptTranslations from '@/locales/pt.json';

type Language = 'fr' | 'en' | 'es' | 'de' | 'pt';
type Translations = typeof frTranslations;

const DEFAULT_LANGUAGE = 'fr';

const translations: Record<Language, Translations> = {
  fr: frTranslations,
  en: enTranslations,
  es: esTranslations,
  de: deTranslations,
  pt: ptTranslations,
};

// Configuration des langues disponibles avec leurs métadonnées
export const availableLanguages = {
  fr: { name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Português', nativeName: 'Português', flag: '🇵🇹' },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: typeof availableLanguages;
}

// Fonction pour détecter la langue du navigateur
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

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Priorité : localStorage > langue du navigateur > français par défaut
    const saved = localStorage.getItem('language') as Language;
    if (saved && Object.keys(availableLanguages).includes(saved)) {
      return saved;
    }
    return getBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('language', language);
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
    
    // Substitution des paramètres
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