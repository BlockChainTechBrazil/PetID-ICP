
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import HealthFormCompact from '../HealthFormCompact';

const MedicalPanel = () => {
  const { t } = useTranslation();
  const { createBackendActor, isAuthenticated } = useAuth();
  const [healthRecords, setHealthRecords] = useState([]); // Estado local para registros médicos
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); // Estado para o registro selecionado
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Estado para o modal de detalhes

  // Carregar registros médicos quando o componente for montado
  useEffect(() => {
    if (isAuthenticated) {
      loadHealthRecords();
    }
  }, [isAuthenticated]);

  // Função para carregar registros médicos do backend
  const loadHealthRecords = async () => {
    setLoading(true);
    try {
      const actor = await createBackendActor();
      if (actor) {
        // Usar a função getMyHealthRecords do backend
        const result = await actor.getMyHealthRecords();
        if ('ok' in result) {
          setHealthRecords(result.ok);
        } else {
          console.error('Erro ao carregar registros:', result.err);
          setHealthRecords([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar registros médicos:', error);
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar novo registro ao histórico
  const handleNewRecord = (newRecord) => {
    // Recarregar os registros do backend para ter a lista atualizada
    loadHealthRecords();
    setShowForm(false); // Fechar o formulário
  };

  // Função para abrir detalhes do registro
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  // Função para fechar modal de detalhes
  const handleCloseDetails = () => {
    setSelectedRecord(null);
    setShowDetailsModal(false);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300';
      case 'pending':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300';
      case 'in_progress':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300';
    }
  };

  // Função para obter cor do tipo de serviço
  const getServiceTypeColor = (type) => {
    switch (type) {
      case 'vacina':
        return 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300';
      case 'consulta':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300';
      case 'cirurgia':
        return 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300';
      case 'tratamento':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300';
      case 'emergencia':
        return 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300';
      case 'exame':
        return 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300';
      default:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300';
    }
  };

  // Função para traduzir tipo de serviço
  const translateServiceType = (type) => {
    const translations = {
      consulta: 'Consulta',
      tratamento: 'Tratamento',
      cirurgia: 'Cirurgia',
      vacina: 'Vacinação',
      emergencia: 'Emergência',
      exame: 'Exames'
    };
    return translations[type] || type;
  };

  // Função para traduzir status
  const translateStatus = (status) => {
    const translations = {
      pending: 'Agendado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      in_progress: 'Em Andamento'
    };
    return translations[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Botão para mostrar/ocultar formulário */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {t('healthForm.title', 'Registro de Saúde e Vacinas')}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showForm ? 'Ocultar Formulário' : 'Novo Registro'}
        </button>
      </div>

      {/* Formulário de saúde (condicional) */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5">
          <HealthFormCompact onSuccess={handleNewRecord} />
        </div>
      )}

      {/* Histórico médico dinâmico */}
      <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Histórico Médico</h3>
        
        {loading ? (
          /* Estado de carregamento */
          <div className="text-center py-12">
            <svg className="animate-spin mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">Carregando registros médicos...</p>
          </div>
        ) : !healthRecords || healthRecords.length === 0 ? (
          /* Estado vazio */
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum registro médico encontrado
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Comece adicionando o primeiro registro de saúde do seu pet
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Primeiro Registro
            </button>
          </div>
        ) : (
          <>
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
                    <th className="py-2 pr-4">Veterinário</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {healthRecords && healthRecords.map((record, index) => (
                    <tr key={index} className="border-t border-gray-100 dark:border-surface-100 hover:bg-gray-50/60 dark:hover:bg-surface-100/60">
                      <td className="py-3 pr-4 text-gray-700 dark:text-slate-200 whitespace-nowrap">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-slate-200 whitespace-nowrap font-medium">
                        {record.petName}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${getServiceTypeColor(record.serviceType)}`}>
                          {translateServiceType(record.serviceType)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                        {record.veterinarianName}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${getStatusColor(record.status)}`}>
                          {translateStatus(record.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewDetails(record)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Versão mobile em cards */}
            <div className="sm:hidden space-y-3">
              {healthRecords && healthRecords.map((record, index) => (
                <div key={index} className="rounded-xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-75/90 p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        {formatDate(record.date)}
                      </p>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        {record.petName}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getServiceTypeColor(record.serviceType)}`}>
                          {translateServiceType(record.serviceType)}
                        </span>
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium self-start ${getStatusColor(record.status)}`}>
                      {translateStatus(record.status)}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-slate-300 space-y-1">
                    <p className="leading-snug">
                      <span className="font-medium text-gray-700 dark:text-slate-200">Veterinário:</span> {record.veterinarianName}
                    </p>
                    {record.description && (
                      <p className="leading-snug">
                        <span className="font-medium text-gray-700 dark:text-slate-200">Observações:</span> {record.description}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleViewDetails(record)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white dark:bg-surface-50 border-b border-gray-200 dark:border-surface-100 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalhes do Registro Médico
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Data do Atendimento
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-surface-75 p-3 rounded-lg">
                    {formatDate(selectedRecord.date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nome do Pet
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-surface-75 p-3 rounded-lg">
                    {selectedRecord.petName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Tipo de Serviço
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-surface-75 p-3 rounded-lg">
                    {selectedRecord.serviceType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Veterinário
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-surface-75 p-3 rounded-lg">
                    {selectedRecord.veterinarianName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedRecord.status)}`}>
                    {translateStatus(selectedRecord.status)}
                  </span>
                </div>
                {selectedRecord.local && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Local
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-surface-75 p-3 rounded-lg">
                      {selectedRecord.local}
                    </p>
                  </div>
                )}
              </div>

              {/* Descrição/Observações */}
              {selectedRecord.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Observações
                  </label>
                  <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-surface-75 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedRecord.description}</p>
                  </div>
                </div>
              )}

              {/* Anexos/Arquivos */}
              {selectedRecord.files && selectedRecord.files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Arquivos Anexados
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRecord.files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-surface-75 rounded-lg">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name || `Arquivo ${index + 1}`}
                          </p>
                          {file.size && (
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                          Baixar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-surface-75 px-6 py-4 flex justify-end space-x-3 rounded-b-xl border-t border-gray-200 dark:border-surface-100">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-surface-50 border border-gray-300 dark:border-surface-100 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-75 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalPanel;
