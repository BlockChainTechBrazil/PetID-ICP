import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PetID_backend, createActor } from 'declarations/PetID_backend';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';

const PetForm = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [authenticatedActor, setAuthenticatedActor] = useState(null);
  const [formData, setFormData] = useState({
    photo: '', // CID da imagem no IPFS
    nickname: '',
    birthDate: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({}); // Para controlar loading das imagens dos pets
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myPets, setMyPets] = useState([]);

  // Inicializar o AuthClient
  useEffect(() => {
    // Debug: Verificar variáveis de ambiente
    console.log('🔍 DEBUG: Verificando variáveis de ambiente...');
    console.log('🔑 REACT_APP_PINATA_JWT:', import.meta.env.REACT_APP_PINATA_JWT ? 'PRESENTE' : 'AUSENTE');
    console.log('🌍 Todas as variáveis REACT_APP:', Object.keys(import.meta.env).filter(key => key.startsWith('REACT_APP')));
    console.log('🔧 import.meta.env completo:', import.meta.env);
    
    const initAuth = async () => {
      const client = await AuthClient.create();
      const authenticated = await client.isAuthenticated();

      setAuthClient(client);
      setIsAuthenticated(authenticated);

      if (authenticated) {
        await createAuthenticatedActor(client);
        loadPets();
      }
    };

    initAuth();
  }, []);

  // Criar ator autenticado
  const createAuthenticatedActor = async (client) => {
    const identity = client.getIdentity();
    const agent = new HttpAgent({
      identity,
      host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943',
    });

    if (process.env.DFX_NETWORK !== 'ic') {
      await agent.fetchRootKey();
    }

    const actor = createActor(backendCanisterId, {
      agent,
    });

    setAuthenticatedActor(actor);
  };

  // Função para carregar pets do usuário
  const loadPets = async () => {
    try {
      const actor = authenticatedActor || PetID_backend;
      const result = await actor.getMyPets();
      if ('ok' in result) {
        setMyPets(result.ok);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
    }
  };

  // UseEffect para atualizar pets quando o ator autenticado muda
  useEffect(() => {
    if (isAuthenticated && authenticatedActor) {
      loadPets();
    }
  }, [authenticatedActor]);

  // Função para login com Internet Identity
  const handleLogin = async () => {
    setIsLoading(true);

    const identityProvider = process.env.DFX_NETWORK === 'ic'
      ? 'https://identity.ic0.app/#authorize'
      : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`;

    await authClient?.login({
      identityProvider,
      onSuccess: async () => {
        setIsAuthenticated(true);
        await createAuthenticatedActor(authClient);
        loadPets();
        setIsLoading(false);
      },
      onError: (err) => {
        console.error('Login failed:', err);
        setError('Falha ao fazer login. Tente novamente.');
        setIsLoading(false);
      },
    });
  };

  // Função para logout
  const handleLogout = async () => {
    await authClient?.logout();
    setIsAuthenticated(false);
    setAuthenticatedActor(null);
    setMyPets([]);
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
    
    const jwtToken = import.meta.env.REACT_APP_PINATA_JWT;
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
      // Enviar dados para o backend usando o ator autenticado
      const actor = authenticatedActor || PetID_backend;
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
        setError(result.err);
      }
    } catch (err) {
      console.error('Error creating pet:', err);
      setError('Ocorreu um erro ao registrar o pet. Tente novamente.');
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
    <section className="py-12 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('petForm.title', 'Registre seu Pet')}
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-slate-400">
              {t('petForm.description', 'Registre seu animal de estimação na blockchain do Internet Computer')}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="mb-6 text-gray-600 dark:text-slate-400">
                {t('petForm.loginPrompt', 'Para registrar seu pet, é necessário conectar-se com sua Internet Identity')}
              </p>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-500 dark:bg-indigo-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300/50"
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
            </div>
          ) : (
            <>
              {/* Formulário para usuários autenticados */}
              <div className="bg-gray-50 dark:bg-slate-800/60 rounded-lg shadow-sm p-6 mb-8 border border-transparent dark:border-slate-700">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-md">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-md">
                      {success}
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      {t('petForm.name', 'Nome')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60"
                      placeholder={t('petForm.namePlaceholder', 'Nome do seu pet')}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      {t('petForm.nickname', 'Apelido')}
                    </label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60"
                      placeholder={t('petForm.nicknamePlaceholder', 'Apelido do seu pet (opcional)')}
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      {t('petForm.birthDate', 'Data de Nascimento')} *
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-500 dark:bg-indigo-600 text-white font-medium rounded-full shadow-md hover:bg-blue-600 dark:hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('petForm.registering', 'Registrando...')}
                        </span>
                      ) : (
                        t('petForm.register', 'Registrar Pet')
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:underline focus:outline-none"
                    >
                      {t('petForm.logout', 'Desconectar')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de pets do usuário */}
              {myPets.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    {t('petForm.myPets', 'Meus Pets')}
                  </h3>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {myPets.map((pet) => (
                      <div key={pet.id} className="bg-white dark:bg-slate-800/60 rounded-lg shadow-md p-4 border border-gray-200 dark:border-slate-700">
                        <h4 className="text-lg font-medium text-blue-600 dark:text-indigo-400">{pet.name}</h4>
                        {pet.nickname && (
                          <p className="text-gray-600 dark:text-slate-300 text-sm">
                            <span className="font-medium">{t('petForm.nickname', 'Apelido')}:</span> {pet.nickname}
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-slate-300 text-sm">
                          <span className="font-medium">{t('petForm.birthDate', 'Data de Nascimento')}:</span> {formatDate(pet.birthDate)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                          ID: {pet.id}
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
