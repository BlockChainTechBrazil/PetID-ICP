import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { usePetIDContractICP } from '../hooks/usePetIDContractICP';
import { Pet } from '../declarations/petid_backend/petid_backend.did.d';

interface MyPetNFTsICPProps {
  onPetSelect?: (pet: Pet) => void;
}

const MyPetNFTsICP: React.FC<MyPetNFTsICPProps> = ({ onPetSelect }) => {
  const { t } = useTranslation();
  const { isAuthenticated, principal } = useAuth();
  const { getOwnerPets, loading } = usePetIDContractICP(isAuthenticated, principal);

  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && principal) {
      loadPets();
    } else {
      setPets([]);
    }
  }, [isAuthenticated, principal]);

  const loadPets = async () => {
    if (!principal) return;

    setIsLoading(true);
    setError(null);

    try {
      const userPets = await getOwnerPets(principal);
      setPets(userPets);
    } catch (err) {
      console.error('Erro ao carregar pets:', err);
      setError('Erro ao carregar seus pets');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: bigint): string => {
    if (timestamp === BigInt(0)) return 'Não informado';

    // Converte de nanosegundos para millisegundos
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('pt-BR');
  };

  const formatPrincipal = (principal: string): string => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="my-pets-container">
        <div className="not-connected">
          <h3>{t('myPets.notConnected.title')}</h3>
          <p>{t('myPets.notConnected.message')}</p>
        </div>
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div className="my-pets-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('myPets.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-pets-container">
        <div className="error-container">
          <h3>{t('myPets.error.title')}</h3>
          <p>{error}</p>
          <button onClick={loadPets} className="retry-button">
            {t('myPets.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="my-pets-container">
        <div className="no-pets">
          <h3>{t('myPets.noPets.title')}</h3>
          <p>{t('myPets.noPets.message')}</p>
          <div className="owner-info">
            <p><strong>Principal:</strong> {formatPrincipal(principal?.toString() || '')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-pets-container">
      <div className="pets-header">
        <h2>
          {t('myPets.title')} ({pets.length})
        </h2>
        <button onClick={loadPets} className="refresh-button" disabled={isLoading}>
          🔄 {t('myPets.refresh')}
        </button>
      </div>

      <div className="owner-info">
        <p><strong>Principal:</strong> {formatPrincipal(principal?.toString() || '')}</p>
      </div>

      <div className="pets-grid">
        {pets.map((pet) => (
          <div key={pet.id.toString()} className="pet-card">
            <div className="pet-header">
              <h3>{pet.name}</h3>
              <span className="pet-id">ID: {pet.id.toString()}</span>
            </div>

            <div className="pet-info">
              <div className="info-row">
                <span className="label">{t('petCard.species')}:</span>
                <span className="value">{pet.species}</span>
              </div>

              {pet.breed && (
                <div className="info-row">
                  <span className="label">{t('petCard.breed')}:</span>
                  <span className="value">{pet.breed}</span>
                </div>
              )}

              <div className="info-row">
                <span className="label">{t('petCard.birthDate')}:</span>
                <span className="value">{formatDate(pet.birthDate)}</span>
              </div>

              <div className="info-row">
                <span className="label">{t('petCard.registered')}:</span>
                <span className="value">{formatDate(pet.registrationDate)}</span>
              </div>

              {pet.ipfsHash && (
                <div className="info-row">
                  <span className="label">IPFS:</span>
                  <span className="value hash">{pet.ipfsHash.slice(0, 10)}...</span>
                </div>
              )}
            </div>

            <div className="pet-actions">
              {onPetSelect && (
                <button
                  onClick={() => onPetSelect(pet)}
                  className="select-button"
                >
                  {t('petCard.select')}
                </button>
              )}

              <button
                onClick={() => window.open(`https://ipfs.io/ipfs/${pet.ipfsHash}`, '_blank')}
                className="view-button"
                disabled={!pet.ipfsHash}
              >
                {t('petCard.viewData')}
              </button>
            </div>

            <div className="pet-status">
              <span className={`status-indicator ${pet.isRegistered ? 'registered' : 'unregistered'}`}>
                {pet.isRegistered ? t('petCard.status.registered') : t('petCard.status.unregistered')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPetNFTsICP;
