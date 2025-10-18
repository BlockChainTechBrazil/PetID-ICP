import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import HealthFormCompact from '../HealthFormCompact';
import ICPImage from '../ICPImage';
import jsPDF from 'jspdf';
// React Icons
import {
  FiLock, // Árvore
  FiHeart, // Medicamento (coração para saúde)
  FiMessageCircle, // Communication
  FiSettings, // Settings
  FiCalendar, // Usuário
  FiFileText, // Documento
  FiImage, // Ver
  FiEdit3, // Editar
  FiDownload, // Download
  FiShare2, // Compartilhar
  FiPrinter, // Imprimir
  FiX, // Fechar
  FiExternalLink
} from 'react-icons/fi';
import { GiPawPrint } from 'react-icons/gi'; // Pata de pet

const MedicalPanel = () => {
  const { t } = useTranslation();
  const { createBackendActor, isAuthenticated } = useAuth();
  const [actor, setActor] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]); // Estado local para registros médicos
  const [petNames, setPetNames] = useState({}); // Cache de nomes dos pets
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); // Estado para o registro selecionado
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Estado para o modal de detalhes
  const [editMode, setEditMode] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [showTech, setShowTech] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [crmVet, setCrmVet] = useState('');
  const [clinicLogoUrl, setClinicLogoUrl] = useState('');
  const [clinicStampText, setClinicStampText] = useState('');

  // Criar actor quando autenticado
  useEffect(() => {
    const initializeActor = async () => {
      if (isAuthenticated) {
        try {
          const backendActor = await createBackendActor();
          setActor(backendActor);
        } catch (error) {
          console.error('Erro ao criar actor:', error);
        }
      }
    };
    initializeActor();
  }, [isAuthenticated, createBackendActor]);

  // Carregar registros médicos quando o componente for montado
  useEffect(() => {
    if (isAuthenticated) {
      loadHealthRecords();
    }
  }, [isAuthenticated]);

  // Função para carregar registros médicos do backend (compatível com a API atual)
  const loadHealthRecords = async () => {
    setLoading(true);
    try {
      const actor = await createBackendActor();
      if (!actor) return;

      // 1) Buscar todos os pets do usuário
      const petsRes = await actor.getMyPets();
      if (!('ok' in petsRes)) {
        setHealthRecords([]);
        return;
      }
      const myPets = petsRes.ok;

      // 2) Para cada pet, buscar seus registros de saúde
      const allRecords = [];
      const petNameCache = {};
      for (const pet of myPets) {
        petNameCache[pet.id] = pet.nickname;
        try {
          const recRes = await actor.getPetHealthRecords(pet.id);
          if ('ok' in recRes) {
            for (const rec of recRes.ok) {
              allRecords.push(rec);
            }
          }
        } catch (e) {
          console.warn('Erro ao carregar registros do pet', pet.id, e);
        }
      }

      // 3) Ordenar por data
      const sorted = allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPetNames(petNameCache);
      setHealthRecords(sorted);
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
    setEditMode(false);
    setShowTech(false);
    setShowAttachments(false);
  };

  // Função para fechar modal de detalhes
  const handleCloseDetails = () => {
    setSelectedRecord(null);
    setShowDetailsModal(false);
    setEditMode(false);
    setEditRecord(null);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Funções de ação rápida
  const handleStartEdit = () => {
    if (!selectedRecord) return;
    setEditRecord({
      veterinarianName: selectedRecord.veterinarianName || '',
      local: getOptionalValue(selectedRecord.local) || '',
      status: selectedRecord.status || 'completed',
      description: getOptionalValue(selectedRecord.description) || ''
    });
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selectedRecord || !editRecord) return;
    const updated = {
      ...selectedRecord,
      veterinarianName: editRecord.veterinarianName,
      local: editRecord.local ? [editRecord.local] : [],
      status: editRecord.status,
      description: editRecord.description ? [editRecord.description] : [],
    };
    setHealthRecords(prev => prev.map(r => (r === selectedRecord ? updated : r)));
    setSelectedRecord(updated);
    setEditMode(false);
  };

  const buildShareText = (rec) => {
    const pet = petNames[rec.petId] || `Pet #${rec.petId}`;
    const parts = [
      `Registro Médico • ${pet} • ${formatDate(rec.date)}`,
      `Tipo: ${translateServiceType(rec.serviceType)} | Status: ${translateStatus(rec.status)}`,
      `Vet: ${rec.veterinarianName}${getOptionalValue(rec.local) ? ` | Local: ${getOptionalValue(rec.local)}` : ''}`,
    ];
    const obs = getOptionalValue(rec.description);
    if (obs) parts.push(`Observações: ${obs}`);
    return parts.join('\n');
  };

  const handleDownloadPDF = () => {
    if (!selectedRecord) return;
    // Documento A4 com margens e cabeçalho
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const M = 48; // margem
    let y = M;
    const pageW = doc.internal.pageSize.getWidth();

    // Cabeçalho
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, pageW, 72, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('PetID • Registro Médico', M, 44);
    doc.setFontSize(11);
    doc.text(new Date().toLocaleString(), pageW - M, 44, { align: 'right' });

    // Corpo
    y = 96;
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(14);
    doc.text('Dados do Atendimento', M, y);
    y += 12;
    doc.setDrawColor(225);
    doc.line(M, y, pageW - M, y);
    y += 16;

    doc.setFontSize(12);
    const linhas = [
      [`Pet`, `${petNames[selectedRecord.petId] || `#${selectedRecord.petId}`}`],
      [`Data`, `${formatDate(selectedRecord.date)}`],
      [`Tipo`, `${translateServiceType(selectedRecord.serviceType)}`],
      [`Status`, `${translateStatus(selectedRecord.status)}`],
      [`Veterinário`, `Dr(a). ${selectedRecord.veterinarianName}`],
    ];
    const loc = getOptionalValue(selectedRecord.local);
    if (loc) linhas.push([`Local`, loc]);

    linhas.forEach(([k, v]) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${k}:`, M, y);
      doc.setFont(undefined, 'normal');
      doc.text(String(v), M + 120, y);
      y += 18;
    });

    const obs = getOptionalValue(selectedRecord.description);
    if (obs) {
      y += 6;
      doc.setFont(undefined, 'bold');
      doc.text('Observações', M, y);
      y += 10;
      doc.setFont(undefined, 'normal');
      const maxW = pageW - M * 2;
      const split = doc.splitTextToSize(obs, maxW);
      doc.text(split, M, y);
      y += 16 + split.length * 14;
    }

    // Rodapé
    doc.setDrawColor(230);
    doc.line(M, 780, pageW - M, 780);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Documento gerado por PetID • Internet Computer', M, 798);

    const filename = `registro_${selectedRecord.petId}_${selectedRecord.date}.pdf`;
    doc.save(filename);
  };

  const handleShare = async () => {
    if (!selectedRecord) return;
    const text = buildShareText(selectedRecord);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Registro Médico PetID', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('Resumo copiado para a área de transferência.');
      }
    } catch (e) {
      console.warn('Share cancelado ou não suportado:', e);
    }
  };

  const handlePrintPrescription = () => {
    if (!selectedRecord) return;
    const pet = petNames[selectedRecord.petId] || `Pet #${selectedRecord.petId}`;
    const obs = getOptionalValue(selectedRecord.description) || '';
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receituário - ${pet}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            body { font-family: Arial, sans-serif; color: #0b1220; }
            .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
            .brand { display:flex; align-items:center; gap:10px; font-weight:800; font-size:20px; color:#1f2937; }
            .muted { color:#6b7280; font-size:12px; }
            h1 { font-size:22px; margin: 8px 0 12px; color:#111827; }
            .section { border:1px solid #e5e7eb; border-radius:10px; padding:12px 14px; margin-top:12px; }
            .row { display:grid; grid-template-columns: 140px 1fr; gap:8px; font-size:13px; }
            .label { color:#6b7280; }
            .value { color:#111827; font-weight:600; }
            .presc { line-height:1.5; white-space:pre-wrap; font-size:13px; }
            .sign { height:110px; display:flex; align-items:flex-end; margin-top:24px; justify-content:space-between; }
            .sign .line { width:280px; border-top:1px solid #9ca3af; }
            .sign .who { margin-top:6px; font-size:12px; color:#374151; }
            .stamp { border:2px dashed #6b7280; border-radius:8px; padding:10px 12px; color:#374151; font-size:12px; text-align:center; min-width:160px; }
            .footer { position:fixed; bottom:0; left:0; right:0; text-align:center; font-size:11px; color:#6b7280; }
            @media print { .noprint { display:none } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">${clinicLogoUrl ? `<img src="${clinicLogoUrl}" alt="Logo" style="width:28px;height:28px;object-fit:contain;border-radius:6px;border:1px solid #e5e7eb;"/>` : ''} PetID • Receituário</div>
            <div class="muted">${new Date().toLocaleString()}</div>
          </div>
          <h1>Prescrição Veterinária</h1>
          <div class="section">
            <div class="row"><div class="label">Pet</div><div class="value">${pet}</div></div>
            <div class="row"><div class="label">Data</div><div class="value">${formatDate(selectedRecord.date)}</div></div>
            <div class="row"><div class="label">Tipo</div><div class="value">${translateServiceType(selectedRecord.serviceType)}</div></div>
            <div class="row"><div class="label">Status</div><div class="value">${translateStatus(selectedRecord.status)}</div></div>
            <div class="row"><div class="label">Veterinário</div><div class="value">Dr(a). ${selectedRecord.veterinarianName}${crmVet ? ' • CRMV ' + crmVet : ''}</div></div>
          </div>
          ${obs ? `<div class="section"><div class="presc">${obs.replace(/\n/g, '<br/>')}</div></div>` : ''}
          <div class="sign">
            <div>
              <div class="line"></div>
              <div class="who">Assinatura do Profissional</div>
            </div>
            ${clinicStampText ? `<div class="stamp">${clinicStampText}</div>` : ''}
          </div>
          <div class="footer">Documento emitido por PetID • Internet Computer</div>
          <script>window.print(); window.onafterprint = () => window.close();</script>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
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
          <FiHeart className="mr-2 h-5 w-5" />
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
          </div>
        ) : healthRecords.length === 0 ? (
          /* Estado vazio */
          <div className="text-center py-12">
            <FiFileText className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
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
              <FiHeart className="mr-2 h-5 w-5" />
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
                  <div className="flex flex-wrap items-center gap-3 text-blue-100">
                    <span className="flex items-center">
                      <GiPawPrint className="w-6 h-6 text-[#8A8BED]" />
                      {petNames[selectedRecord.petId] || `Pet #${selectedRecord.petId}`}
                    </span>
                    <span className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {formatDate(selectedRecord.date)}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {translateServiceType(selectedRecord?.serviceType)}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {translateStatus(selectedRecord?.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-white hover:text-blue-200 transition-colors p-1"
                >
                  <FiX className="w-6 h-6" />
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
                      <FiFileText className="w-5 h-5 mr-2" />
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
                        <FiMessageCircle className="w-5 h-5 mr-2" />
                        Observações e Diagnóstico
                      </h4>
                      <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                        <p className="text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {getOptionalValue(selectedRecord.description)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card de Informações Técnicas (colapsável) */}
                  <div className="rounded-xl">
                    <button onClick={() => setShowTech(v => !v)} className="text-xs text-purple-700 dark:text-purple-300 underline">
                      {showTech ? 'Ocultar detalhes técnicos' : 'Mostrar detalhes técnicos'}
                    </button>
                    {showTech && (
                      <div className="mt-3 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-purple-200 dark:border-surface-200">
                        <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                          <FiLock className="w-5 h-5 mr-2" />
                          Informações Técnicas da Blockchain
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                            <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">ID do Registro</label>
                            <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedRecord.id}</p>
                          </div>
                          <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                            <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Pet NFT ID</label>
                            <p className="text-gray-900 dark:text-white font-mono text-sm">#{selectedRecord.petId}</p>
                          </div>
                          <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                            <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Timestamp</label>
                            <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedRecord?.createdAt ? new Date(Number(selectedRecord.createdAt) / 1000000).toLocaleString() : '-'}</p>
                          </div>
                          <div className="bg-white dark:bg-surface-50 p-4 rounded-lg shadow-sm">
                            <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Anexos (ICP Assets)</label>
                            <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedRecord?.attachments ? selectedRecord.attachments.length : 0} arquivo(s)</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna Lateral - Galeria de Anexos */}
                <div className="space-y-6">
                  {/* Galeria de Fotos/Anexos */}
                  {selectedRecord?.attachments && selectedRecord.attachments.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-orange-200 dark:border-surface-200">
                      <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center">
                        <FiImage className="w-5 h-5 mr-2" />
                        Anexos ({selectedRecord.attachments.length})
                      </h4>

                      {!showAttachments && (
                        <button onClick={() => setShowAttachments(true)} className="text-xs text-blue-600 dark:text-blue-300 underline">
                          Ver anexos
                        </button>
                      )}

                      {showAttachments && (
                        <div className="space-y-3">
                          {selectedRecord.attachments.map((attachment, index) => {
                            // Verificar se o attachment está válido
                            const isValidAttachment = attachment && attachment.length > 0;

                            if (!isValidAttachment) {
                              return (
                                <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                  <div className="flex items-center space-x-3">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                      <p className="text-red-800 dark:text-red-200 font-medium text-sm">
                                        Anexo inválido #{index + 1}
                                      </p>
                                      <p className="text-red-600 dark:text-red-400 text-xs">
                                        ID: {attachment || 'Não informado'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={index} className="bg-white dark:bg-surface-50 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-surface-100">
                                <div className="aspect-square relative group">
                                  <ICPImage
                                    assetId={attachment}
                                    altText={`Anexo ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                    actor={actor}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                    <FiExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-surface-75 border-t border-gray-100 dark:border-surface-100">
                                  <div className="flex space-x-2"></div>

                                  <div className="mt-2 text-center">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(attachment)}
                                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center justify-center space-x-1"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                      <span>Copiar Asset ID</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card de Ações Rápidas */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-surface-75 dark:to-surface-100 rounded-xl p-6 border border-gray-200 dark:border-surface-200">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <FiSettings className="w-5 h-5 mr-2" />
                      Ações Rápidas
                    </h4>

                    <div className="space-y-3">
                      <button onClick={handleStartEdit} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <FiEdit3 className="w-4 h-4" />
                        <span>Editar Registro</span>
                      </button>

                      <button onClick={handleDownloadPDF} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <FiDownload className="w-4 h-4" />
                        <span>Baixar PDF</span>
                      </button>

                      <button onClick={handleShare} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <FiShare2 className="w-4 h-4" />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>

                  {/* Opções do Receituário (opcionais) */}
                  <div className="bg-white dark:bg-surface-50 rounded-xl p-6 border border-gray-200 dark:border-surface-200">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Opções do Receituário</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">CRMV do Veterinário (opcional)</label>
                        <input value={crmVet} onChange={(e) => setCrmVet(e.target.value)} placeholder="Ex: CRMV-PE 12345" className="w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">URL do Logo da Clínica (opcional)</label>
                        <input value={clinicLogoUrl} onChange={(e) => setClinicLogoUrl(e.target.value)} placeholder="https://.../logo.png" className="w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Texto do Carimbo (opcional)</label>
                        <textarea rows={2} value={clinicStampText} onChange={(e) => setClinicStampText(e.target.value)} placeholder="Nome da Clínica, Endereço, Contato..." className="w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Essas opções aparecem no receituário impresso.</p>
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
                <button onClick={handlePrintPrescription} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg flex items-center space-x-2">
                  <FiPrinter className="w-4 h-4" />
                  <span>Imprimir Receituário</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área de edição simples, exibida dentro do modal (header e footer permanecem) */}
      {showDetailsModal && selectedRecord && editMode && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="pointer-events-auto absolute inset-x-0 bottom-24 mx-auto max-w-4xl bg-white dark:bg-surface-50 border border-gray-200 dark:border-surface-100 rounded-xl p-5 shadow-2xl">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Editar Registro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Status</label>
                <select value={editRecord?.status || 'completed'} onChange={(e) => setEditRecord(r => ({ ...r, status: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100">
                  <option value="pending">Agendado</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Veterinário</label>
                <input value={editRecord?.veterinarianName || ''} onChange={(e) => setEditRecord(r => ({ ...r, veterinarianName: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Local</label>
                <input value={editRecord?.local || ''} onChange={(e) => setEditRecord(r => ({ ...r, local: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Observações</label>
                <textarea rows={3} value={editRecord?.description || ''} onChange={(e) => setEditRecord(r => ({ ...r, description: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setEditMode(false); setEditRecord(null); }} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-surface-75 text-gray-800 dark:text-slate-200">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalPanel;
