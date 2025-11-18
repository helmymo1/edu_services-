"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

type Locale = 'en' | 'ar';

type TFunc = (key: string) => string;

const translations: Record<Locale, Record<string, any>> = {
  en,
  ar,
};

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFunc;
}>({
  locale: 'en',
  setLocale: () => {},
  t: (k: string) => k,
});

export const LanguageProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const v = localStorage.getItem('locale');
      return (v === 'ar' ? 'ar' : 'en');
    } catch (e) {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('locale', locale);
    } catch {}
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);

  const t: TFunc = (key) => {
    const parts = key.split('.');
    let cur: any = translations[locale];
    for (const p of parts) {
      if (!cur) return key;
      cur = cur[p];
    }
    return typeof cur === 'string' ? cur : key;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageProvider;
