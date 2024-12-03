import React, { createContext, useContext, useState } from 'react';
import { translations } from '../constants/translations';

type LanguageContextType = {
  language: 'it' | 'en';
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, any>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'it' | 'en'>('it');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'it' ? 'en' : 'it');
  };

  const t = (key: string, params?: Record<string, any>) => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`(${param})`, params[param].toString());
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 