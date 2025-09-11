
const posts = [
  { id: 1, user: 'Ana', avatar: '🐶', type: 'Evento', title: 'Passeio no Parque Ibirapuera', date: '2025-06-20', content: 'Vamos reunir os pets para socializar e brincar. Leve água e brinquedos!', tags: ['passeio', 'social'] },
  { id: 2, user: 'Carlos', avatar: '🐱', type: 'Dica', title: 'Hidratação no Inverno', date: '2025-06-18', content: 'Mesmo no frio, incentive seu pet a beber água. Use fontes circulantes.', tags: ['saúde'] },
  { id: 3, user: 'Marina', avatar: '🐾', type: 'Encontro', title: 'Socialização de Filhotes', date: '2025-06-17', content: 'Filhotes aprendem muito nos primeiros meses. Traga o seu para interagir.', tags: ['filhotes', 'treinamento'] },
];

const CommunityPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        {posts.map(p => (
          <div key={p.id} className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-petPurple-500 flex items-center justify-center text-xl">{p.avatar}</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{p.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{p.user} • {p.date}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-petPink-400/20 text-petPink-700 dark:text-petPink-200 font-semibold">{p.type}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 leading-relaxed">{p.content}</p>
            <div className="flex flex-wrap gap-2">
              {p.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300">#{tag}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-surface-100/60 bg-white/40 dark:bg-surface-75/40 backdrop-blur p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-slate-400">Futuro: criar, comentar e curtir posts, além de feed em tempo real.</p>
      </div>
    </div>
  );
};

export default CommunityPanel;
