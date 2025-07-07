// LanguageContext.tsx actualizado
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from './i18n'; // Importamos i18next directamente
import { I18nextProvider, useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
  availableLanguages: { code: string, name: string }[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: (key) => key,
  availableLanguages: [],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('es');
  const [isLoaded, setIsLoaded] = useState(false);
  const { t: translate, i18n } = useTranslation();

  const availableLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'qu', name: 'Runasimi' },
    { code: 'ay', name: 'Aymara'}
  ];

  // Cargar el idioma guardado al iniciar
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        const langToSet = savedLanguage || 'es';
        
        // Sincronizar i18next y el estado de React
        await i18n.changeLanguage(langToSet);
        setLanguage(langToSet);
        console.log(`Idioma inicializado: ${langToSet}`);
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadLanguage();
  }, [i18n]);

  // Función de traducción que utiliza i18next
  const t = useCallback((key: string, options?: any) => {
    return translate(key, options);
  }, [translate]);

  // Cambiar idioma y guardar
  const handleSetLanguage = useCallback(async (lang: string) => {
    if (availableLanguages.some(l => l.code === lang)) {
      try {
        // Cambiar el idioma en i18next
        await i18n.changeLanguage(lang);
        // Actualizar el estado
        setLanguage(lang);
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('appLanguage', lang);
        
        // Forzar actualización de la UI
        console.log(`Language changed to: ${lang}`);
      } catch (error) {
        console.error('Error changing language:', error);
      }
    }
  }, [i18n, availableLanguages]);

  // No renderizar nada hasta que se cargue el idioma guardado
  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translate,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;

