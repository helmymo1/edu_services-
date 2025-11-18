'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export default function LanguageSwitcher() {
  const { setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => setLocale('en')}>
        <Globe className="h-5 w-5" />
        <span className="sr-only">English</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setLocale('ar')}>
        <Globe className="h-5 w-5" />
        <span className="sr-only">العربية</span>
      </Button>
    </div>
  );
}
