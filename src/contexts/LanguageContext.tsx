import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../constants/translations';

const LANGUAGE_KEY = 'app_language';

type LanguageContextType = {
  language: 'it' | 'en';
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'it' | 'en'>('it');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage === 'en' || savedLanguage === 'it') {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const toggleLanguage = async () => {
    const newLanguage = language === 'it' ? 'en' : 'it';
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string, params?: Record<string, any>) => {
    let translation = language === 'en' ? key : ((translations as Record<string, string>)[key] || key);
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`(${param})`, params[param].toString());
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isLoading }}>
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