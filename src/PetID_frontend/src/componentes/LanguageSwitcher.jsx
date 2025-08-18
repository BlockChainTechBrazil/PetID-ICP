import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ compact = false }) => {
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

  // SVG flags (evita fallback em alguns sistemas que mostram apenas código)
  const Flag = ({ lang, className = 'w-5 h-5 rounded-sm overflow-hidden ring-1 ring-black/10 dark:ring-white/10' }) => {
    switch (lang) {
      case 'pt': // Brazil
        return (
          <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <rect width="24" height="24" fill="#009C3B" />
            <polygon points="12,4 22,12 12,20 2,12" fill="#FFDF00" />
            <circle cx="12" cy="12" r="4.2" fill="#002776" />
            <path d="M8.4 11.4c2.6-.9 5.2-.6 7.2.5-.2.3-.5.6-.8.9-1.7-.9-4.1-1.2-6.2-.7-.1-.2-.1-.5-.2-.7z" fill="#fff" />
          </svg>
        );
      case 'es': // Spain
        return (
          <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <rect width="24" height="24" fill="#AA151B" />
            <rect y="6" width="24" height="12" fill="#F1BF00" />
            <rect y="8" x="5" width="4" height="6" rx="1" fill="#AA151B" />
          </svg>
        );
      case 'en': // USA
      default:
        return (
          <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <rect width="24" height="24" fill="#B22234" />
            <g fill="#fff">
              <rect y="2" width="24" height="2" />
              <rect y="6" width="24" height="2" />
              <rect y="10" width="24" height="2" />
              <rect y="14" width="24" height="2" />
              <rect y="18" width="24" height="2" />
            </g>
            <rect width="11" height="8" fill="#3C3B6E" />
            <g fill="#fff" transform="scale(.5)">
              <circle cx="2" cy="2" r="1" />
              <circle cx="6" cy="2" r="1" />
              <circle cx="10" cy="2" r="1" />
              <circle cx="4" cy="4" r="1" />
              <circle cx="8" cy="4" r="1" />
              <circle cx="2" cy="6" r="1" />
              <circle cx="6" cy="6" r="1" />
              <circle cx="10" cy="6" r="1" />
            </g>
          </svg>
        );
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
        className={`flex items-center ${compact ? 'gap-0.5 p-1.5 rounded-lg' : 'gap-2 py-1 px-3 rounded-md'} hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-slate-200`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selecionar idioma"
      >
        <Flag lang={i18n.language} />
        {!compact && <span className="text-sm font-medium">{getCurrentLanguageName()}</span>}
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
        <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border border-gray-100 dark:border-slate-700">
          <ul className="py-1">
            <li>
              <button
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${i18n.language === 'en' ? 'font-semibold bg-gray-50 dark:bg-slate-700/40' : ''
                  }`}
                onClick={() => changeLanguage('en')}
              >
                <Flag lang='en' /> <span>English</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${i18n.language === 'pt' ? 'font-semibold bg-gray-50 dark:bg-slate-700/40' : ''
                  }`}
                onClick={() => changeLanguage('pt')}
              >
                <Flag lang='pt' /> <span>Português</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${i18n.language === 'es' ? 'font-semibold bg-gray-50 dark:bg-slate-700/40' : ''
                  }`}
                onClick={() => changeLanguage('es')}
              >
                <Flag lang='es' /> <span>Español</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
