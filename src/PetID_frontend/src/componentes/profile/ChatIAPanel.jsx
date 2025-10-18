import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiZap } from 'react-icons/fi';

const ChatIAPanel = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [tick, setTick] = useState(0); // força re-render durante cooldown

  // Por segurança, leia a chave de um .env (OPENAI_API_KEY). Não embuta chaves no código.
  const apiKey = import.meta.env.OPENAI_API_KEY;
  const systemPrompt = `Você é um assistente especializado do projeto PetID (Internet Computer + NFTs/DIP721).
  - Fale de forma clara e objetiva.
  - Se a pergunta for sobre o projeto, foque em: registro de pets como NFTs, geração de documento ID, upload para ICP Asset Storage, integração com Internet Identity, i18n e comunidade.
  - Se pedir código, forneça trechos concisos e explique onde incluir.
  - Se algo não estiver implementado no backend, sugira caminhos e ressalte que é mock/estado local.`;

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
    // Client-side rate limit mínimo entre envios
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

    const userMsg = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    if (!apiKey) return; // Sem chave, não chama API

    setLoading(true);
    try {
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
            ...messages,
            userMsg
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          const retryAfter = res.headers.get('retry-after');
          // retry-after normalmente em segundos
          const retryMs = retryAfter ? Math.max(1, Math.ceil(parseFloat(retryAfter))) * 1000 : 10000;
          const until = Date.now() + retryMs;
          setCooldownUntil(until);
          const seconds = Math.ceil(retryMs / 1000);
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: t('chat.rateLimited', { seconds }) },
          ]);
          setLoading(false);
          return;
        }
        throw new Error(await res.text());
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || t('chat.noResponse');
      setMessages((m) => [...m, { role: 'assistant', content }]);
    } catch (e) {
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
        setMessages((m) => [...m, { role: 'assistant', content: t('chat.error') }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 p-4 sm:p-5 space-y-4">
      {!apiKey && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {t('chat.noKey')}
        </div>
      )}
      <div className="h-[50vh] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2"><FiZap /> {t('chat.welcome')}</div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-gray-100 dark:bg-surface-100 text-gray-800 dark:text-slate-100'}`}>
            <div className="opacity-70 text-[11px] mb-0.5">{m.role === 'user' ? t('chat.you') : 'AI'}</div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-500 dark:text-slate-400">{t('chat.loading')}</div>
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
    </div>
  );
};

export default ChatIAPanel;
