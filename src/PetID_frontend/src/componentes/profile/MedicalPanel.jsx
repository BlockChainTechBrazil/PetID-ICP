
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                  <td className="py-2 pr-4 text-gray-700 dark:text-slate-200">{r.date}</td>
                  <td className="py-2 pr-4 text-gray-700 dark:text-slate-200">{r.pet}</td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 rounded-full text-[11px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-medium">{r.type}</span></td>
                  <td className="py-2 pr-4 text-gray-600 dark:text-slate-300">{r.detail}</td>
                  <td className="py-2 pr-4 text-gray-600 dark:text-slate-300">{r.vet}</td>
                  <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${r.status === 'Concluído' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-surface-100/60 bg-white/40 dark:bg-surface-75/40 backdrop-blur p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-slate-400">Futuro: adicionar formulário para registrar novos eventos médicos e sincronizar com backend.</p>
      </div>
    </div>
  );
};

export default MedicalPanel;
