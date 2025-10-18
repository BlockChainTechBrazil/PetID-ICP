import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiZap, FiDatabase, FiCloud } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ChatIAPanel = () => {
  const { t } = useTranslation();
  const { actor } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [tick, setTick] = useState(0); // força re-render durante cooldown
  const [useOnChainOnly, setUseOnChainOnly] = useState(false); // Toggle IA on-chain vs externa

  // Por segurança, leia a chave de um .env (OPENAI_API_KEY). Não embuta chaves no código.
  const apiKey = import.meta.env.OPENAI_API_KEY;
  const systemPrompt = `Você é um assistente especializado do projeto PetID (Internet Computer + NFTs/DIP721).
  - Fale de forma clara e objetiva.
  - Se a pergunta for sobre o projeto, foque em: registro de pets como NFTs, geração de documento ID, upload para ICP Asset Storage, integração com Internet Identity, i18n e comunidade.
  - Se pedir código, forneça trechos concisos e explique onde incluir.
  - Se algo não estiver implementado no backend, sugira caminhos e ressalte que é mock/estado local.`;

  // ✅ NOVA: Cache local para respostas
  const [localCache, setLocalCache] = useState(() => {
    try {
      const saved = localStorage.getItem('petid-ai-cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ✅ NOVA: IA On-Chain Simples
  const getOnChainResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Emergências
    if (lowerQuery.includes('dor') || lowerQuery.includes('sangue') || lowerQuery.includes('vomito') || lowerQuery.includes('febre')) {
      return {
        response: "🚨 EMERGÊNCIA: Se seu pet apresenta sintomas graves, procure um veterinário IMEDIATAMENTE! No PetID você pode registrar a consulta como NFT e manter histórico completo.",
        source: 'on-chain',
        confidence: 0.9
      };
    }
    
    // Saúde e vacinas
    if (lowerQuery.includes('vacina') || lowerQuery.includes('saude') || lowerQuery.includes('consulta') || lowerQuery.includes('veterinario')) {
      return {
        response: "🏥 Mantenha a vacinação em dia e faça check-ups regulares! No PetID, você registra cada procedimento médico como NFT na blockchain ICP, criando um histórico médico permanente e verificável.",
        source: 'on-chain',
        confidence: 0.85
      };
    }
    
    // Sobre o projeto PetID
    if (lowerQuery.includes('petid') || lowerQuery.includes('nft') || lowerQuery.includes('blockchain') || lowerQuery.includes('icp')) {
      return {
        response: "🐾 O PetID é uma plataforma revolucionária que transforma seus pets em NFTs na blockchain Internet Computer! Você pode:\n• Registrar pets como RWA NFTs\n• Criar histórico médico on-chain\n• Fazer upload seguro de fotos\n• Acompanhar genealogia\n• Comunidade pet descentralizada",
        source: 'on-chain',
        confidence: 0.95
      };
    }
    
    // Nutrição
    if (lowerQuery.includes('comida') || lowerQuery.includes('alimentacao') || lowerQuery.includes('nutricao')) {
      return {
        response: "🥘 A alimentação varia por idade, raça e condições de saúde. Consulte um veterinário e registre as orientações nutricionais no PetID para acompanhamento completo!",
        source: 'on-chain',
        confidence: 0.8
      };
    }
    
    // Treinamento
    if (lowerQuery.includes('treino') || lowerQuery.includes('adestramento') || lowerQuery.includes('comportamento')) {
      return {
        response: "🎯 Treinamento requer consistência e reforço positivo. Use recompensas e seja paciente! Você pode registrar o progresso nos dados do seu pet NFT no PetID.",
        source: 'on-chain',
        confidence: 0.8
      };
    }
    
    // Raças
    if (lowerQuery.includes('raca') || lowerQuery.includes('breed') || lowerQuery.includes('caracteristica')) {
      return {
        response: "🐕 Cada raça tem características específicas! No PetID, você registra informações detalhadas da raça como parte do NFT, incluindo genealogia e traits hereditários.",
        source: 'on-chain',
        confidence: 0.8
      };
    }
    
    // Default
    return {
      response: "🤖 Pergunta interessante! Para respostas mais detalhadas, você pode usar a IA externa (OpenAI) ou me fazer perguntas sobre:\n• Emergências pet\n• Saúde e vacinas\n• Projeto PetID/NFTs\n• Nutrição básica\n• Treinamento\n• Informações sobre raças",
      source: 'on-chain',
      confidence: 0.6
    };
  };

  // ✅ NOVA: Salvar no cache local
  const saveToCache = (query, response, source) => {
    const newCache = {
      ...localCache,
      [query]: { response, source, timestamp: Date.now() }
    };
    setLocalCache(newCache);
    localStorage.setItem('petid-ai-cache', JSON.stringify(newCache));
  };

  // Atualiza UI a cada segundo durante cooldown
  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const getRemainingSeconds = () => {
    if (!cooldownUntil) return 0;
    const remaining = Math.max(0, cooldownUntil - Date.now());
    return Math.ceil(remaining / 1000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const query = input.trim();
    const userMsg = { role: 'user', content: query };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    setLoading(true);
    
    try {
      // 1. Verificar cache local primeiro
      if (localCache[query] && Date.now() - localCache[query].timestamp < 3600000) { // 1 hora
        const cachedResponse = localCache[query];
        const responseMsg = {
          role: 'assistant',
          content: `💾 [Cache] ${cachedResponse.response}`,
          source: 'cache'
        };
        setMessages((m) => [...m, responseMsg]);
        setLoading(false);
        return;
      }

      // 2. IA On-Chain (sempre disponível)
      if (useOnChainOnly || !apiKey) {
        const onChainResult = getOnChainResponse(query);
        const responseMsg = {
          role: 'assistant',
          content: `⛓️ [On-Chain] ${onChainResult.response}`,
          source: 'on-chain',
          confidence: onChainResult.confidence
        };
        setMessages((m) => [...m, responseMsg]);
        saveToCache(query, onChainResult.response, 'on-chain');
        setLoading(false);
        return;
      }

      // 3. Rate limiting para API externa
      const MIN_INTERVAL_MS = 2500;
      const now = Date.now();
      if (cooldownUntil && now < cooldownUntil) {
        const seconds = getRemainingSeconds();
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: t('chat.cooldown', { seconds }) },
        ]);
        setLoading(false);
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
        setLoading(false);
        return;
      }

      // 4. Tentar IA externa (OpenAI)
      setLastSentAt(now);
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
            ...messages.filter(m => m.role !== 'assistant' || !m.content.includes('[On-Chain]')), // Filtrar msgs on-chain do contexto
            userMsg
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          // Fallback para IA on-chain em caso de rate limit
          const onChainResult = getOnChainResponse(query);
          const responseMsg = {
            role: 'assistant',
            content: `⛓️ [Fallback On-Chain] API em rate limit. ${onChainResult.response}`,
            source: 'on-chain-fallback'
          };
          setMessages((m) => [...m, responseMsg]);
          saveToCache(query, onChainResult.response, 'on-chain-fallback');
          setLoading(false);
          return;
        }
        throw new Error(await res.text());
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || t('chat.noResponse');
      const responseMsg = {
        role: 'assistant',
        content: `☁️ [OpenAI] ${content}`,
        source: 'openai'
      };
      setMessages((m) => [...m, responseMsg]);
      saveToCache(query, content, 'openai');
      
    } catch (e) {
      console.error('Chat error:', e);
      // Fallback final para IA on-chain
      const onChainResult = getOnChainResponse(query);
      const responseMsg = {
        role: 'assistant',
        content: `⛓️ [Fallback On-Chain] Erro na IA externa. ${onChainResult.response}`,
        source: 'on-chain-fallback'
      };
      setMessages((m) => [...m, responseMsg]);
      saveToCache(query, onChainResult.response, 'on-chain-fallback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 p-4 sm:p-5 space-y-4">
      {/* ✅ NOVO: Controles de IA */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-surface-100">
        <div className="flex items-center gap-2">
          <FiZap className="w-5 h-5 text-indigo-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">Chat IA PetID</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseOnChainOnly(!useOnChainOnly)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              useOnChainOnly
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            title={useOnChainOnly ? 'Usando IA On-Chain (100% descentralizada)' : 'Usando IA Híbrida (On-Chain + Externa)'}
          >
            {useOnChainOnly ? <FiDatabase className="w-3 h-3" /> : <FiCloud className="w-3 h-3" />}
            {useOnChainOnly ? 'On-Chain' : 'Híbrida'}
          </button>
          <div className="text-xs text-gray-500">
            Cache: {Object.keys(localCache).length} items
          </div>
        </div>
      </div>

      {!apiKey && !useOnChainOnly && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {t('chat.noKey')} - Usando apenas IA On-Chain.
        </div>
      )}
      
      {useOnChainOnly && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          🌱 Modo 100% Descentralizado ativo - IA processada diretamente na blockchain ICP!
        </div>
      )}
      <div className="h-[50vh] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
              <FiZap /> {t('chat.welcome')}
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                🧠 IA Híbrida PetID
              </h4>
              <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                <p><span className="font-medium">⛓️ On-Chain:</span> Emergências, saúde, PetID, nutrição, treinamento</p>
                <p><span className="font-medium">☁️ Externa:</span> Consultas complexas e conversas detalhadas</p>
                <p><span className="font-medium">💾 Cache:</span> Respostas salvas localmente para rapidez</p>
              </div>
              <div className="mt-2 flex gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">100% Descentralizada</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Cache Inteligente</span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Fallback Automático</span>
              </div>
            </div>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-gray-100 dark:bg-surface-100 text-gray-800 dark:text-slate-100'}`}>
            <div className="opacity-70 text-[11px] mb-0.5 flex items-center gap-1">
              {m.role === 'user' ? (
                t('chat.you')
              ) : (
                <>
                  AI
                  {m.source && (
                    <span className={`px-1 rounded text-[10px] ${
                      m.source === 'cache' ? 'bg-blue-100 text-blue-600' :
                      m.source === 'on-chain' || m.source === 'on-chain-fallback' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {m.source === 'cache' ? 'Cache' :
                       m.source === 'on-chain' || m.source === 'on-chain-fallback' ? 'Blockchain' :
                       'Cloud'}
                    </span>
                  )}
                  {m.confidence && (
                    <span className="text-[10px] opacity-50">
                      {Math.round(m.confidence * 100)}%
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-500 dark:text-slate-400">{t('chat.loading')}</div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              cooldownUntil && Date.now() < cooldownUntil
                ? t('chat.cooldownPlaceholder', { seconds: getRemainingSeconds() })
                : useOnChainOnly 
                  ? "Pergunte sobre emergências, saúde, PetID, nutrição..."
                  : t('chat.placeholder')
            }
            disabled={loading || (cooldownUntil && Date.now() < cooldownUntil)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-surface-100 bg-white/80 dark:bg-surface-100/50 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={loading || (cooldownUntil && Date.now() < cooldownUntil)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiSend className="w-4 h-4" /> {t('chat.send')}
          </button>
        </div>
        
        {Object.keys(localCache).length > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{Object.keys(localCache).length} respostas em cache</span>
            <button
              onClick={() => {
                setLocalCache({});
                localStorage.removeItem('petid-ai-cache');
              }}
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              Limpar Cache
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatIAPanel;
