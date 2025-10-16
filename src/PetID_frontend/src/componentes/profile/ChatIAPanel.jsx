import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ChatIAPanel = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    if (!apiKey) return; // Sem chave, não chama API

    setLoading(true);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'You are a helpful vet assistant.' }, ...messages, userMsg],
          temperature: 0.2,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || t('chat.noResponse');
      setMessages((m) => [...m, { role: 'assistant', content }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: t('chat.error') }]);
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
          <div className="text-sm text-gray-500 dark:text-slate-400">{t('chat.welcome')}</div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-gray-100 dark:bg-surface-100 text-gray-800 dark:text-slate-100'}`}>
            <div className="opacity-70 text-[11px] mb-0.5">{m.role === 'user' ? t('chat.you') : 'AI'}</div>
            <div>{m.content}</div>
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
          placeholder={t('chat.placeholder')}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-surface-100 bg-white/80 dark:bg-surface-100/50 text-sm"
        />
        <button onClick={sendMessage} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm">
          {t('chat.send')}
        </button>
      </div>
    </div>
  );
};

export default ChatIAPanel;
