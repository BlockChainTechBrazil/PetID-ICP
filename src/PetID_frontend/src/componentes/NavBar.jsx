import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { AuthClient } from '@dfinity/auth-client';
import Logo from "../assets/logo/PetID_logo.jpg"

const NavBar = () => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Inicializar o AuthClient
  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      const authenticated = await client.isAuthenticated();
      
      setAuthClient(client);
      setIsAuthenticated(authenticated);
    };
    
    initAuth();
  }, []);
  
  // Função para login com Internet Identity
  const handleLogin = async () => {
    setIsLoading(true);
    
    const identityProvider = process.env.DFX_NETWORK === 'ic' 
      ? 'https://identity.ic0.app/#authorize'
      : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY || 'localhost:4943'}`;
    
    await authClient?.login({
      identityProvider,
      onSuccess: () => {
        setIsAuthenticated(true);
        setIsLoading(false);
      },
      onError: (err) => {
        console.error('Login failed:', err);
        setIsLoading(false);
      },
    });
  };
  
  // Função para logout
  const handleLogout = async () => {
    await authClient?.logout();
    setIsAuthenticated(false);
    window.location.reload(); // Recarrega a página para atualizar estado
  };
  
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
            
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-all duration-200"
              >
                {t('navbar.logout', 'Logout')}
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('navbar.connecting', 'Conectando...')}
                  </span>
                ) : (
                  t('navbar.connectWallet', 'Conectar')
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar