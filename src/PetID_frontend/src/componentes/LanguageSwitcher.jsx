import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Definir inglês como padrão na inicialização
  useEffect(() => {
    if (i18n.language !== 'en' && i18n.language !== 'pt' && i18n.language !== 'es') {
      i18n.changeLanguage('en');
    }
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Fechar dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Funções para obter a bandeira do idioma atual
  const getCurrentFlag = () => {
    switch (i18n.language) {
      case 'en':
        return '🇺🇸';
      case 'pt':
        return '🇧🇷';
      case 'es':
        return '🇪🇸';
      default:
        return '🇺🇸';
    }
  };

  const getCurrentLanguageName = () => {
    switch (i18n.language) {
      case 'en':
        return 'English';
      case 'pt':
        return 'Português';
      case 'es':
        return 'Español';
      default:
        return 'English';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selecionar idioma"
      >
        <span className="text-xl">{getCurrentFlag()}</span>
        <span className="hidden md:inline text-sm">{getCurrentLanguageName()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-50">
          <ul className="py-1">
            <li>
              <button
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  i18n.language === 'en' ? 'font-semibold bg-gray-50' : ''
                }`}
                onClick={() => changeLanguage('en')}
              >
                <span className="text-xl">🇺🇸</span> English
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  i18n.language === 'pt' ? 'font-semibold bg-gray-50' : ''
                }`}
                onClick={() => changeLanguage('pt')}
              >
                <span className="text-xl">🇧🇷</span> Português
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  i18n.language === 'es' ? 'font-semibold bg-gray-50' : ''
                }`}
                onClick={() => changeLanguage('es')}
              >
                <span className="text-xl">🇪🇸</span> Español
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
