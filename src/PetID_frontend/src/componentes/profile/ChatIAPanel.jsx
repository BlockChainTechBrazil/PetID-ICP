import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiZap, FiDatabase, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ChatIAPanel = () => {
  const { t } = useTranslation();
  const { createBackendActor, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [tick, setTick] = useState(0);
  const [onChainMode, setOnChainMode] = useState(true); // Toggle entre on-chain e OpenAI
  const [statusMessage, setStatusMessage] = useState('');

  // OpenAI fallback (opcional)
  const apiKey = import.meta.env.OPENAI_API_KEY;

  // Carregar histórico de mensagens ao inicializar
  useEffect(() => {
    if (isAuthenticated && onChainMode) {
      loadChatHistory();
    }
  }, [isAuthenticated, onChainMode]);

  // Atualiza UI a cada segundo durante cooldown
  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  // Carregar histórico de chat on-chain
  const loadChatHistory = async () => {
    try {
      const actor = await createBackendActor();
      if (!actor) return;

      setStatusMessage('Carregando histórico...');
      const history = await actor.getChatHistory([], [20]); // [] para null, [20] para Some(20)
      
      const formattedMessages = history.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      setMessages(formattedMessages);
      setStatusMessage('Conectado ao sistema on-chain');
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setStatusMessage('Erro ao conectar');
    }
  };

  const getRemainingSeconds = () => {
    if (!cooldownUntil) return 0;
    const remaining = Math.max(0, cooldownUntil - Date.now());
    return Math.ceil(remaining / 1000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Rate limiting
    const MIN_INTERVAL_MS = 2500;
    const now = Date.now();
    if (cooldownUntil && now < cooldownUntil) {
      const seconds = getRemainingSeconds();
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: t('chat.cooldown', { seconds }) },
      ]);
      return;
    }
    if (now - lastSentAt < MIN_INTERVAL_MS) {
      const next = lastSentAt + MIN_INTERVAL_MS;
      setCooldownUntil(next);
      const seconds = Math.ceil((next - now) / 1000);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: t('chat.cooldown', { seconds }) },
      ]);
      return;
    }

    const userInput = input.trim();
    const userMsg = { role: 'user', content: userInput };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setLastSentAt(now);

    try {
      if (onChainMode) {
        // 🔗 Modo On-Chain (Padrão)
        if (!isAuthenticated) {
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: 'Você precisa estar autenticado para usar a IA on-chain.' },
          ]);
          return;
        }

        setStatusMessage('Processando on-chain...');
        const actor = await createBackendActor();
        if (!actor) {
          throw new Error('Não foi possível conectar ao backend');
        }

        const response = await actor.sendChatMessage(userInput, []); // [] para null
        
        if ('ok' in response) {
          const aiResponse = response.ok;
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: aiResponse.content },
          ]);
          setStatusMessage(`Resposta on-chain (${(aiResponse.confidence * 100).toFixed(0)}% confiança)`);
        } else {
          throw new Error(response.err);
        }
      } else {
        // 🌐 Modo OpenAI (Fallback)
        if (!apiKey) {
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: 'Chave da OpenAI não configurada. Usando modo on-chain...' },
          ]);
          setOnChainMode(true);
          return;
        }

        setStatusMessage('Consultando OpenAI...');
        const systemPrompt = `Você é um assistente especializado do projeto PetID (Internet Computer + NFTs/DIP721).
        - Fale de forma clara e objetiva.
        - Foque em: registro de pets como NFTs, geração de documento ID, upload para ICP Asset Storage, integração com Internet Identity, i18n e comunidade.
        - Se pedir código, forneça trechos concisos e explique onde incluir.`;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(-10), // Limitar contexto
              userMsg
            ],
            temperature: 0.3,
          }),
        });

        if (!res.ok) {
          if (res.status === 429) {
            const retryAfter = res.headers.get('retry-after');
            const retryMs = retryAfter ? Math.max(1, Math.ceil(parseFloat(retryAfter))) * 1000 : 10000;
            const until = Date.now() + retryMs;
            setCooldownUntil(until);
            const seconds = Math.ceil(retryMs / 1000);
            setMessages((m) => [
              ...m,
              { role: 'assistant', content: t('chat.rateLimited', { seconds }) },
            ]);
            return;
          }
          throw new Error(await res.text());
        }
        
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || t('chat.noResponse');
        setMessages((m) => [...m, { role: 'assistant', content }]);
        setStatusMessage('Resposta via OpenAI');
      }
    } catch (e) {
      console.error('Erro no chat:', e);
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('429')) {
        const seconds = getRemainingSeconds() || 10;
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: t('chat.rateLimited', { seconds }) },
        ]);
      } else if (msg.includes('insufficient_quota') || msg.includes('exceeded your current quota')) {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: t('chat.noCredits') },
        ]);
      } else {
        if (onChainMode && !msg.includes('not authenticated')) {
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: `Erro on-chain: ${e.message}. Tentando modo OpenAI...` },
          ]);
          setOnChainMode(false);
        } else {
          setMessages((m) => [...m, { role: 'assistant', content: t('chat.error') }]);
        }
      }
      setStatusMessage('Erro na comunicação');
    } finally {
      setLoading(false);
    }
  };

  // Limpar histórico de chat
  const clearHistory = async () => {
    if (onChainMode && isAuthenticated) {
      try {
        const actor = await createBackendActor();
        if (actor) {
          await actor.clearChatHistory([]); // [] para null
          setStatusMessage('Histórico limpo on-chain');
        }
      } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        setStatusMessage('Erro ao limpar histórico');
      }
    }
    setMessages([]);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 p-4 sm:p-5 space-y-4">
      {/* Status Bar e Controles */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-3 border-b border-gray-200 dark:border-surface-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {onChainMode ? (
              <FiDatabase className="w-4 h-4 text-green-600" />
            ) : (
              <FiZap className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
              {onChainMode ? 'IA On-Chain' : 'OpenAI GPT'}
            </span>
            {isAuthenticated && onChainMode && (
              <FiCheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnChainMode(!onChainMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              onChainMode 
                ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
            }`}
          >
            {onChainMode ? 'On-Chain' : 'OpenAI'}
          </button>
          
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-surface-100 dark:text-slate-200 dark:hover:bg-surface-200 transition-colors"
              title="Limpar histórico"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-2 rounded-lg text-xs ${
          statusMessage.includes('Erro') 
            ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-300' 
            : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
        }`}>
          {statusMessage}
        </div>
      )}

      {/* Alertas de configuração */}
      {!onChainMode && !apiKey && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {t('chat.noKey')} Usando modo on-chain automaticamente.
        </div>
      )}
      
      {onChainMode && !isAuthenticated && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          Faça login com Internet Identity para usar a IA on-chain.
        </div>
      )}
      <div className="h-[50vh] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2">
              {onChainMode ? (
                <>
                  <FiDatabase className="w-5 h-5" />
                  <span>IA totalmente descentralizada na blockchain</span>
                </>
              ) : (
                <>
                  <FiZap className="w-5 h-5" />
                  <span>{t('chat.welcome')}</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-400 dark:text-slate-500">
              {onChainMode 
                ? 'Respostas baseadas em seus dados de pets e conhecimento do projeto'
                : 'Powered by OpenAI GPT-4'
              }
            </div>
          </div>
        )}
        
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
            m.role === 'user' 
              ? 'ml-auto bg-indigo-600 text-white' 
              : `mr-auto ${onChainMode 
                  ? 'bg-green-50 border border-green-200 text-green-900 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-100' 
                  : 'bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-100'
                }`
          }`}>
            <div className="opacity-70 text-[11px] mb-0.5 flex items-center gap-1">
              {m.role === 'user' ? (
                <span>{t('chat.you')}</span>
              ) : (
                <>
                  {onChainMode ? <FiDatabase className="w-3 h-3" /> : <FiZap className="w-3 h-3" />}
                  <span>{onChainMode ? 'IA On-Chain' : 'GPT-4'}</span>
                </>
              )}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}
        
        {loading && (
          <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2">
            <div className="animate-pulse flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>{onChainMode ? 'Processando on-chain...' : t('chat.loading')}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={
            cooldownUntil && Date.now() < cooldownUntil
              ? t('chat.cooldownPlaceholder', { seconds: getRemainingSeconds() })
              : onChainMode 
                ? 'Pergunte sobre seus pets, NFTs, blockchain...'
                : t('chat.placeholder')
          }
          disabled={loading || (cooldownUntil && Date.now() < cooldownUntil) || (onChainMode && !isAuthenticated)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-surface-100 bg-white/80 dark:bg-surface-100/50 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={loading || (cooldownUntil && Date.now() < cooldownUntil) || (onChainMode && !isAuthenticated)}
          className={`px-4 py-2 rounded-xl text-white text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
            onChainMode 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
              : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600'
          }`}
        >
          <FiSend className="w-4 h-4" /> {t('chat.send')}
        </button>
      </div>
    </div>
  );
};

export default ChatIAPanel;
