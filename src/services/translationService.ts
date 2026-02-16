// Translation Service for admin users
// Calls Supabase Edge Function which securely holds the OpenAI API key

import { supabase } from '../lib/supabase';

interface TranslationResult {
  translatedText: string;
  error?: string;
}

export const translationService = {
  async translateToEnglish(text: string): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
      return { translatedText: '', error: 'No text to translate' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, direction: 'it-to-en' },
      });

      if (error) {
        console.error('Translation error:', error);
        return { translatedText: '', error: error.message };
      }

      return { translatedText: data.translatedText || '' };
    } catch (error) {
      console.error('Translation error:', error);
      return { translatedText: '', error: 'Translation failed' };
    }
  },

  async translateToItalian(text: string): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
      return { translatedText: '', error: 'No text to translate' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, direction: 'en-to-it' },
      });

      if (error) {
        console.error('Translation error:', error);
        return { translatedText: '', error: error.message };
      }

      return { translatedText: data.translatedText || '' };
    } catch (error) {
      console.error('Translation error:', error);
      return { translatedText: '', error: 'Translation failed' };
    }
  },
};
