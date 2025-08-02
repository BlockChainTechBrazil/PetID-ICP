import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

export interface ICPAuth {
  isAuthenticated: boolean;
  principal: Principal | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useICPAuth = (): ICPAuth => {
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
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const identity = client.getIdentity();
        const userPrincipal = identity.getPrincipal();
        setPrincipal(userPrincipal);
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

      // URL da Internet Identity (local ou produção)
      const identityProvider = process.env.DFX_NETWORK === 'local'
        ? `http://localhost:4943/?canisterId=be2us-64aaa-aaaaa-qaabq-cai`
        : 'https://identity.ic0.app';

      await authClient.login({
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 dias em nanosegundos
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const userPrincipal = identity.getPrincipal();
          setPrincipal(userPrincipal);
          setIsAuthenticated(true);
          console.log('Login realizado com sucesso:', userPrincipal.toString());
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
    } catch (err) {
      console.error('Erro durante o logout:', err);
      setError('Erro durante o logout');
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    principal,
    login,
    logout,
    loading,
    error
  };
};
