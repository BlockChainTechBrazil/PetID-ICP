import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

interface AuthContextType {
  isAuthenticated: boolean;
  principal: Principal | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  authClient: AuthClient | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setLoading(true);
      const client = await AuthClient.create();
      setAuthClient(client);

      const isAuth = await client.isAuthenticated();
      console.log('Estado inicial de autenticação:', isAuth);

      setIsAuthenticated(isAuth);

      if (isAuth) {
        const identity = client.getIdentity();
        const userPrincipal = identity.getPrincipal();
        setPrincipal(userPrincipal);
        console.log('Principal encontrado:', userPrincipal.toString());
      }
    } catch (err) {
      console.error('Erro ao inicializar autenticação:', err);
      setError('Erro ao inicializar autenticação');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) {
      setError('Cliente de autenticação não inicializado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // URL da Internet Identity - agora usando sempre a oficial
      const identityProvider = 'https://identity.ic0.app/#authorize';

      console.log('Iniciando login com Internet Identity oficial:', identityProvider);

      await authClient.login({
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 dias em nanosegundos
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const userPrincipal = identity.getPrincipal();
          setPrincipal(userPrincipal);
          setIsAuthenticated(true);
          console.log('Login realizado com sucesso:', userPrincipal.toString());

          // Forçar re-render de todos os componentes
          window.dispatchEvent(new CustomEvent('auth-state-changed'));
        },
        onError: (error) => {
          console.error('Erro no login:', error);
          setError('Erro ao fazer login');
        }
      });
    } catch (err) {
      console.error('Erro durante o login:', err);
      setError('Erro durante o login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) {
      setError('Cliente de autenticação não inicializado');
      return;
    }

    try {
      setLoading(true);
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      setError(null);
      console.log('Logout realizado com sucesso');

      // Forçar re-render de todos os componentes
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    } catch (err) {
      console.error('Erro durante o logout:', err);
      setError('Erro durante o logout');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    principal,
    login,
    logout,
    loading,
    error,
    authClient
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
