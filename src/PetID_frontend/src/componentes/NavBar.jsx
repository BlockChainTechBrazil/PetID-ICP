import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const NavBar = () => {
  const { t } = useTranslation();
  
  return (
     <nav className="sticky top-0 z-50 py-3 bg-white backdrop-blur-lg border-b border-gray-200 shadow-md">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img src="/logo2.svg" alt="PetID Logo" className="h-10 w-10 mr-2" />
            <span className="text-2xl font-bold tracking-tight text-blue-600">PetID</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg transition-all duration-200">
              {t('navbar.connectWallet')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar