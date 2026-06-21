import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './en.json'
import translationPL from './pl.json'

i18n.use(LanguageDetector).use(initReactI18next).init({
    resources: {
      en: { translation: translationEN },
      pl: { translation: translationPL }
    },
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, 
    }
  });

export default i18n;