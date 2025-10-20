import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createActor, idlFactory } from 'declarations/PetID_backend';
import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado de emergência para forçar autenticação
  const [forceAuth, setForceAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = await AuthClient.create({
          // Aumentar o idle timeout para mobile
          idleOptions: {
            idleTimeout: 1000 * 60 * 60 * 24, // 24 horas
            disableDefaultIdleCallback: true
          }
        });
        if (cancelled) return;
        setAuthClient(client);
        
        let authenticated = await client.isAuthenticated();
        
        // Se não está autenticado, tentar recuperar do localStorage (mobile fallback)
        if (!authenticated) {
          try {
            const savedSession = localStorage.getItem('petid_auth_session');
            if (savedSession) {
              const { principal, timestamp } = JSON.parse(savedSession);
              const now = Date.now();
              // Se a sessão foi salva há menos de 24 horas, tentar recuperar
              if (now - timestamp < 24 * 60 * 60 * 1000 && principal) {
                console.log('[Auth] Trying to recover session from localStorage');
                // Re-verificar se o authClient ainda está válido
                authenticated = await client.isAuthenticated();
                if (authenticated) {
                  const identity = client.getIdentity();
                  const currentPrincipal = identity.getPrincipal().toText();
                  if (currentPrincipal === principal) {
                    console.log('[Auth] Session recovered successfully');
                    setPrincipal(principal);
                  }
                }
              } else {
                // Sessão expirada, limpar localStorage
                localStorage.removeItem('petid_auth_session');
              }
            }
          } catch (e) {
            console.warn('[Auth] Failed to recover session from localStorage:', e);
            localStorage.removeItem('petid_auth_session');
          }
        }
        
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

  // Re-validate authentication when the page regains focus or visibility changes.
  // Mobile browsers often open the II flow in an external tab/app; when returning,
  // the app should re-check the AuthClient to update the authenticated state.
  useEffect(() => {
    if (!authClient) return;
    let mounted = true;
    let recheckTimeout;
    
    const recheck = async (delay = 0) => {
      if (recheckTimeout) clearTimeout(recheckTimeout);
      
      recheckTimeout = setTimeout(async () => {
        try {
          console.log('[Auth] Rechecking authentication status...');
          const authenticated = await authClient.isAuthenticated();
          console.log('[Auth] Current auth status:', authenticated, 'Previous status:', isAuthenticated);
          if (!mounted) return;
          
          // FORÇAR PERSISTÊNCIA - Se perdeu autenticação, FORÇAR recuperação
          if (!authenticated && (isAuthenticated || forceAuth)) {
            console.log('[Auth] ❌ AUTHENTICATION LOST! Forcing recovery...');
            try {
              const savedSession = localStorage.getItem('petid_auth_session');
              if (savedSession) {
                const { principal: savedPrincipal, timestamp } = JSON.parse(savedSession);
                const now = Date.now();
                if (now - timestamp < 24 * 60 * 60 * 1000 && savedPrincipal) {
                  console.log('[Auth] 🔄 FORCING session recovery from localStorage');
                  
                  // FORÇAR estado de autenticado
                  console.log('[Auth] 💪 FORCING authentication state to TRUE');
                  setIsAuthenticated(true);
                  setPrincipal(savedPrincipal);
                  setForceAuth(true);
                  
                  // Tentar recriar AuthClient silenciosamente
                  try {
                    const newClient = await AuthClient.create({
                      idleOptions: {
                        idleTimeout: 1000 * 60 * 60 * 24,
                        disableDefaultIdleCallback: true
                      }
                    });
                    setAuthClient(newClient);
                    console.log('[Auth] ✅ AuthClient recreated successfully');
                  } catch (clientError) {
                    console.warn('[Auth] Failed to recreate client, but keeping forced auth:', clientError);
                  }
                  
                  return;
                } else {
                  // Sessão expirada
                  localStorage.removeItem('petid_auth_session');
                  setForceAuth(false);
                }
              } else if (forceAuth) {
                // Não tem sessão salva mas estava forçado, manter
                console.log('[Auth] 🚨 No saved session but forcing auth to stay true');
                setIsAuthenticated(true);
                return;
              }
            } catch (e) {
              console.warn('[Auth] Session recovery failed, but forcing auth anyway:', e);
              if (forceAuth) {
                setIsAuthenticated(true);
                return;
              }
            }
          }
          
          if (authenticated !== isAuthenticated) {
            console.log('[Auth] Auth status changed, updating state');
            
            if (authenticated) {
              const identity = authClient.getIdentity();
              const principalText = identity.getPrincipal().toText();
              console.log('[Auth] Recheck - Principal set:', principalText);
              setIsAuthenticated(authenticated);
              setPrincipal(principalText);
              setForceAuth(true); // Sempre forçar quando autenticado
            } else {
              // ⚠️ INTERCEPTAR PERDA DE AUTENTICAÇÃO
              console.log('[Auth] 🚨 ATTEMPTING TO LOSE AUTH - INTERCEPTING!');
              
              const savedSession = localStorage.getItem('petid_auth_session');
              if (savedSession) {
                try {
                  const { principal: savedPrincipal, timestamp } = JSON.parse(savedSession);
                  const now = Date.now();
                  // Se a sessão é válida (menos de 24h), SEMPRE bloquear logout
                  if (now - timestamp < 24 * 60 * 60 * 1000 && savedPrincipal) {
                    console.log('[Auth] 🛡️ BLOCKING auth loss - valid session exists');
                    // FORÇAR manter autenticação
                    setIsAuthenticated(true);
                    setPrincipal(savedPrincipal);
                    setForceAuth(true);
                    return;
                  }
                } catch (e) {
                  console.warn('[Auth] Error parsing saved session:', e);
                }
              }
              
              // Só permitir logout se não há sessão válida E não está forçado
              if (!forceAuth) {
                console.log('[Auth] Recheck - Allowing logout, clearing principal');
                setIsAuthenticated(false);
                setPrincipal(null);
                setForceAuth(false);
                localStorage.removeItem('petid_auth_session');
              } else {
                console.log('[Auth] 🛡️ BLOCKING logout - forceAuth is active');
              }
            }
          }
        } catch (e) {
          console.warn('[Auth] recheck error', e);
        }
      }, delay);
    };

    const onVisibility = () => { 
      if (document.visibilityState === 'visible') {
        // Dar um pequeno delay para garantir que o II flow terminou
        recheck(500);
      }
    };
    const onFocus = () => recheck(300);
    const onPageshow = (ev) => { 
      if (ev && ev.persisted) recheck(300);
    };
    
    // Mobile-specific events for better session handling
    let lastTouchCheck = 0;
    const onTouchStart = () => {
      // Evitar recheck muito frequente no mobile
      const now = Date.now();
      if (now - lastTouchCheck > 2000) { // Mínimo 2s entre checks de touch
        lastTouchCheck = now;
        recheck(300);
      }
    };
    const onResize = () => recheck(200);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageshow);
    
    // Add mobile-specific listeners
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      document.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('resize', onResize);
    }

    // One immediate check when authClient becomes available
    recheck(100);

    return () => {
      mounted = false;
      if (recheckTimeout) clearTimeout(recheckTimeout);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageshow);
      if (isMobile) {
        document.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('resize', onResize);
      }
    };
  }, [authClient, isAuthenticated]);

  const getIdentityProvider = () => {
    const network = import.meta.env.VITE_DFX_NETWORK || import.meta.env.DFX_NETWORK || 'local';
    const iiCanister = import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || import.meta.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai';
    
    console.log('[Auth] Network:', network, 'II Canister:', iiCanister);
    
    if (network === 'ic') {
      return 'https://identity.ic0.app/#authorize';
    } else {
      return `http://${iiCanister}.localhost:4943/#authorize`;
    }
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
      // Determine if the client is running on a mobile device. On mobile, forcing a popup commonly
      // causes the browser to open the II flow in a new tab or external browser; when the user
      // returns the session can be lost. For small screens / mobile userAgents, avoid forcing popup
      // and fallback to the default redirect flow.
      const isMobile = (typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) || (typeof window !== 'undefined' && window.innerWidth < 768);
      console.log('[Auth] Mobile detection - isMobile:', isMobile, 'userAgent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown', 'windowWidth:', typeof window !== 'undefined' ? window.innerWidth : 'unknown');
      // Features: sem barra de ferramentas, redimension e1vel (true para acessibilidade), sem barra de localiza e7 e3o
      const windowOpenerFeatures = `left=${left},top=${top},width=${popupWidth},height=${popupHeight},toolbar=0,menubar=0,location=0,status=0,resizable=1,scrollbars=1`;
      const loginOptions = {
        identityProvider: getIdentityProvider(),
        maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000), // 24 horas em nanosegundos
        onSuccess: async () => {
          console.log('[Auth] Login onSuccess callback triggered');
          
          // Aguardar um pouco para garantir que o II flow terminou completamente
          await new Promise(resolve => setTimeout(resolve, isMobile ? 1000 : 200));
          
          try {
            const authenticated = await authClient.isAuthenticated();
            console.log('[Auth] Authentication status after login:', authenticated);
            
            if (authenticated) {
              const identity = authClient.getIdentity();
              const principalText = identity.getPrincipal().toText();
              console.log('[Auth] Principal set:', principalText);
              setPrincipal(principalText);
              setIsAuthenticated(authenticated);
              
              // Salvar estado no localStorage para recuperação FORÇADA
              try {
                localStorage.setItem('petid_auth_session', JSON.stringify({
                  principal: principalText,
                  timestamp: Date.now(),
                  forced: true  // Marcar como sessão forçada
                }));
                console.log('[Auth] 💾 Session SAVED to localStorage with FORCE flag');
                setForceAuth(true); // Ativar modo de força
              } catch (e) {
                console.warn('[Auth] Failed to save session to localStorage:', e);
              }
            } else {
              console.warn('[Auth] Login success but not authenticated');
              setError('Login failed - authentication not confirmed');
            }
          } catch (e) {
            console.error('[Auth] Error in onSuccess callback:', e);
            setError(e.message);
          }
          
          setLoginLoading(false);
          console.log('[Auth] Login process completed successfully');
        },
        onError: (err) => {
          console.error('[Auth] login error', err);
          
          // Tratamento espec edfico para diferentes tipos de erro
          if (err === 'UserInterrupt' || err?.message?.includes('UserInterrupt')) {
            console.log('[Auth] Login cancelado pelo usu e1rio');
            // N e3o definir como erro para UserInterrupt,  e9 a e7 e3o normal do usu e1rio
          } else {
            setError(err);
          }
          
          setLoginLoading(false);
        }
      };
      // Only pass windowOpenerFeatures when not on mobile
      if (!isMobile) loginOptions.windowOpenerFeatures = windowOpenerFeatures;

      await authClient.login(loginOptions);
    } catch (e) {
      console.error('[Auth] login exception', e);
      setError(e);
      setLoginLoading(false);
    }
  }, [authClient]);

  const logout = useCallback(async () => {
    console.log('[Auth] 🚪 LOGOUT initiated');
    try {
      if (authClient) {
        await authClient.logout();
      }
      setIsAuthenticated(false);
      setPrincipal(null);
      setForceAuth(false); // Desativar modo de força
      
      // Limpar localStorage
      try {
        localStorage.removeItem('petid_auth_session');
        console.log('[Auth] 🗑️ Session cleared from localStorage');
      } catch (e) {
        console.warn('[Auth] Failed to clear localStorage on logout:', e);
      }
    } catch (e) {
      console.error('[Auth] logout error', e);
      setError(e);
    }
  }, [authClient]);

  const createBackendActor = useCallback(async () => {
    // Aceitar tanto autenticação normal quanto forçada
    if (!authClient || (!isAuthenticated && !forceAuth)) {
      console.log('[Auth] 🚫 Cannot create actor - authClient:', !!authClient, 'isAuth:', isAuthenticated, 'forceAuth:', forceAuth);
      return null;
    }
    
    try {
      const identity = authClient.getIdentity();
      const network = import.meta.env.VITE_DFX_NETWORK || import.meta.env.DFX_NETWORK || 'local';
      const host = network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943';
      
      // Obter canister ID correto baseado na network
      const envCanisterId = import.meta.env.VITE_CANISTER_ID_PETID_BACKEND || import.meta.env.CANISTER_ID_PETID_BACKEND;
      const backendCanisterId = network === 'ic' 
        ? envCanisterId || 'qzpyy-baaaa-aaaaj-a2hea-cai'
        : envCanisterId || 'uxrrr-q7777-77774-qaaaq-cai';
        
      console.log('[Auth] 🔍 Environment vars check:');
      console.log('  - CANISTER_ID_PETID_BACKEND:', envCanisterId);
      console.log('  - DFX_NETWORK:', network);
      console.log('  - Final Canister ID:', backendCanisterId);
        
      console.log('[Auth] Creating actor - Network:', network, 'Host:', host);
      console.log('[Auth] Backend Canister ID:', backendCanisterId);
      
      // Create agent with proper configuration
      const agent = new HttpAgent({ 
        identity, 
        host,
        // Add ingress expiry buffer for better reliability
        ingressExpiry: 5 * 60 * 1000, // 5 minutes
      });
      
      // Fetch root key for local development
      if (network !== 'ic') {
        try { 
          await agent.fetchRootKey(); 
          console.log('[Auth] Root key fetched successfully for local development');
        } catch (e) { 
          console.warn('[Auth] Failed to fetch root key:', e);
          // Não fazer throw, continuar mesmo sem root key
          console.warn('[Auth] Continuing without root key for local development');
        }
      }
      
      // Criar actor manualmente com configuração correta
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: backendCanisterId,
      });
      
      console.log('[Auth] Actor created with canister ID:', backendCanisterId);
      return actor;
    } catch (e) {
      console.error('[Auth] Failed to create backend actor:', e);
      return null;
    }
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
