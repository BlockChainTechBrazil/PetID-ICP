
const mockPets = [
  { id: 'PET-001', name: 'Luna', species: 'Canina', breed: 'Border Collie', age: 2, vaccinations: ['Raiva', 'V10'], lastCheck: '2025-06-10' },
  { id: 'PET-002', name: 'Thor', species: 'Canina', breed: 'Labrador', age: 4, vaccinations: ['Raiva', 'V10', 'Giárdia'], lastCheck: '2025-05-20' },
  { id: 'PET-003', name: 'Milo', species: 'Felina', breed: 'Siamês', age: 3, vaccinations: ['Raiva'], lastCheck: '2025-05-28' },
];

const NFTPetsPanel = () => {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {mockPets.map(pet => (
          <div key={pet.id} className="group relative rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-brand-500/10 via-petPink-400/10 to-accent-500/10" />
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">{pet.name} <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">{pet.id}</span></h3>
              <button className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-surface-200">Editar</button>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{pet.species} • {pet.breed}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Idade: {pet.age} anos</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {pet.vaccinations.map(v => (
                <span key={v} className="text-[10px] tracking-wide uppercase font-semibold px-2 py-1 rounded bg-gradient-to-r from-petMint-400/30 to-petPurple-400/30 text-petPurple-700 dark:text-petPurple-200 ring-1 ring-petMint-500/30">{v}</span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">Último check: {pet.lastCheck}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTPetsPanel;
