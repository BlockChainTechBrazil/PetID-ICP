import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = await AuthClient.create();
        if (cancelled) return;
        setAuthClient(client);
        const authenticated = await client.isAuthenticated();
        if (authenticated) {
          const identity = client.getIdentity();
          setPrincipal(identity.getPrincipal().toText());
        }
        setIsAuthenticated(authenticated);
      } catch (e) {
        console.error('[Auth] init error', e);
        setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getIdentityProvider = () => {
    const iiCanister = import.meta.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai';
    const network = import.meta.env.DFX_NETWORK || 'local';
    return network === 'ic'
      ? 'https://identity.ic0.app/#authorize'
      : `http://${iiCanister}.localhost:4943/#authorize`;
  };

  const login = useCallback(async () => {
    if (!authClient) return;
    setLoginLoading(true);
    setError(null);
    try {
      // Definição de dimensões da popup (pode ser ajustado futuramente via env vars)
      const popupWidth = 560; // largura adequada para fluxo do II
      const popupHeight = 720; // altura confortável
      // Cálculo para centralizar (fallback simples caso window não exista)
      let left = 100; let top = 100;
      if (typeof window !== 'undefined') {
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
        const w = window.innerWidth || document.documentElement.clientWidth || screen.width;
        const h = window.innerHeight || document.documentElement.clientHeight || screen.height;
        left = Math.max(0, (w - popupWidth) / 2 + dualScreenLeft);
        top = Math.max(0, (h - popupHeight) / 2 + dualScreenTop);
      }
      // Features: sem barra de ferramentas, redimensionável (true para acessibilidade), sem barra de localização
      const windowOpenerFeatures = `left=${left},top=${top},width=${popupWidth},height=${popupHeight},toolbar=0,menubar=0,location=0,status=0,resizable=1,scrollbars=1`;
      await authClient.login({
        identityProvider: getIdentityProvider(),
        // Define as features para forçar abrir como popup menor em vez de nova aba
        windowOpenerFeatures,
        onSuccess: async () => {
          const authenticated = await authClient.isAuthenticated();
          setIsAuthenticated(authenticated);
          if (authenticated) {
            const identity = authClient.getIdentity();
            setPrincipal(identity.getPrincipal().toText());
          }
          setLoginLoading(false);
        },
        onError: (err) => {
          console.error('[Auth] login error', err);
          setError(err);
          setLoginLoading(false);
        }
      });
    } catch (e) {
      console.error('[Auth] login exception', e);
      setError(e);
      setLoginLoading(false);
    }
  }, [authClient]);

  const logout = useCallback(async () => {
    if (!authClient) return;
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
    } catch (e) {
      console.error('[Auth] logout error', e);
      setError(e);
    }
  }, [authClient]);

  const createBackendActor = useCallback(async () => {
    if (!authClient || !isAuthenticated) return null;
    const identity = authClient.getIdentity();
    const network = import.meta.env.DFX_NETWORK || 'local';
    const host = network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943';
    const agent = new HttpAgent({ identity, host });
    if (network !== 'ic') {
      try { await agent.fetchRootKey(); } catch { }
    }
    return createActor(backendCanisterId, { agent });
  }, [authClient, isAuthenticated]);

  const value = {
    authClient,
    isAuthenticated,
    principal,
    loading,
    loginLoading,
    error,
    login,
    logout,
    createBackendActor
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
