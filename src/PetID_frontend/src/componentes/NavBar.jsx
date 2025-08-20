import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from "../assets/logo/PetID_logo.jpg";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, loginLoading } = useAuth() || {};
  const [isLoading, setIsLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const toggleMobile = () => setMobileOpen(o => !o);

  // Fechar o menu ao mudar largura (ex: rotate / resize) para >= md
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const goLogin = () => navigate('/login');
  const handleLogout = async () => { await logout?.(); };

  return (
    <nav className="sticky top-0 z-50 py-2 md:py-3 bg-white/80 dark:bg-surface-75/90 backdrop-blur-xl border-b border-gray-200 dark:border-surface-100 shadow-sm">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0 gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={Logo} alt="PetID" className="h-9 w-9 rounded-lg ring-1 ring-gray-200 dark:ring-slate-700 group-hover:scale-105 transition" />
              <span className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-indigo-400 dark:to-accent-400 bg-clip-text text-transparent">PetID</span>
            </Link>
          </div>
          {/* Links Desktop (Profile removido, acesso via botão à direita) */}
          <div className="hidden md:flex items-center gap-6 font-medium text-gray-700 dark:text-slate-200">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-indigo-300 transition-colors">{t('navbar.home')}</Link>
          </div>
          {/* Ações Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={toggleDark} aria-label={dark ? 'Switch to light' : 'Switch to dark'} className="p-2 rounded-full bg-gray-100 dark:bg-surface-100 border border-gray-200 dark:border-surface-200 hover:scale-105 transition">
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1zm1.636 5.364a1 1 0 01-1.414-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" /></svg>
              )}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/perfil" className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-petPurple-500 text-white font-semibold shadow hover:shadow-md transition">
                  {t('navbar.profile', 'Perfil')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-surface-100 dark:hover:bg-surface-200 text-gray-800 dark:text-slate-100 font-semibold transition-all duration-200"
                >
                  {t('navbar.logout', 'Logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={goLogin}
                disabled={isLoading || loginLoading}
                className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-gradient-to-r dark:from-brand-600 dark:via-petPurple-500 dark:to-accent-500 dark:hover:from-brand-500 dark:hover:via-petPink-500 dark:hover:to-accent-400 text-white font-semibold shadow-lg transition-all duration-200"
              >
                {(isLoading || loginLoading) ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('navbar.connecting', 'Conectando...')}
                  </span>
                ) : (
                  t('login.cta', 'Entrar')
                )}
              </button>
            )}
          </div>
          {/* Botão Mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobile} aria-label={mobileOpen ? t('navbar.closeMenu', 'Fechar menu') : t('navbar.openMenu', 'Abrir menu')} aria-expanded={mobileOpen} aria-controls="mobile-menu" className="p-2 rounded-lg bg-gray-100 dark:bg-surface-100 border border-gray-200 dark:border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-petPink-400 transition">
              <span className="sr-only">{mobileOpen ? t('navbar.closeMenu', 'Fechar menu') : t('navbar.openMenu', 'Abrir menu')}</span>
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
        {/* Painel Mobile */}
        <div id="mobile-menu" className={`md:hidden origin-top transition-all duration-300 ${mobileOpen ? 'max-h-[600px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'} overflow-visible`}>
          <div className="mt-3 rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/90 dark:bg-surface-75/95 backdrop-blur-xl shadow-xl p-4 flex flex-col gap-4 animate-[fadeIn_.4s_ease]">
            <div className="flex flex-col gap-2 font-medium text-gray-700 dark:text-slate-200">
              <Link onClick={() => setMobileOpen(false)} to="/" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-100 transition-colors">{t('navbar.home')}</Link>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-surface-200 to-transparent" />
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <button onClick={toggleDark} aria-label={dark ? 'Switch to light' : 'Switch to dark'} className="p-2 rounded-full bg-gray-100 dark:bg-surface-100 border border-gray-200 dark:border-surface-200 hover:scale-105 transition">
                {dark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1zm1.636 5.364a1 1 0 01-1.414-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" /></svg>
                )}
              </button>
              {isAuthenticated ? (
                <div className="flex w-full gap-2">
                  <Link onClick={() => setMobileOpen(false)} to="/perfil" className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-petPurple-500 text-white font-semibold shadow hover:shadow-md transition">
                    {t('navbar.profile', 'Perfil')}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex-1 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-surface-100 dark:hover:bg-surface-200 text-gray-800 dark:text-slate-100 font-semibold transition-all duration-200"
                  >
                    {t('navbar.logout', 'Logout')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); navigate('/login'); }}
                  disabled={isLoading || loginLoading}
                  className="flex-1 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-gradient-to-r dark:from-brand-600 dark:via-petPurple-500 dark:to-accent-500 dark:hover:from-brand-500 dark:hover:via-petPink-500 dark:hover:to-accent-400 text-white font-semibold shadow-lg transition-all duration-200"
                >
                  {(isLoading || loginLoading) ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('navbar.connecting', 'Conectando...')}
                    </span>
                  ) : (
                    t('login.cta', 'Entrar')
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar