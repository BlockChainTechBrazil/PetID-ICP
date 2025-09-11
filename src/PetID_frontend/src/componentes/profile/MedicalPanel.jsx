
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import HealthFormCompact from '../HealthFormCompact';

const MedicalPanel = () => {
  const { t } = useTranslation();
  const { createBackendActor, isAuthenticated } = useAuth();
  const [healthRecords, setHealthRecords] = useState([]); // Estado local para registros médicos
  const [petNames, setPetNames] = useState({}); // Cache de nomes dos pets
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
        const result = await actor.getMyHealthRecords();
        if ('ok' in result) {
          // Ordenar registros por data (mais recentes primeiro)
          const sortedRecords = result.ok.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          
          // Buscar nomes dos pets para cada registro
          const petNameCache = {};
          for (const record of sortedRecords) {
            if (!petNameCache[record.petId]) {
              try {
                const petResult = await actor.getPet(record.petId);
                if ('ok' in petResult) {
                  petNameCache[record.petId] = petResult.ok.nickname;
                } else {
                  petNameCache[record.petId] = `Pet #${record.petId}`;
                }
              } catch (error) {
                console.error(`Erro ao buscar pet ${record.petId}:`, error);
                petNameCache[record.petId] = `Pet #${record.petId}`;
              }
            }
          }
          
          setPetNames(petNameCache);
          setHealthRecords(sortedRecords);
          console.log('✅ Registros médicos carregados:', sortedRecords);
          console.log('✅ Nomes dos pets:', petNameCache);
        } else {
          console.error('❌ Erro ao carregar registros:', result.err);
          setHealthRecords([]);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar registros médicos:', error);
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar novo registro ao histórico
  const handleNewRecord = () => {
    setShowForm(false); // Fechar o formulário
    // Recarregar registros do backend para mostrar o novo registro
    loadHealthRecords();
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

  // Função auxiliar para extrair valores opcionais (que vêm como arrays do backend)
  const getOptionalValue = (optionalField) => {
    if (!optionalField) return '';
    if (Array.isArray(optionalField) && optionalField.length > 0) {
      return optionalField[0];
    }
    return optionalField;
  };

  // Função para obter o nome do pet a partir do ID
  const getPetName = async (petId) => {
    try {
      const actor = await createBackendActor();
      if (actor) {
        const result = await actor.getPet(petId);
        if ('ok' in result) {
          return result.ok.nickname;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar nome do pet:', error);
    }
    return `Pet #${petId}`;
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
            <svg className="animate-spin mx-auto h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 dark:text-slate-300">Carregando registros médicos...</p>
          </div>
        ) : healthRecords.length === 0 ? (
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
                  {healthRecords.map((record, index) => (
                    <tr key={record.id || index} className="border-t border-gray-100 dark:border-surface-100 hover:bg-gray-50/60 dark:hover:bg-surface-100/60">
                      <td className="py-3 pr-4 text-gray-700 dark:text-slate-200 whitespace-nowrap">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-slate-200 whitespace-nowrap font-medium">
                        {petNames[record.petId] || `Pet #${record.petId}`}
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
              {healthRecords.map((record, index) => (
                <div key={record.id || index} className="rounded-xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-75/90 p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        {formatDate(record.date)}
                      </p>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        {petNames[record.petId] || `Pet #${record.petId}`}
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
                    {getOptionalValue(record.description) && (
                      <p className="leading-snug">
                        <span className="font-medium text-gray-700 dark:text-slate-200">Observações:</span> {getOptionalValue(record.description)}
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

      {/* Modal de Detalhes Abrangente */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-50 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Header do Modal com Informações do Pet */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    Registro Médico Completo
                  </h3>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {petNames[selectedRecord.petId] || `Pet #${selectedRecord.petId}`}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2m-6 0V7" />
                      </svg>
                      {formatDate(selectedRecord.date)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-white hover:text-blue-200 transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6">
              {/* Layout em Grid Responsivo */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Coluna Principal - Informações Médicas */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Card de Informações Básicas */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-blue-200 dark:border-surface-200">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Informações do Atendimento
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
                          Tipo de Serviço
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {translateServiceType(selectedRecord?.serviceType)}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
                          Status
                        </label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRecord?.status)}`}>
                          <div className="w-2 h-2 rounded-full mr-2 bg-current opacity-75"></div>
                          {translateStatus(selectedRecord?.status)}
                        </span>
                      </div>
                      
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
                          Veterinário Responsável
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          Dr(a). {selectedRecord?.veterinarianName}
                        </p>
                      </div>
                      
                      {getOptionalValue(selectedRecord?.local) && (
                        <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                          <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
                            Local do Atendimento
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {getOptionalValue(selectedRecord.local)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card de Observações Clínicas */}
                  {getOptionalValue(selectedRecord?.description) && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-green-200 dark:border-surface-200">
                      <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Observações e Diagnóstico
                      </h4>
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <p className="text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {getOptionalValue(selectedRecord.description)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card de Informações Técnicas */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-purple-200 dark:border-surface-200">
                    <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      Informações Técnicas da Blockchain
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">
                          ID do Registro
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                          {selectedRecord.id}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">
                          Pet NFT ID
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                          #{selectedRecord.petId}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">
                          Timestamp
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                          {new Date(Number(selectedRecord.timestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">
                          Anexos IPFS
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                          {selectedRecord?.attachments ? selectedRecord.attachments.length : 0} arquivo(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Lateral - Galeria de Anexos */}
                <div className="space-y-6">
                  {/* Galeria de Fotos/Anexos */}
                  {selectedRecord?.attachments && selectedRecord.attachments.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-orange-200 dark:border-surface-200">
                      <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Anexos ({selectedRecord.attachments.length})
                      </h4>
                      
                      <div className="space-y-3">
                        {selectedRecord.attachments.map((attachment, index) => {
                          const isImage = attachment.includes('.jpg') || attachment.includes('.png') || attachment.includes('.jpeg') || attachment.includes('.webp');
                          
                          return (
                            <div key={index} className="bg-white dark:bg-surface-50 rounded-lg overflow-hidden shadow-sm">
                              {isImage ? (
                                <div className="aspect-square relative group">
                                  <img
                                    src={`https://gateway.pinata.cloud/ipfs/${attachment}`}
                                    alt={`Anexo ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                      // Fallback para outro gateway
                                      e.target.src = `https://ipfs.io/ipfs/${attachment}`;
                                    }}
                                    onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${attachment}`, '_blank')}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      Documento #{index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                      IPFS: {attachment.substring(0, 12)}...
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="p-3 bg-gray-50 dark:bg-surface-75 border-t border-gray-100 dark:border-surface-100">
                                <button
                                  onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${attachment}`, '_blank')}
                                  className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center space-x-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  <span>Abrir</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Card de Ações Rápidas */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-gray-200 dark:border-surface-200">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Ações Rápidas
                    </h4>
                    
                    <div className="space-y-3">
                      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar Registro</span>
                      </button>
                      
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Baixar PDF</span>
                      </button>
                      
                      <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-white dark:bg-surface-50 px-6 py-4 flex justify-between items-center rounded-b-xl border-t border-gray-200 dark:border-surface-100">
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Registro armazenado na blockchain ICP
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseDetails}
                  className="px-6 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-surface-75 border border-gray-300 dark:border-surface-100 rounded-lg hover:bg-gray-200 dark:hover:bg-surface-100 transition-colors font-medium"
                >
                  Fechar
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg">
                  Imprimir Receituário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalPanel;
