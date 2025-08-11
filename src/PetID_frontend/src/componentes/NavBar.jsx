import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from "../../dist/assets/logo/petid_logo_png.png"
const NavBar = () => {
  const { t } = useTranslation();
  
  return (
     <nav className="sticky top-0 z-50 py-3 bg-white backdrop-blur-lg border-b border-gray-200 shadow-md">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img src={Logo} alt="PetID Logo" className="h-10 w-10 mr-2" />
            <span className="text-2xl font-bold tracking-tight text-blue-600">PetID</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar