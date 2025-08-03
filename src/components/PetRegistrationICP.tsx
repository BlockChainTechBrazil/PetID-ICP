import { generatePetHash } from '../context/ipfsHashUtil';
import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { usePetIDContractICP } from '../hooks/usePetIDContractICP';
import { PetRegistration as PetRegistrationData } from '../declarations/petid_backend/petid_backend.did.d';
import './PetRegistration.css';

const PetRegistrationICP = () => {
  const { t } = useTranslation();
  const { isAuthenticated, principal } = useAuth();
  const { registerPet, loading, error } = usePetIDContractICP(isAuthenticated, principal);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    birthDate: '',
  });

  const [registrationResult, setRegistrationResult] = useState<{ success: boolean; petId?: bigint; error?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Escutar mudanças no estado de autenticação
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Estado de autenticação mudou - forçando atualização');
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);

  // Log do estado atual para debug
  useEffect(() => {
    console.log('PetRegistrationICP - Estado atual:', {
      isAuthenticated,
      hasPrincipal: !!principal,
      principal: principal?.toString()
    });
  }, [isAuthenticated, principal, forceUpdate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated || !principal) {
      alert(t('petRegistration.messages.connectWallet'));
      return;
    }

    if (!formData.name.trim() || !formData.species.trim()) {
      alert('Nome e espécie são obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setRegistrationResult(null);

    try {
      // Gera um hash único dos dados do pet (simulando um hash de conteúdo IPFS)
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        birthDate: formData.birthDate,
        owner: principal.toString()
      };

      const ipfsHash = await generatePetHash(petData);

      // Converte a data para timestamp em nanosegundos (formato esperado pelo Motoko)
      const birthDateTimestamp = formData.birthDate
        ? BigInt(new Date(formData.birthDate).getTime() * 1000000)
        : BigInt(0);

      const petRegistrationData: PetRegistrationData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        birthDate: birthDateTimestamp,
        ipfsHash: ipfsHash
      };

      const result = await registerPet(petRegistrationData);
      setRegistrationResult(result);

      if (result.success) {
        // Limpar formulário após sucesso
        setFormData({
          name: '',
          species: '',
          breed: '',
          birthDate: '',
        });
      }
    } catch (err) {
      console.error('Erro ao registrar pet:', err);
      setRegistrationResult({
        success: false,
        error: 'Erro inesperado durante o registro'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pet-registration">
      <div className="registration-header">
        <h2>{t('petRegistration.title')}</h2>
        <p>{t('petRegistration.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="name">
            {t('petRegistration.form.petName')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={t('petRegistration.form.placeholders.petName')}
            required
            disabled={isSubmitting || loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="species">
            {t('petRegistration.form.petSpecies')} *
          </label>
          <select
            id="species"
            name="species"
            value={formData.species}
            onChange={handleInputChange}
            required
            disabled={isSubmitting || loading}
          >
            <option value="">{t('petRegistration.form.selectSpecies')}</option>
            <option value="dog">{t('petRegistration.form.species.dog')}</option>
            <option value="cat">{t('petRegistration.form.species.cat')}</option>
            <option value="bird">{t('petRegistration.form.species.bird')}</option>
            <option value="fish">{t('petRegistration.form.species.fish')}</option>
            <option value="rabbit">{t('petRegistration.form.species.rabbit')}</option>
            <option value="other">{t('petRegistration.form.species.other')}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="breed">
            {t('petRegistration.form.petBreed')}
          </label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder={t('petRegistration.form.placeholders.petBreed')}
            disabled={isSubmitting || loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">
            {t('petRegistration.form.birthDate')}
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            disabled={isSubmitting || loading}
          />
        </div>

        <button
          type="submit"
          className={`submit-button ${isSubmitting || loading ? 'loading' : ''}`}
          disabled={!isAuthenticated || isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            <>
              <div className="spinner"></div>
              {t('petRegistration.form.registeringButton')}
            </>
          ) : (
            t('petRegistration.form.registerButton')
          )}
        </button>

        {!isAuthenticated && (
          <p className="connection-warning">
            {t('petRegistration.messages.connectWallet')}
          </p>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {registrationResult && (
          <div className={`result-message ${registrationResult.success ? 'success' : 'error'}`}>
            {registrationResult.success ? (
              <div>
                <h3>{t('petRegistration.success.title')}</h3>
                <p>{t('petRegistration.success.message')}</p>
                <p><strong>Pet ID:</strong> {registrationResult.petId?.toString()}</p>
                <p><strong>Principal:</strong> {principal?.toString()}</p>
              </div>
            ) : (
              <div>
                <h3>{t('petRegistration.error.title')}</h3>
                <p>{registrationResult.error || t('petRegistration.error.generic')}</p>
              </div>
            )}
          </div>
        )}
      </form>

      <div className="registration-info">
        <h3>{t('petRegistration.info.title')}</h3>
        <ul>
          <li>{t('petRegistration.info.blockchain')}</li>
          <li>{t('petRegistration.info.immutable')}</li>
          <li>{t('petRegistration.info.ownership')}</li>
          <li>{t('petRegistration.info.transfer')}</li>
        </ul>
      </div>
    </div>
  );
};

export default PetRegistrationICP;
