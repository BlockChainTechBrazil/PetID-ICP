import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PetID_backend } from 'declarations/PetID_backend';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { Actor, HttpAgent } from '@dfinity/agent';

const PetForm = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myPets, setMyPets] = useState([]);

  // Inicializar o AuthClient
  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      const authenticated = await client.isAuthenticated();
      
      setAuthClient(client);
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        loadPets();
      }
    };
    
    initAuth();
  }, []);

  // Função para carregar pets do usuário
  const loadPets = async () => {
    try {
      const result = await PetID_backend.getMyPets();
      if ('ok' in result) {
        setMyPets(result.ok);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
    }
  };

  // Função para login com Internet Identity
  const handleLogin = async () => {
    setIsLoading(true);
    
    const identityProvider = process.env.DFX_NETWORK === 'ic' 
      ? 'https://identity.ic0.app/#authorize'
      : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY || 'localhost:4943'}`;
    
    await authClient?.login({
      identityProvider,
      onSuccess: () => {
        setIsAuthenticated(true);
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

  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Resetar mensagens
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // Validações básicas
    if (!formData.name.trim()) {
      setError('O nome do pet é obrigatório.');
      setIsLoading(false);
      return;
    }
    
    if (!formData.birthDate) {
      setError('A data de nascimento é obrigatória.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Enviar dados para o backend
      const result = await PetID_backend.createPet({
        name: formData.name,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
      });
      
      if ('ok' in result) {
        // Sucesso ao registrar o pet
        setSuccess('Pet registrado com sucesso!');
        // Limpar o formulário
        setFormData({
          name: '',
          nickname: '',
          birthDate: '',
        });
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('petForm.name', 'Nome')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('petForm.namePlaceholder', 'Nome do seu pet')}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('petForm.nickname', 'Apelido')}
                    </label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('petForm.nicknamePlaceholder', 'Apelido do seu pet (opcional)')}
                    />
                  </div>
                  
                  <div className="mb-6">
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
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-500 text-white font-medium rounded-full shadow-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                        <h4 className="text-lg font-medium text-blue-600">{pet.name}</h4>
                        {pet.nickname && (
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">{t('petForm.nickname', 'Apelido')}:</span> {pet.nickname}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">{t('petForm.birthDate', 'Data de Nascimento')}:</span> {formatDate(pet.birthDate)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
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
