import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { AuthClient } from '@dfinity/auth-client';
import Logo from "../assets/logo/PetID_logo.jpg";
import { Link } from 'react-router-dom';

const NavBar = () => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dark, setDark] = useState(false);
  // Dark mode persistence
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const active = stored ? stored === 'dark' : true; // default escuro
    setDark(active);
    document.documentElement.classList.toggle('dark', active);
  }, []);
  const toggleDark = () => {
    setDark(d => { const next = !d; document.documentElement.classList.toggle('dark', next); localStorage.setItem('theme', next ? 'dark' : 'light'); return next; });
  };

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
    <nav className="sticky top-0 z-50 py-2 md:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0 gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={Logo} alt="PetID" className="h-9 w-9 rounded-lg ring-1 ring-gray-200 dark:ring-slate-700 group-hover:scale-105 transition" />
              <span className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-indigo-400 dark:to-accent-400 bg-clip-text text-transparent">PetID</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 font-medium text-gray-700 dark:text-slate-200">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
            <Link to="/perfil" className="hover:text-blue-600 dark:hover:text-indigo-400 transition-colors">Perfil</Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={toggleDark} aria-label={dark ? 'Switch to light' : 'Switch to dark'} className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:scale-105 transition">
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1zm1.636 5.364a1 1 0 01-1.414-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" /></svg>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 font-semibold transition-all duration-200"
              >
                {t('navbar.logout', 'Logout')}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold shadow-lg transition-all duration-200"
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