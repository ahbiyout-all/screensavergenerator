import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../i18n';

interface LanguageSwitchProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5 shadow-xs">
      <div className="flex items-center pl-1.5 pr-0.5 text-neutral-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center text-xs font-semibold">
        <button
          type="button"
          onClick={() => onLanguageChange('ko')}
          className={`px-2 py-1 rounded-md transition-all ${
            currentLanguage === 'ko'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="한국어로 변경"
        >
          한국어
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('en')}
          className={`px-2 py-1 rounded-md transition-all ${
            currentLanguage === 'en'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="Switch to English"
        >
          English
        </button>
      </div>
    </div>
  );
};
