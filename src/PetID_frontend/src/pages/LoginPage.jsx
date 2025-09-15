import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../assets/logo/logo.jpg';
import { FiShield } from 'react-icons/fi';

const LoginPage = () => {
  const { isAuthenticated, login, loginLoading, loading, error } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const timer = setTimeout(() => navigate('/perfil', { replace: true }), 600);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = () => { login(); };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-white via-surface-50 to-surface-100 dark:from-[#0b1220] dark:via-[#0b1220] dark:to-[#111a29]">
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/40 via-petPurple-500/40 to-accent-500/40 blur opacity-60" />
        <div className="relative rounded-3xl backdrop-blur-xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-75/70 p-8 shadow-xl">
          <div className="flex flex-col items-center text-center gap-4">
            <img src={Logo} alt="PetID" className="h-16 w-16 rounded-xl ring-1 ring-gray-200 dark:ring-slate-700 shadow-md" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-600 via-petPurple-600 to-accent-600 dark:from-brand-400 dark:via-petPurple-400 dark:to-accent-400 bg-clip-text text-transparent">
              {t('login.title', 'Acesse sua conta')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 max-w-sm">
              {t('login.subtitle', 'Autentique-se com sua Internet Identity para acessar seu dashboard e gerenciar seus pets.')}
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4">
            {isAuthenticated && (
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-center animate-pulse">
                {t('login.already', 'Você já está autenticado. Redirecionando...')}
              </div>
            )}
            {!isAuthenticated && (
              <button
                onClick={handleLogin}
                disabled={loginLoading || loading}
                className="w-full group relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 via-petPurple-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loginLoading || loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('login.loading', 'Conectando...')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FiShield className="w-5 h-5" />
                    {t('login.ctaICP', 'Entrar com Internet Identity')}
                  </span>
                )}
              </button>
            )}
            <div className="pt-2 text-xs text-center text-gray-500 dark:text-slate-500">
              {t('login.futureProviders', 'Em breve: Google, Apple, Ethereum, Solana...')}
            </div>
            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 text-center break-words">
                {t('login.error', 'Erro ao autenticar')}: {String(error.message || error)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
