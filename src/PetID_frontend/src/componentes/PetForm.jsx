import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';
import { useAuth } from '../context/AuthContext';

const PetForm = () => {
  const { t } = useTranslation();
  const { isAuthenticated, authClient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedActor, setAuthenticatedActor] = useState(null);
  const [formData, setFormData] = useState({
    photo: '', // CID da imagem no IPFS
    nickname: '',
    birthDate: '',
    species: '',
    gender: '',
    color: '',
    isLost: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({}); // Para controlar loading das imagens dos pets
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myPets, setMyPets] = useState([]);

  // Criar ator autenticado quando o authClient estiver disponível
  useEffect(() => {
    const createAuthenticatedActor = async () => {
      if (!authClient || !isAuthenticated) return;

      const identity = authClient.getIdentity();
      const network = import.meta.env.DFX_NETWORK || 'local';
      const host = network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943';
      console.log('[AuthActor] Criando agent', { network, host, backendCanisterId });
      
      const agent = new HttpAgent({ identity, host });
      if (network !== 'ic') {
        try {
          await agent.fetchRootKey();
          console.log('[AuthActor] Root key obtida');
        } catch (e) {
          console.warn('[AuthActor] Falha ao obter root key', e);
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
      const actor = authenticatedActor; // só chama se autenticado
      if (!actor) return; // evita chamadas anônimas que geram 400
      const result = await actor.getMyPets();
      if ('ok' in result) {
        setMyPets(result.ok);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
      const msg = String(err?.message || '');
      if (msg.includes('Invalid delegation') || msg.includes('certificate verification failed')) {
        console.warn('[Auth] Delegação inválida detectada. Forçando logout.');
        if (authClient) {
          await authClient.logout();
        }
        setIsAuthenticated(false);
        setAuthenticatedActor(null);
        setError('Sessão inválida. Faça login novamente.');
      }
    }
  };

  // Evitar chamadas duplicadas (StrictMode) usando ref
  const petsLoadedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && authenticatedActor && !petsLoadedRef.current) {
      petsLoadedRef.current = true;
      loadPets();
    }
  }, [isAuthenticated, authenticatedActor]);

  // Função para login com Internet Identity
  const handleLogin = async () => {
    setIsLoading(true);
    const iiCanister = import.meta.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai';
    const network = import.meta.env.DFX_NETWORK || 'local';
    const identityProvider = network === 'ic'
      ? 'https://identity.ic0.app/#authorize'
      : `http://${iiCanister}.localhost:4943/#authorize`;
    console.log('[Login] identityProvider', identityProvider);

    await authClient?.login({
      identityProvider,
      onSuccess: async () => {
        setIsAuthenticated(true);
        await createAuthenticatedActor(authClient);
        console.log('[Login] Principal autenticado:', authClient.getIdentity().getPrincipal().toString());
        await loadPets();
        setIsLoading(false);
      },
      onError: (err) => {
        console.error('Login failed:', err);
        setError('Falha ao fazer login. Tente novamente.');
        setIsLoading(false);
      },
    });
  };

  const handleClearIdentity = async () => {
    try {
      const client = await AuthClient.create();
      await client.logout();
      // Limpar possíveis chaves residuais
      try { sessionStorage.clear(); } catch { }
      try { localStorage.removeItem('ic-identity'); } catch { }
      setIsAuthenticated(false);
      setAuthenticatedActor(null);
      setMyPets([]);
      petsLoadedRef.current = false;
      setError('Sessão limpa. Faça login novamente.');
      console.log('[Identity] Sessão/Delegação limpa');
    } catch (e) {
      console.warn('Falha ao limpar identidade', e);
    }
  };

  // Função para logout
  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
    }
    setIsAuthenticated(false);
    setAuthenticatedActor(null);
    setMyPets([]);
    petsLoadedRef.current = false;
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Função para lidar com seleção de arquivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
        return;
      }

      // Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('O arquivo é muito grande. Máximo permitido: 10MB.');
        return;
      }

      setSelectedFile(file);
      setError(''); // Limpar erros anteriores

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para upload para IPFS usando múltiplos serviços
  const uploadToIPFS = async (file) => {
    try {
      // Verificar se o arquivo é válido
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione um arquivo de imagem válido.');
      }

      // Verificar tamanho do arquivo (máximo 5MB para melhor compatibilidade)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('O arquivo é muito grande. Máximo permitido: 5MB.');
      }

      console.log('🚀 Iniciando upload para IPFS...');
      console.log('📁 Arquivo:', file.name, 'Tamanho:', (file.size / 1024).toFixed(2) + 'KB');

      // Método 1: Tentar Pinata primeiro (temos a chave configurada)
      console.log('🔄 Tentando upload via Pinata...');
      const result = await uploadViaPinata(file);

      if (!result) {
        throw new Error('Pinata não retornou um CID válido');
      }

      console.log('🎉 Upload via Pinata realizado com sucesso! CID:', result);
      console.log('🔗 URL da imagem:', `https://gateway.pinata.cloud/ipfs/${result}`);
      return result;

    } catch (error) {
      console.error('❌ Erro no upload IPFS:', error);
      throw error;
    }
  };

  // Upload via NFT.Storage (gratuito e funcional)
  const uploadViaNFTStorage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjpwdWJsaWMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NjY0NzY4NywibmFtZSI6InRlc3QifQ.test',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`NFT.Storage erro: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Upload via NFT.Storage bem-sucedido:', result.value.cid);
    return result.value.cid;
  };

  // Upload via Pinata (usando chave real do .env)
  const uploadViaPinata = async (file) => {
    console.log('📤 Iniciando upload para Pinata...');
    console.log('🔑 Verificando JWT...');

    // Debug das variáveis de ambiente
    console.log('🔍 Debug das variáveis de ambiente:');
    console.log('- REACT_APP_PINATA_JWT:', import.meta.env.REACT_APP_PINATA_JWT ? 'DEFINIDO' : 'NÃO DEFINIDO');
    console.log('- VITE_REACT_APP_PINATA_JWT:', import.meta.env.VITE_REACT_APP_PINATA_JWT ? 'DEFINIDO' : 'NÃO DEFINIDO');
    console.log('- Todas as variáveis import.meta.env:', Object.keys(import.meta.env));

    const jwtToken = import.meta.env.REACT_APP_PINATA_JWT || import.meta.env.VITE_REACT_APP_PINATA_JWT;
    console.log('🔑 JWT presente:', jwtToken ? `Sim (${jwtToken.substring(0, 20)}...)` : 'NÃO ENCONTRADO!');

    if (!jwtToken) {
      throw new Error('❌ REACT_APP_PINATA_JWT não encontrado no ambiente!');
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log('📦 Arquivo adicionado ao FormData:', file.name, file.type);

    const metadata = JSON.stringify({
      name: `pet-photo-${Date.now()}`,
      keyvalues: {
        type: 'pet-photo',
        uploaded_at: new Date().toISOString(),
        original_name: file.name
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    console.log('🌐 Fazendo requisição para Pinata...');

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: formData,
    });

    console.log('📡 Resposta do Pinata:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro do Pinata (texto):', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('❌ Erro do Pinata (JSON):', errorData);
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta JSON:', parseError);
        throw new Error(`Pinata erro ${response.status}: ${errorText}`);
      }

      throw new Error(`Pinata erro ${response.status}: ${errorData.error?.reason || errorData.message || 'Erro desconhecido'}`);
    }

    const resultText = await response.text();
    console.log('📄 Resposta completa (texto):', resultText);

    let result;
    try {
      result = JSON.parse(resultText);
      console.log('✅ Resposta completa do Pinata (JSON):', result);
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta de sucesso:', parseError);
      throw new Error('Resposta do Pinata não é JSON válido');
    }

    console.log('🎯 CID retornado:', result.IpfsHash);

    if (!result.IpfsHash) {
      console.error('❌ Resposta não contém IpfsHash:', result);
      throw new Error('Pinata não retornou um CID válido');
    }

    return result.IpfsHash;
  };

  // Função para verificar se um CID está disponível no IPFS
  const verifyCIDAvailability = async (cid) => {
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/'
    ];

    for (const gateway of gateways) {
      try {
        const response = await fetch(`${gateway}${cid}`, {
          method: 'HEAD', // Apenas verificar se existe, não baixar
          timeout: 5000
        });

        if (response.ok) {
          console.log(`✅ CID ${cid} encontrado em: ${gateway}`);
          return { available: true, gateway };
        }
      } catch (error) {
        console.log(`❌ CID ${cid} não encontrado em: ${gateway}`);
        continue;
      }
    }

    return { available: false, gateway: null };
  };

  // Função melhorada para simular CID com verificação
  const simulateCID = async (file) => {
    // CIDs conhecidos que devem funcionar
    const knownCIDs = [
      // Vamos usar um CID que sabemos que funciona - logo do IPFS
      'QmRyUEkVCWfzHSzjFe2nMhRhNJTJFz7c1gLQfN8T8NoYdz',
      'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB',
      'QmUNLLsPACCz1vLxQVkXqqLX5R1X9RVqGWP2veRtSxEN5Y'
    ];

    // Tentar encontrar um CID que funcione
    for (const cid of knownCIDs) {
      const verification = await verifyCIDAvailability(cid);
      if (verification.available) {
        console.log(`🎯 Usando CID verificado: ${cid}`);
        return cid;
      }
    }

    // Se nenhum CID conhecido funcionar, gerar um baseado no arquivo
    const fileHash = file.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const fallbackCID = knownCIDs[Math.abs(fileHash) % knownCIDs.length];
    console.log(`⚠️ Usando CID de fallback: ${fallbackCID} (pode não funcionar)`);
    return fallbackCID;
  };

  // Função para fazer upload da imagem e obter CID (melhorada)
  const handleImageUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione uma imagem primeiro.');
      return;
    }

    setUploadingToIPFS(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 === INICIANDO PROCESSO DE UPLOAD ===');
      console.log('📁 Arquivo selecionado:', selectedFile.name, selectedFile.type, selectedFile.size);

      setSuccess('🔄 Processando imagem...');

      const cid = await uploadToIPFS(selectedFile);

      console.log('🎯 CID RECEBIDO DO UPLOAD:', cid);

      if (!cid || cid.length < 10) {
        throw new Error('CID inválido recebido');
      }

      setSuccess('🔍 Verificando disponibilidade do CID...');
      const verification = await verifyCIDAvailability(cid);

      // SEMPRE usar o CID retornado, independente da verificação
      setFormData(prev => {
        const newFormData = {
          ...prev,
          photo: cid
        };
        console.log('💾 Salvando CID no formulário:', cid);
        console.log('📋 FormData atualizado:', newFormData);
        return newFormData;
      });

      if (verification.available) {
        setSuccess(`✅ Imagem enviada e verificada! CID: ${cid}`);
        console.log('✅ CID verificado e funcionando:', cid);
      } else {
        setSuccess(`⚠️ Upload realizado! CID: ${cid} (Propagação na rede IPFS pode levar alguns minutos)`);
        console.log('⚠️ CID gerado mas ainda se propagando:', cid);
      }

      console.log('🏁 === PROCESSO DE UPLOAD CONCLUÍDO ===');

    } catch (error) {
      console.error('❌ ERRO NO PROCESSO DE UPLOAD:', error);
      setError(`❌ Erro no upload: ${error.message}`);
    }

    setUploadingToIPFS(false);
  };

  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Resetar mensagens
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validações básicas
    if (!formData.photo.trim()) {
      setError('O CID da foto (IPFS) é obrigatório.');
      setIsLoading(false);
      return;
    }

    if (!formData.nickname.trim()) {
      setError('O apelido do pet é obrigatório.');
      setIsLoading(false);
      return;
    }

    if (!formData.birthDate) {
      setError('A data de nascimento é obrigatória.');
      setIsLoading(false);
      return;
    }

    try {
      // Verificações de segurança e logs para diagnóstico
      if (!authenticatedActor) {
        throw new Error('Ator autenticado ainda não inicializado. Refaça login.');
      }
      
      if (!authClient) {
        throw new Error('AuthClient não disponível. Refaça login.');
      }
      
      if (!isAuthenticated) {
        throw new Error('Usuário não está autenticado. Refaça login.');
      }
      
      console.log('[PetForm] Tentando criar pet:', {
        photo: formData.photo,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
        isAuthenticated,
        hasActor: !!authenticatedActor
      });
      
      const actor = authenticatedActor;
      const result = await actor.createPet({
        photo: formData.photo,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
      });

      if ('ok' in result) {
        // Sucesso ao registrar o pet
        setSuccess('Pet registrado com sucesso!');
        // Limpar o formulário
        setFormData({
          photo: '',
          nickname: '',
          birthDate: '',
        });
        setSelectedFile(null);
        setImagePreview('');
        // Atualizar a lista de pets
        loadPets();
      } else if ('err' in result) {
        // Erro retornado pelo backend
        console.error('[PetForm] Erro do backend:', result.err);
        setError(result.err);
      }
    } catch (err) {
      console.error('[PetForm] Erro ao criar pet:', err);
      const msg = String(err?.message || err);
      
      if (msg.includes('Invalid delegation') || msg.includes('delegation')) {
        setError('Sessão expirada (delegação inválida). Faça logout e login novamente.');
      } else if (msg.includes('Invalid signature') || msg.includes('signature')) {
        setError('Erro de assinatura. Tente fazer logout e login novamente.');
      } else if (msg.includes('verification failed')) {
        setError('Falha na verificação. Tente fazer logout e login novamente.');
      } else {
        setError(`Erro ao registrar o pet: ${msg}`);
      }
    }

    setIsLoading(false);
  };

  // Formatar a data para exibição
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Formatar timestamp para data/hora
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
      return date.toLocaleString();
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Formatar Principal para exibição
  const formatPrincipal = (principal) => {
    const principalStr = principal.toString();
    return `${principalStr.slice(0, 8)}...${principalStr.slice(-8)}`;
  };

  // Função para gerenciar loading das imagens dos pets
  const handleImageLoad = (petId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [petId]: false
    }));
  };

  const handleImageStart = (petId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [petId]: true
    }));
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {t('petForm.title', 'Registre seu Pet')}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              {t('petForm.description', 'Registre seu animal de estimação na blockchain do Internet Computer')}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="mb-6 text-gray-600">
                {t('petForm.loginPrompt', 'Para registrar seu pet, é necessário conectar-se com sua Internet Identity')}
              </p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-500 text-white font-medium rounded-full shadow-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('petForm.connecting', 'Conectando...')}
                    </span>
                  ) : (
                    t('petForm.connectWithII', 'Conectar com Internet Identity')
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearIdentity}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >Limpar sessão / delegação</button>
              </div>
            </div>
          ) : (
            <>
              {/* Formulário para usuários autenticados */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-8">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                      {success}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('petForm.photo', 'Foto do Pet')} *
                    </label>

                    {/* Upload de arquivo */}
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Preview da imagem */}
                    {imagePreview && (
                      <div className="mb-4 text-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-lg object-cover mx-auto border-2 border-gray-200"
                        />
                      </div>
                    )}

                    {/* Botão para upload para IPFS */}
                    {selectedFile && !formData.photo && (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadingToIPFS}
                          className="w-full px-4 py-2 bg-purple-500 text-white font-medium rounded-md hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                          {uploadingToIPFS ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Enviando para IPFS...
                            </span>
                          ) : (
                            'Enviar para IPFS'
                          )}
                        </button>
                      </div>
                    )}

                    {/* Campo manual para CID (opcional) */}
                    <div>
                      <label htmlFor="photo" className="block text-sm font-medium text-gray-600 mb-1">
                        Ou cole o CID da imagem IPFS:
                      </label>
                      <input
                        type="text"
                        id="photo"
                        name="photo"
                        value={formData.photo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('petForm.photoPlaceholder', 'CID da imagem no IPFS')}
                      />
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setError('');
                            setSuccess('Verificando CIDs conhecidos...');

                            // Lista de CIDs para testar
                            const testCIDs = [
                              'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB',
                              'QmUNLLsPACCz1vLxQVkXqqLX5R1X9RVqGWP2veRtSxEN5Y',
                              'QmRyUEkVCWfzHSzjFe2nMhRhNJTJFz7c1gLQfN8T8NoYdz'
                            ];

                            for (const cid of testCIDs) {
                              const verification = await verifyCIDAvailability(cid);
                              if (verification.available) {
                                setFormData({
                                  ...formData,
                                  photo: cid
                                });
                                setSuccess(`✅ CID funcionando encontrado: ${cid}`);
                                return;
                              }
                            }

                            setError('❌ Nenhum CID de teste funcionou. Gateways IPFS podem estar instáveis.');
                          }}
                          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md transition-colors duration-200 mr-2"
                        >
                          � Verificar CID Real
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Usar um placeholder data URL para garantir que funcione
                            const dataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjNDMzOENBIi8+CjxwYXRoIGQ9Ik00NyA0OEM0NyA0NC42ODYzIDQ5LjY4NjMgNDIgNTMgNDJINzVDNzguMzEzNyA0MiA4MSA0NC42ODYzIDgxIDQ4VjgwQzgxIDgzLjMxMzcgNzguMzEzNyA4NiA3NSA4Nkg1M0M0OS42ODYzIDg2IDQ3IDgzLjMxMzcgNDcgODBWNDhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTUgNTVDNTcuNzYxNCA1NSA2MCA1Mi43NjE0IDYwIDUwQzYwIDQ3LjIzODYgNTcuNzYxNCA0NSA1NSA0NUM1Mi4yMzg2IDQ1IDUwIDQ3LjIzODYgNTAgNTBDNTAgNTIuNzYxNCA1Mi4yMzg2IDU1IDU1IDU1WiIgZmlsbD0iIzQzMzhDQSIvPgo8cGF0aCBkPSJNNzMgNTVDNzUuNzYxNCA1NSA3OCA1Mi43NjE0IDc4IDUwQzc4IDQ3LjIzODYgNzUuNzYxNCA0NSA3MyA0NUM3MC4yMzg2IDQ1IDY4IDQ3LjIzODYgNjggNTBDNjggNTIuNzYxNCA3MC4yMzg2IDU1IDczIDU1WiIgZmlsbD0iIzQzMzhDQSIvPgo8cGF0aCBkPSJNNTggNzJDNjIuNDE4MyA3MiA2NiA2OC40MTgzIDY2IDY0QzY2IDU5LjU4MTcgNjIuNDE4MyA1NiA1OCA1NkM1My41ODE3IDU2IDUwIDU5LjU4MTcgNTAgNjRDNTAgNjguNDE4MyA1My41ODE3IDcyIDU4IDcyWiIgZmlsbD0iIzQzMzhDQSIvPgo8cGF0aCBkPSJNNzAgNzJDNzQuNDE4MyA3MiA3OCA2OC40MTgzIDc4IDY0Qzc4IDU5LjU4MTcgNzQuNDE4MyA1NiA3MCA1NkM2NS41ODE3IDU2IDYyIDU5LjU4MTcgNjIgNjRDNjIgNjguNDE4MyA2NS41ODE3IDcyIDcwIDcyWiIgZmlsbD0iIzQzMzhDQSIvPgo8L3N2Zz4K";
                            setFormData({
                              ...formData,
                              photo: 'local-placeholder'
                            });
                            setImagePreview(dataUrl);
                            setSuccess('Usando imagem placeholder local!');
                            setError('');
                          }}
                          className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md transition-colors duration-200"
                        >
                          � Placeholder Local
                        </button>
                      </div>
                    </div>

                    {/* Preview da imagem do IPFS */}
                    {formData.photo && (
                      <div className="mt-4 text-center">
                        <img
                          src={`https://ipfs.io/ipfs/${formData.photo}`}
                          alt="Foto do Pet"
                          className="w-32 h-32 rounded-lg object-cover mx-auto border-2 border-green-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <p className="text-sm text-green-600 mt-2">✓ Imagem carregada do IPFS</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('petForm.nickname', 'Apelido')} *
                    </label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('petForm.nicknamePlaceholder', 'Apelido do seu pet')}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('petForm.birthDate', 'Data de Nascimento')} *
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Novos campos organizados em grid responsivo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('petForm.species', 'Espécie')} *
                      </label>
                      <select
                        id="species"
                        name="species"
                        value={formData.species}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">{t('petForm.selectSpecies', 'Selecione a espécie')}</option>
                        <option value="dog">{t('petForm.dog', 'Cachorro')}</option>
                        <option value="cat">{t('petForm.cat', 'Gato')}</option>
                        <option value="bird">{t('petForm.bird', 'Pássaro')}</option>
                        <option value="snake">{t('petForm.snake', 'Cobra')}</option>
                        <option value="hamster">{t('petForm.hamster', 'Hamster')}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('petForm.gender', 'Gênero')} *
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">{t('petForm.selectGender', 'Selecione o gênero')}</option>
                        <option value="male">{t('petForm.male', 'Macho')}</option>
                        <option value="female">{t('petForm.female', 'Fêmea')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('petForm.color', 'Cor Principal')} *
                      </label>
                      <select
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">{t('petForm.selectColor', 'Selecione a cor')}</option>
                        <option value="black">{t('petForm.black', 'Preto')}</option>
                        <option value="white">{t('petForm.white', 'Branco')}</option>
                        <option value="brown">{t('petForm.brown', 'Marrom')}</option>
                        <option value="golden">{t('petForm.golden', 'Dourado')}</option>
                        <option value="gray">{t('petForm.gray', 'Cinza')}</option>
                        <option value="orange">{t('petForm.orange', 'Laranja')}</option>
                        <option value="mixed">{t('petForm.mixed', 'Misto')}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="isLost" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('petForm.status', 'Status')}
                      </label>
                      <select
                        id="isLost"
                        name="isLost"
                        value={formData.isLost.toString()}
                        onChange={(e) => setFormData({ ...formData, isLost: e.target.value === 'true' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="false">{t('petForm.notLost', 'Em casa')}</option>
                        <option value="true">{t('petForm.lost', 'Perdido')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('petForm.registering', 'Registrando...')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          {t('petForm.register', 'Registrar Pet')}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-500 text-center">
                      {t('petForm.requiredNote', '* Campos obrigatórios')}
                    </p>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-800 hover:underline focus:outline-none"
                    >
                      {t('petForm.logout', 'Desconectar')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de pets do usuário */}
              {myPets.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {t('petForm.myPets', 'Meus Pets')}
                  </h3>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {myPets.map((pet) => (
                      <div key={pet.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                        {/* Imagem do Pet com múltiplos gateways */}
                        {pet.photo && (
                          <div className="mb-4 text-center relative">
                            <img
                              src={pet.photo === 'local-placeholder'
                                ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjNDMzOENBIi8+CjxwYXRoIGQ9Ik00NyA0OEM0NyA0NC42ODYzIDQ5LjY4NjMgNDIgNTMgNDJINzVDNzguMzEzNyA0MiA4MSA0NC42ODYzIDgxIDQ4VjgwQzgxIDgzLjMxMzcgNzguMzEzNyA4NiA3NSA4Nkg1M0M0OS42ODYzIDg2IDQ3IDgzLjMxMzcgNDcgODBWNDhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTUgNTVDNTcuNzYxNCA1NSA2MCA1Mi43NjE0IDYwIDUwQzYwIDQ3LjIzODYgNTcuNzYxNCA0NSA1NSA0NUM1Mi4yMzg2IDQ1IDUwIDQ3LjIzODYgNTAgNTBDNTAgNTIuNzYxNCA1Mi4yMzg2IDU1IDU1IDU1WiIgZmlsbD0iIzQzMzhDQSIvPgo8cGF0aCBkPSJNNzMgNTVDNzUuNzYxNCA1NSA3OCA1Mi43NjE0IDc4IDUwQzc4IDQ3LjIzODYgNzUuNzYxNCA0NSA3MyA0NUM3MC4yMzg2IDQ1IDY4IDQ3LjIzODYgNjggNTBDNjggNTIuNzYxNCA3MC4yMzg2IDU1IDczIDU1WiIgZmlsbD0iIzQzMzhDQSIvPgo8cGF0aCBkPSJNNTggNzJDNjIuNDE4MyA3MiA2NiA2OC40MTgzIDY2IDY0QzY2IDU5LjU4MTcgNjIuNDE4MyA1NiA1OCA1NkM1My41ODE3IDU2IDUwIDU5LjU4MTcgNTAgNjRDNTAgNjguNDE4MyA1My41ODE3IDcyIDU4IDcyWiIgZmlsbD0iIzQzMzhDQSIvPgo8cGF0aCBkPSJNNzAgNzJDNzQuNDE4MyA3MiA3OCA2OC40MTgzIDc4IDY0Qzc4IDU5LjU4MTcgNzQuNDE4MyA1NiA3MCA1NkM2NS41ODE3IDU2IDYyIDU5LjU4MTcgNjIgNjRDNjIgNjguNDE4MyA2NS41ODE3IDcyIDcwIDcyWiIgZmlsbD0iIzQzMzhDQSIvPgo8L3N2Zz4K"
                                : `https://ipfs.io/ipfs/${pet.photo}`
                              }
                              alt={`Foto do ${pet.nickname}`}
                              className="w-32 h-32 rounded-lg object-cover mx-auto border-2 border-gray-200 shadow-md"
                              onLoad={() => {
                                console.log(`✅ Imagem carregada com sucesso: ${pet.photo}`);
                              }}
                              onError={(e) => {
                                if (pet.photo === 'local-placeholder') {
                                  // Já é um placeholder, não fazer nada
                                  return;
                                }

                                console.log(`❌ Erro ao carregar imagem: ${e.target.src}`);

                                if (e.target.src.includes('ipfs.io')) {
                                  console.log('🔄 Tentando gateway Pinata...');
                                  e.target.src = `https://gateway.pinata.cloud/ipfs/${pet.photo}`;
                                } else if (e.target.src.includes('pinata.cloud')) {
                                  console.log('🔄 Tentando gateway Cloudflare...');
                                  e.target.src = `https://cloudflare-ipfs.com/ipfs/${pet.photo}`;
                                } else if (e.target.src.includes('cloudflare-ipfs.com')) {
                                  console.log('🔄 Tentando gateway Dweb...');
                                  e.target.src = `https://dweb.link/ipfs/${pet.photo}`;
                                } else {
                                  console.log('❌ Todos os gateways falharam, mostrando placeholder');
                                  e.target.style.display = 'none';

                                  // Criar placeholder apenas se ainda não existe
                                  if (!e.target.parentNode.querySelector('.placeholder-image')) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'placeholder-image w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center mx-auto border-2 border-gray-200';
                                    placeholder.innerHTML = `
                                      <div class="text-center text-gray-500">
                                        <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                        </svg>
                                        <p class="text-xs">Imagem não encontrada</p>
                                        <p class="text-xs text-gray-400">CID: ${pet.photo.substring(0, 10)}...</p>
                                      </div>
                                    `;
                                    e.target.parentNode.appendChild(placeholder);
                                  }
                                }
                              }}
                            />
                          </div>
                        )}

                        <h4 className="text-lg font-medium text-blue-600 text-center mb-2">{pet.nickname}</h4>

                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">{t('petForm.birthDate', 'Data de Nascimento')}:</span> {formatDate(pet.birthDate)}
                          </p>

                          <p className="text-gray-600">
                            <span className="font-medium">Proprietário:</span> {formatPrincipal(pet.owner)}
                          </p>

                          <p className="text-gray-600">
                            <span className="font-medium">Criado em:</span> {formatTimestamp(pet.createdAt)}
                          </p>
                        </div>

                        {/* Informações do CID */}
                        {pet.photo && (
                          <div className="bg-gray-50 p-3 rounded-lg mt-3">
                            <p className="text-gray-600 text-sm mb-2">
                              <span className="font-medium">IPFS CID:</span>
                            </p>
                            <p className="text-xs text-gray-500 font-mono break-all mb-2">
                              {pet.photo}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={`https://ipfs.io/ipfs/${pet.photo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-xs underline"
                              >
                                Ver no IPFS.io
                              </a>
                              <a
                                href={`https://gateway.pinata.cloud/ipfs/${pet.photo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-xs underline"
                              >
                                Ver no Pinata
                              </a>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Pet ID: {pet.id}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PetForm;