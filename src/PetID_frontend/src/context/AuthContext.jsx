import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
      await authClient.login({
        identityProvider: getIdentityProvider(),
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

  const value = {
    authClient,
    isAuthenticated,
    principal,
    loading,
    loginLoading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
