import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';
import { useAuth } from '../context/AuthContext';

const HealthFormCompact = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { isAuthenticated, authClient, createBackendActor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedActor, setAuthenticatedActor] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    petId: '', // Mudança: usar petId em vez de petName
    serviceType: '',
    veterinarianName: '',
    local: '',
    status: 'pending',
    description: '',
    attachments: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myPets, setMyPets] = useState([]);

  // Tipos de serviços médicos
  const serviceTypes = [
    { value: 'consulta', label: 'Consulta Rotineira' },
    { value: 'tratamento', label: 'Tratamento' },
    { value: 'cirurgia', label: 'Cirurgia' },
    { value: 'vacina', label: 'Vacinação' },
    { value: 'emergencia', label: 'Emergência' },
    { value: 'exame', label: 'Exames' }
  ];

  // Status do atendimento
  const statusOptions = [
    { value: 'pending', label: 'Agendado' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'in_progress', label: 'Em Andamento' }
  ];

  // Criar ator autenticado quando o authClient estiver disponível
  useEffect(() => {
    const createAuthenticatedActor = async () => {
      if (!authClient || !isAuthenticated) return;

      const identity = authClient.getIdentity();
      const network = import.meta.env.DFX_NETWORK || 'local';
      const host = network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943';
      
      const agent = new HttpAgent({ identity, host });
      if (network !== 'ic') {
        try {
          await agent.fetchRootKey();
        } catch (e) {
          console.warn('Erro ao buscar root key:', e);
        }
      }

      const actor = createActor(backendCanisterId, { agent });
      setAuthenticatedActor(actor);
    };

    createAuthenticatedActor();
  }, [authClient, isAuthenticated]);

  // Função para carregar pets do usuário
  const loadPets = async () => {
    try {
      const actor = authenticatedActor;
      if (!actor) return;
      const result = await actor.getMyPets();
      if ('ok' in result) {
        setMyPets(result.ok);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
      if (err?.message?.includes('Invalid delegation')) {
        setIsAuthenticated(false);
        setAuthenticatedActor(null);
        setError(t('login.error', 'Sessão inválida. Faça login novamente.'));
      }
    }
  };

  // Evitar chamadas duplicadas usando ref
  const petsLoadedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && authenticatedActor && !petsLoadedRef.current) {
      petsLoadedRef.current = true;
      loadPets();
    }
  }, [isAuthenticated, authenticatedActor]);

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para lidar com seleção de arquivos
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Criar previews dos arquivos
    const previews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return {
          type: 'image',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        };
      } else if (file.type === 'application/pdf') {
        return {
          type: 'pdf',
          name: file.name,
          size: file.size
        };
      } else {
        return {
          type: 'other',
          name: file.name,
          size: file.size
        };
      }
    });
    setFilePreviews(previews);
  };

  // Função para upload de arquivos para IPFS (simulado)
  const uploadFilesToIPFS = async () => {
    if (selectedFiles.length === 0) return [];

    setUploadingToIPFS(true);
    const uploadedCIDs = [];

    try {
      for (const file of selectedFiles) {
        // Simular upload para IPFS (substituir por implementação real)
        const simulatedCID = `Qm${Math.random().toString(36).substr(2, 44)}`;
        uploadedCIDs.push({
          cid: simulatedCID,
          filename: file.name,
          type: file.type,
          size: file.size
        });
        
        // Simular delay de upload
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return uploadedCIDs;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setUploadingToIPFS(false);
    }
  };

  // Função para submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !authenticatedActor) {
      setError(t('healthForm.loginPrompt', 'Você precisa estar logado para registrar informações de saúde.'));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload dos arquivos primeiro
      const attachments = await uploadFilesToIPFS();

      // Criar o actor autenticado para chamar o backend
      const actor = await createBackendActor();
      if (!actor) {
        throw new Error('Não foi possível criar conexão com o backend');
      }

      // Dados do registro de saúde para o backend Motoko
      const healthRecordPayload = {
        date: formData.date,
        serviceType: formData.serviceType,
        veterinarianName: formData.veterinarianName,
        local: formData.local && formData.local.trim() !== '' ? [formData.local] : [], // Opcional como array (Candid)
        status: formData.status,
        description: formData.description && formData.description.trim() !== '' ? [formData.description] : [], // Opcional como array (Candid)
        attachments: attachments.map(file => file.cid || '') // CIDs do IPFS
      };

      // Chamar a função do backend
      const result = await actor.createHealthRecord(parseInt(formData.petId), healthRecordPayload);
      
      if ('ok' in result) {
        console.log('Registro de saúde criado:', result.ok);
        setSuccess(t('healthForm.success', 'Registro de saúde adicionado com sucesso!'));
        
        // Limpar formulário
        setFormData({
          date: '',
          petId: '',
          serviceType: '',
          veterinarianName: '',
          local: '',
          status: 'pending',
          description: '',
          attachments: []
        });
        setSelectedFiles([]);
        setFilePreviews([]);

        // Chamar callback de sucesso se fornecido
        if (onSuccess) {
          onSuccess(result.ok);
        }
      } else {
        setError(result.err || t('healthForm.error', 'Erro ao salvar registro de saúde. Tente novamente.'));
      }

    } catch (error) {
      console.error('Erro ao criar registro:', error);
      setError(t('healthForm.error', 'Erro ao salvar registro de saúde. Tente novamente.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para remover arquivo selecionado
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('healthForm.loginPrompt', 'Você precisa estar autenticado para gerenciar registros de saúde')}
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-500">
          Faça login através da página de perfil para continuar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Grid para campos principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('healthForm.date', 'Data do Atendimento')} *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-surface-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-surface-75 text-gray-900 dark:text-white"
            />
          </div>

          {/* Seleção do Pet */}
          <div>
            <label htmlFor="petId" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('healthForm.petName', 'Selecionar Pet')} *
            </label>
            <select
              id="petId"
              name="petId"
              value={formData.petId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-surface-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-surface-75 text-gray-900 dark:text-white"
            >
              <option value="">{t('healthForm.selectPet', 'Selecione um pet')}</option>
              {myPets.map((pet) => (
                <option key={pet.id} value={pet.id.toString()}>
                  {pet.nickname} ({pet.species})
                </option>
              ))}
            </select>
            {myPets.length === 0 && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                {t('healthForm.noPetsMessage', 'Você precisa cadastrar um pet primeiro para adicionar registros médicos.')}
              </p>
            )}
          </div>

          {/* Tipo de Serviço */}
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('healthForm.serviceType', 'Tipo de Serviço')} *
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-surface-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-surface-75 text-gray-900 dark:text-white"
            >
              <option value="">{t('healthForm.selectServiceType', 'Selecione o tipo de serviço')}</option>
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(`healthForm.serviceTypes.${type.value}`, type.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Nome do Veterinário */}
          <div>
            <label htmlFor="veterinarianName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('healthForm.veterinarianName', 'Nome do Veterinário')} *
            </label>
            <input
              type="text"
              id="veterinarianName"
              name="veterinarianName"
              value={formData.veterinarianName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-surface-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-surface-75 text-gray-900 dark:text-white"
              placeholder={t('healthForm.veterinarianPlaceholder', 'Dr(a). Nome do veterinário')}
            />
          </div>

          {/* Local */}
          <div>
            <label htmlFor="local" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('healthForm.local', 'Local do Atendimento')}
            </label>
            <input
              type="text"
              id="local"
              name="local"
              value={formData.local}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-surface-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-surface-75 text-gray-900 dark:text-white"
              placeholder={t('healthForm.localPlaceholder', 'Clínica, hospital veterinário...')}
            />
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('healthForm.status', 'Status')} *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-surface-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-surface-75 text-gray-900 dark:text-white"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {t(`healthForm.statusOptions.${status.value}`, status.label)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {t('healthForm.descriptionField', 'Descrição/Observações')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-surface-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-surface-75 text-gray-900 dark:text-white"
            placeholder={t('healthForm.descriptionPlaceholder', 'Descreva detalhes do atendimento, medicamentos prescritos, recomendações...')}
          />
        </div>

        {/* Upload de Arquivos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('healthForm.attachments', 'Anexos (Opcional)')}
          </label>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            {t('healthForm.attachmentsDescription', 'Anexe comprovantes, receitas, carteira de vacinação, exames, etc.')}
          </p>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-surface-100 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-surface-75 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('healthForm.clickToSelect', 'Clique para selecionar arquivos')}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t('healthForm.dragAndDrop', 'ou arraste e solte aqui')}
                </p>
              </div>
            </label>
          </div>

          {/* Preview dos arquivos selecionados */}
          {filePreviews.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('healthForm.filesSelected', 'Arquivos selecionados:')}</h4>
              {filePreviews.map((preview, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-surface-100 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    {preview.type === 'image' ? (
                      <img 
                        src={preview.url} 
                        alt={preview.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-surface-75 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{preview.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{formatFileSize(preview.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || uploadingToIPFS}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || uploadingToIPFS ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {uploadingToIPFS ? t('healthForm.uploadingFiles', 'Enviando arquivos...') : t('healthForm.saving', 'Salvando...')}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('healthForm.saveRecord', 'Salvar Registro')}
              </span>
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {t('healthForm.required', '* Campos obrigatórios')}
          </p>
        </div>
      </form>
    </div>
  );
};

export default HealthFormCompact;
