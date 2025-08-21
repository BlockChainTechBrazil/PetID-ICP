
const medicalHistory = [
  { id: 1, pet: 'Luna', date: '2025-06-01', type: 'Vacinação', detail: 'V10 reforço', vet: 'Dr. Silva', status: 'Concluído' },
  { id: 2, pet: 'Thor', date: '2025-05-18', type: 'Consulta', detail: 'Check-up geral', vet: 'Dra. Maria', status: 'Concluído' },
  { id: 3, pet: 'Milo', date: '2025-05-28', type: 'Tratamento', detail: 'Dermatite - pomada tópica', vet: 'Dr. Paulo', status: 'Em andamento' },
];

const MedicalPanel = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Histórico Médico</h3>
        {/* Versão desktop / tablet */}
        <div className="relative -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto hidden sm:block scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-surface-100 scrollbar-track-transparent">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-4 bg-gradient-to-r from-white dark:from-[#0b1220] to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-4 bg-gradient-to-l from-white dark:from-[#0b1220] to-transparent" />
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Pet</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Detalhe</th>
                <th className="py-2 pr-4">Veterinário</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {medicalHistory.map(r => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-surface-100 hover:bg-gray-50/60 dark:hover:bg-surface-100/60">
                  <td className="py-2 pr-4 text-gray-700 dark:text-slate-200 whitespace-nowrap">{r.date}</td>
                  <td className="py-2 pr-4 text-gray-700 dark:text-slate-200 whitespace-nowrap">{r.pet}</td>
                  <td className="py-2 pr-4 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-[11px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-medium">{r.type}</span></td>
                  <td className="py-2 pr-4 text-gray-600 dark:text-slate-300">{r.detail}</td>
                  <td className="py-2 pr-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">{r.vet}</td>
                  <td className="py-2 pr-4 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${r.status === 'Concluído' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Versão mobile em cards */}
        <div className="sm:hidden space-y-3">
          {medicalHistory.map(r => (
            <div key={r.id} className="rounded-xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-75/90 p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{r.date}</p>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">{r.pet}
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-medium">{r.type}</span>
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium self-start ${r.status === 'Concluído' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300'}`}>{r.status}</span>
              </div>
              <div className="text-[11px] text-gray-600 dark:text-slate-300 space-y-1">
                <p className="leading-snug"><span className="font-medium text-gray-700 dark:text-slate-200">Detalhe:</span> {r.detail}</p>
                <p className="leading-snug"><span className="font-medium text-gray-700 dark:text-slate-200">Vet:</span> {r.vet}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-surface-100/60 bg-white/40 dark:bg-surface-75/40 backdrop-blur p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-slate-400">Futuro: adicionar formulário para registrar novos eventos médicos e sincronizar com backend.</p>
      </div>
    </div>
  );
};

export default MedicalPanel;
