import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const [healthRecords, setHealthRecords] = useState([]); // Estado global para registros médicos
  
  // Refs para controle
  const sessionCheckInterval = useRef(null);
  const lastActivity = useRef(Date.now());
  const isInitializing = useRef(false);

  // Função para verificar se a sessão ainda está válida
  const checkSession = useCallback(async () => {
    if (!authClient) return;
    
    try {
      const authenticated = await authClient.isAuthenticated();
      
      if (!authenticated && isAuthenticated) {
        console.log('[Auth] Sessão expirou');
        setIsAuthenticated(false);
        setPrincipal(null);
        setError('Sessão expirada. Faça login novamente.');
      } else if (authenticated && !isAuthenticated) {
        console.log('[Auth] Sessão restaurada');
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal().toText());
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (e) {
      console.error('[Auth] Erro ao verificar sessão:', e);
    }
  }, [authClient, isAuthenticated]);

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  // Carregar registros médicos do localStorage
  const loadHealthRecords = useCallback(() => {
    if (!principal) return;
    try {
      const storageKey = `healthRecords_${principal}`;
      const storedRecords = localStorage.getItem(storageKey);
      if (storedRecords) {
        const parsedRecords = JSON.parse(storedRecords);
        console.log('[HealthRecords] Carregando registros do localStorage:', parsedRecords.length, 'registros');
        setHealthRecords(parsedRecords);
      } else {
        console.log('[HealthRecords] Nenhum registro encontrado no localStorage');
        setHealthRecords([]);
      }
    } catch (error) {
      console.error('Erro ao carregar registros médicos:', error);
    }
  }, [principal]);

  // Salvar registros médicos no localStorage
  const saveHealthRecords = useCallback((records) => {
    if (!principal) return;
    try {
      const storageKey = `healthRecords_${principal}`;
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Erro ao salvar registros médicos:', error);
    }
  }, [principal]);

  // Adicionar novo registro médico
  const addHealthRecord = useCallback((newRecord) => {
    console.log('[HealthRecords] Adicionando novo registro:', newRecord);
    
    const recordWithId = {
      ...newRecord,
      id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now()
    };
    
    setHealthRecords(prev => {
      console.log('[HealthRecords] Estado anterior:', prev.length, 'registros');
      const updatedRecords = [recordWithId, ...prev];
      console.log('[HealthRecords] Estado atualizado:', updatedRecords.length, 'registros');
      saveHealthRecords(updatedRecords);
      return updatedRecords;
    });
    
    return recordWithId;
  }, [saveHealthRecords]);

  // Remover registro médico
  const removeHealthRecord = useCallback((recordId) => {
    setHealthRecords(prev => {
      const updatedRecords = prev.filter(record => record.id !== recordId);
      saveHealthRecords(updatedRecords);
      return updatedRecords;
    });
  }, [saveHealthRecords]);

  // Atualizar registro médico
  const updateHealthRecord = useCallback((recordId, updatedData) => {
    setHealthRecords(prev => {
      const updatedRecords = prev.map(record => 
        record.id === recordId ? { ...record, ...updatedData } : record
      );
      saveHealthRecords(updatedRecords);
      return updatedRecords;
    });
  }, [saveHealthRecords]);

  // Função temporária para limpar registros duplicados
  const clearHealthRecords = useCallback(() => {
    if (!principal) return;
    const storageKey = `healthRecords_${principal}`;
    localStorage.removeItem(storageKey);
    setHealthRecords([]);
    console.log('[HealthRecords] Registros limpos para o usuário:', principal);
  }, [principal]);

  // Carregar registros quando o usuário fizer login
  useEffect(() => {
    if (isAuthenticated && principal) {
      loadHealthRecords();
    } else {
      setHealthRecords([]);
    }
  }, [isAuthenticated, principal, loadHealthRecords]);

  useEffect(() => {
    let cancelled = false;
    
    // Evitar múltiplas inicializações
    if (authClient || isInitializing.current) {
      console.log('[Auth] AuthClient já inicializado ou em processo, pulando...');
      return;
    }
    
    isInitializing.current = true;
    
    (async () => {
      try {
        console.log('[Auth] Inicializando AuthClient...');
        
        // Configuração simples e estável do AuthClient
        const client = await AuthClient.create({
          idleOptions: {
            idleTimeout: 1000 * 60 * 60 * 2, // 2 horas (mais conservador)
            disableDefaultIdleCallback: true,
          },
        });
        
        if (cancelled) return;
        setAuthClient(client);
        
        const authenticated = await client.isAuthenticated();
        if (authenticated) {
          const identity = client.getIdentity();
          setPrincipal(identity.getPrincipal().toText());
          console.log('[Auth] Sessão restaurada');
        }
        setIsAuthenticated(authenticated);
        
        console.log('[Auth] AuthClient inicializado com sucesso');
        
      } catch (e) {
        console.error('[Auth] Erro na inicialização:', e);
        setError('Erro na inicialização da autenticação');
      } finally {
        isInitializing.current = false;
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { 
      cancelled = true;
      isInitializing.current = false;
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, []); // Remover dependência checkSession para evitar re-inicializações

  // UseEffect separado para gerenciar o interval de verificação
  useEffect(() => {
    if (authClient && !sessionCheckInterval.current) {
      console.log('[Auth] Configurando verificação de sessão');
      sessionCheckInterval.current = setInterval(checkSession, 60000);
    }
    
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
    };
  }, [authClient, checkSession]);

  // Handlers estáveis para event listeners
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      console.log('[Auth] Página visível, verificando sessão');
      updateActivity();
      checkSession();
    }
  }, [updateActivity, checkSession]);

  const handleUserActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Detectar mudanças de visibilidade da página (importante para mobile)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('click', handleUserActivity);
      document.addEventListener('touchstart', handleUserActivity, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('click', handleUserActivity);
        document.removeEventListener('touchstart', handleUserActivity);
      }
    };
  }, [handleVisibilityChange, handleUserActivity]);

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
    updateActivity();
    
    try {
      console.log('[Auth] Iniciando login');

      await authClient.login({
        identityProvider: getIdentityProvider(),
        // Remover configurações complexas de popup que podem causar problemas
        onSuccess: async () => {
          console.log('[Auth] Login bem-sucedido');
          const authenticated = await authClient.isAuthenticated();
          setIsAuthenticated(authenticated);
          if (authenticated) {
            const identity = authClient.getIdentity();
            setPrincipal(identity.getPrincipal().toText());
            updateActivity();
            setError(null);
            
            // Restart session check interval
            if (sessionCheckInterval.current) {
              clearInterval(sessionCheckInterval.current);
            }
            sessionCheckInterval.current = setInterval(checkSession, 60000);
          }
          setLoginLoading(false);
        },
        onError: (err) => {
          console.error('[Auth] Erro no login:', err);
          setError('Falha na autenticação. Tente novamente.');
          setLoginLoading(false);
        }
      });
    } catch (e) {
      console.error('[Auth] Exceção no login:', e);
      setError('Erro durante o login. Verifique sua conexão e tente novamente.');
      setLoginLoading(false);
    }
  }, [authClient, updateActivity, checkSession]);

  const logout = useCallback(async () => {
    if (!authClient) return;
    console.log('[Auth] Fazendo logout');
    
    try {
      // Limpar intervalos
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      
      // Fazer logout
      await authClient.logout();
      
      // Resetar estados
      setIsAuthenticated(false);
      setPrincipal(null);
      setError(null);
      
      console.log('[Auth] Logout completado');
    } catch (e) {
      console.error('[Auth] Erro durante logout:', e);
      // Mesmo com erro, limpar os estados locais
      setIsAuthenticated(false);
      setPrincipal(null);
    }
  }, [authClient]);

  const createBackendActor = useCallback(async () => {
    if (!authClient || !isAuthenticated) {
      console.warn('[Auth] createBackendActor: não autenticado');
      return null;
    }
    
    try {
      console.log('[Auth] Criando backend actor...');
      
      // Verificar se a sessão ainda é válida
      const stillAuthenticated = await authClient.isAuthenticated();
      if (!stillAuthenticated) {
        console.warn('[Auth] Sessão não é mais válida');
        setIsAuthenticated(false);
        setPrincipal(null);
        return null;
      }
      
      const identity = authClient.getIdentity();
      console.log('[Auth] Identidade obtida:', {
        principal: identity.getPrincipal().toText(),
        hasIdentity: !!identity
      });
      
      const network = import.meta.env.DFX_NETWORK || 'local';
      const host = network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943';
      
      const agent = new HttpAgent({ 
        identity, 
        host,
        // Adicionar configurações para melhor compatibilidade
        retryTimes: 3,
        verifyQuerySignatures: false // Para desenvolvimento local
      });
      
      if (network !== 'ic') {
        try { 
          await agent.fetchRootKey(); 
          console.log('[Auth] Root key obtida com sucesso');
        } catch (e) { 
          console.warn('[Auth] Falha ao obter root key:', e);
        }
      }
      
      const actor = createActor(backendCanisterId, { agent });
      console.log('[Auth] Actor criado com sucesso');
      return actor;
    } catch (e) {
      console.error('[Auth] Erro ao criar backend actor:', e);
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
    createBackendActor,
    // Função para recriar actor quando há problemas de assinatura
    refreshActor: createBackendActor,
    // Gerenciamento de registros médicos
    healthRecords,
    addHealthRecord,
    removeHealthRecord,
    updateHealthRecord,
    clearHealthRecords // Função temporária para limpeza
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
