
const mockTree = {
  id: 'PET-001', name: 'Luna', children: [
    { id: 'PET-010', name: 'Bella', relation: 'Mãe' },
    { id: 'PET-011', name: 'Rex', relation: 'Pai' },
  ]
};

const GenealogyPanel = () => {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Árvore Genealógica (Mock)</h3>
      <div className="flex flex-col items-center">
        <div className="relative flex flex-col items-center">
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-petPurple-500 text-white shadow">{mockTree.name}</div>
          <div className="h-8 w-0.5 bg-gradient-to-b from-brand-500 to-petPurple-500" />
          <div className="flex gap-10">
            {mockTree.children.map(ch => (
              <div key={ch.id} className="flex flex-col items-center gap-2">
                <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500/90 to-petPink-500/90 text-white text-sm shadow-inner">{ch.name}</div>
                <span className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wide">{ch.relation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-500 dark:text-slate-400 text-center">No futuro: adicionar expansão multi-gerações, cruzamentos e busca por parentes próximos.</p>
    </div>
  );
};

export default GenealogyPanel;
