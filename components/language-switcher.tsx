"use client";

import React from 'react';
import { useLanguage } from './language-provider';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button variant={locale === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLocale('en')}>
        EN
      </Button>
      <Button variant={locale === 'ar' ? 'default' : 'outline'} size="sm" onClick={() => setLocale('ar')}>
        العربية
      </Button>
    </div>
  );
}
