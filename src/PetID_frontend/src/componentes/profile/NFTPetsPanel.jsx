import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useTranslation } from 'react-i18next';
import { GiPawPrint } from 'react-icons/gi';
import { FiFileText, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import petidLogo from '../../assets/logo/logo.jpg';
import ICPImage from '../ICPImage';

const gateways = [
  // ✅ MIGRAÇÃO: URLs da ICP ao invés de IPFS gateways
  (assetId) => `/api/assets/${assetId}`, // URL local para desenvolvimento
  (assetId) => `${window.location.origin}/api/assets/${assetId}`, // URL completa
];

// Estilos CSS para funcionalidades DIP721/NFT
const nftStyles = `
  .nft-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .dip721-info {
    display: flex;
    gap: 15px;
  }
  
  .info-badge {
    background: #f0f4f8;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  
  .info-label {
    font-size: 12px;
    color: #4a5568;
    margin-bottom: 2px;
  }
  
  .info-value {
    font-weight: 600;
    color: #1e293b;
  }
  
  .nft-metadata p {
    margin: 4px 0;
    font-size: 14px;
  }
  
  .nft-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  
  .btn-view-metadata, .btn-transfer {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .btn-view-metadata {
    background: #3b82f6;
    color: white;
  }
  
  .btn-view-metadata:hover {
    background: #2563eb;
  }
  
  .btn-transfer {
    background: #10b981;
    color: white;
  }
  
  .btn-transfer:hover {
    background: #059669;
  }
  
  .transfer-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .transfer-modal {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 400px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  }
  
  .modal-header {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1e293b;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
  
  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .form-input.readonly {
    background: #f9fafb;
    color: #6b7280;
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .btn-cancel {
    padding: 8px 16px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .btn-cancel:hover {
    background: #4b5563;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px;
    color: #6b7280;
  }
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = nftStyles;
  document.head.appendChild(styleSheet);
}

const NFTPetsPanel = () => {
  const { isAuthenticated, authClient } = useAuth();
  const { t, i18n } = useTranslation();
  
  // Estados principais
  const [actor, setActor] = useState(null);
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Estados para formulário
  const [formData, setFormData] = useState({
    photo: '',
    nickname: '',
    birthDate: '',
    species: '',
    gender: '',
    color: '',
    isLost: false,
  });
  
  // Estados para DIP721
  const [nftBalance, setNftBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [supportedInterfaces, setSupportedInterfaces] = useState([]);
  
  // Estados para transfer de NFTs
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTokenId, setTransferTokenId] = useState('');
  const [transferToAddress, setTransferToAddress] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const initializedRef = useRef(false);

  // Create actor when authenticated
  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated || !authClient || initializedRef.current) return;
      initializedRef.current = true;
      try {
        const identity = authClient.getIdentity();
        const network = import.meta.env.DFX_NETWORK || 'local';
        const host = network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943';
        const agent = new HttpAgent({ identity, host });
        if (network !== 'ic') {
          try { await agent.fetchRootKey(); } catch { }
        }
        const a = await createActor(backendCanisterId, { agent });
        setActor(a);
      } catch (e) {
        console.error('[NFTPetsPanel] actor error', e);
        setError('Erro ao inicializar ator');
      }
    };
    init();
  }, [isAuthenticated, authClient]);

  // ✅ FUNÇÃO AUXILIAR: Upload para ICP Asset Storage
  const uploadToICP = async (file) => {
    if (!file) return null;

    try {
      setUploading(true);
      console.log('📤 Enviando arquivo para ICP Asset Storage...');

      // Converter arquivo para Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const uploadRequest = {
        filename: file.name,
        contentType: file.type,
        data: fileData
      };

      const result = await actor.uploadAsset(uploadRequest);
      
      if ('ok' in result) {
        console.log('✅ Upload para ICP realizado com sucesso! Asset ID:', result.ok);
        return result.ok; // Retorna o asset ID
      } else if ('err' in result) {
        throw new Error(`ICP upload error: ${result.err}`);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao fazer upload para ICP:', error);
      setError('Erro ao fazer upload para ICP');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ✅ FUNÇÃO AUXILIAR: Upload automático quando arquivo é selecionado
  const autoUpload = useCallback(async (file) => {
    if (!file || !actor) return;
    
    try {
      const assetId = await uploadToICP(file);
      if (assetId) {
        setFormData(prev => ({ ...prev, photo: assetId }));
        console.log('✅ Asset ID salvo no formData:', assetId);
      }
    } catch (e) {
      console.error('❌ Erro no upload automático:', e);
    }
  }, [actor]);

  // Função para obter URL da imagem ICP para uso em HTML estático
  const getICPImageURL = async (assetId) => {
    try {
      if (!actor || !assetId) return null;
      
      const result = await actor.getAssetData(assetId);
      if ('ok' in result) {
        const blob = new Blob([result.ok]);
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (e) {
      console.error('Error getting ICP image URL:', e);
      return null;
    }
  };

  // Carregar pets do usuário
  const loadPets = async () => {
    setLoadingPets(true);
    try {
      const cachedPets = localStorage.getItem('userPets');
      if (cachedPets) {
        const parsedPets = JSON.parse(cachedPets);
        setPets(parsedPets);
        console.log('✅ Pets carregados do localStorage cache:', parsedPets);
      }

      if (actor) {
        const res = await actor.getMyPets();
        if ('ok' in res) {
          const petsWithStringIds = res.ok.map(pet => ({
            ...pet,
            id: pet.id.toString(),
            createdAt: pet.createdAt ? pet.createdAt.toString() : pet.createdAt,
            updatedAt: pet.updatedAt ? pet.updatedAt.toString() : pet.updatedAt
          }));
          
          setPets(petsWithStringIds);
          localStorage.setItem('userPets', JSON.stringify(petsWithStringIds));
          console.log('✅ Pets NFT carregados do ICP (DIP721) e salvos no cache:', petsWithStringIds);
        }

        try {
          const balance = await getUserNFTBalance();
          setNftBalance(balance);
        } catch (e) {
          console.error('[NFTPetsPanel] error getting NFT balance:', e);
        }
      }
    } catch (e) {
      console.error('[NFTPetsPanel] error loading pets:', e);
      setError('Erro ao carregar pets');
    } finally {
      setLoadingPets(false);
    }
  };

  // Obter balance de NFTs do usuário
  const getUserNFTBalance = async () => {
    try {
      if (!actor) return 0;
      const identity = authClient.getIdentity();
      const userPrincipal = identity.getPrincipal();
      const balance = await actor.balanceOf(userPrincipal);
      return Number(balance);
    } catch (e) {
      console.error('[NFTPetsPanel] error getting NFT balance:', e);
      return 0;
    }
  };

  // Transferir NFT
  const transferNFT = async () => {
    if (!transferTokenId || !transferToAddress) {
      setError('Token ID and destination address are required');
      return;
    }

    setTransferLoading(true);
    setError('');
    
    try {
      if (!actor) throw new Error('Actor not ready');
      
      const toPrincipal = Principal.fromText(transferToAddress);
      const tokenId = BigInt(transferTokenId);
      
      const result = await actor.transfer(toPrincipal, tokenId);
      
      if ('ok' in result) {
        setSuccess(`Pet NFT #${transferTokenId} transferred successfully!`);
        setShowTransferModal(false);
        setTransferTokenId('');
        setTransferToAddress('');
        loadPets(); // Recarregar lista
      } else if ('err' in result) {
        setError(`Transfer failed: ${result.err}`);
      }
    } catch (e) {
      setError(`Transfer error: ${e.message}`);
      console.error('[NFTPetsPanel] transfer error:', e);
    } finally {
      setTransferLoading(false);
    }
  };

  // Manipuladores de eventos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
    
    // Upload automático para ICP
    autoUpload(file);
  };

  const onInputFileChange = (e) => handleFileSelect(e.target.files?.[0]);

  // Submeter formulário para criar novo pet NFT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !actor) {
      setError(t('loginPrompt', 'Você precisa estar logado para registrar pets.'));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Enviando dados do pet para criação de NFT:', formData);

      const petPayload = {
        photo: formData.photo,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
        species: formData.species,
        gender: formData.gender,
        color: formData.color,
        isLost: formData.isLost,
      };

      const result = await actor.mint(authClient.getIdentity().getPrincipal(), petPayload);
      console.log('🎯 Resposta do backend:', result);

      if ('ok' in result) {
        setSuccess(`Pet NFT criado com sucesso! Token ID: ${result.ok}`);
        setFormOpen(false);
        setFormData({
          photo: '',
          nickname: '',
          birthDate: '',
          species: '',
          gender: '',
          color: '',
          isLost: false,
        });
        setSelectedFile(null);
        setImagePreview('');
        loadPets();
      } else if ('err' in result) {
        setError(`Erro ao criar Pet NFT: ${result.err}`);
      }
    } catch (e) {
      setError(`Erro: ${e.message}`);
      console.error('[NFTPetsPanel] submit error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Carregar pets quando o actor estiver pronto
  useEffect(() => {
    if (actor) {
      loadPets();
    }
  }, [actor]);

  // Função para renderizar NFTs com informações DIP721
  const renderNFTs = () => {
    return pets.map((pet) => (
      <div key={pet.id} className="nft-card">
        <ICPImage 
          assetId={pet.photo} 
          altText={pet.nickname} 
          className="nft-image"
          actor={actor}
        />
        <div className="nft-details">
          <h3>{pet.nickname}</h3>
          <div className="nft-metadata">
            <p><strong>🆔 Token ID:</strong> {pet.id}</p>
            <p><strong>📊 {t('species')}:</strong> {pet.species}</p>
            <p><strong>⚧ {t('gender')}:</strong> {pet.gender}</p>
            <p><strong>🎨 {t('color')}:</strong> {pet.color}</p>
            <p><strong>🎂 {t('birthDate')}:</strong> {pet.birthDate}</p>
            <p><strong>⏰ Created:</strong> {pet.createdAt}</p>
          </div>
          <div className="nft-actions">
            <button 
              className="btn-transfer"
              onClick={() => {
                setTransferTokenId(pet.id);
                setShowTransferModal(true);
              }}
            >
              🔄 Transfer NFT
            </button>
          </div>
        </div>
      </div>
    ));
  };

  // Renderizar NFTs no painel com informações DIP721
  return (
    <div className="nft-panel">
      <div className="nft-header">
        <h2>{t('myNFTs')} - Pet RWA Collection</h2>
        <div className="dip721-info">
          <div className="info-badge">
            <span className="info-label">Your NFTs:</span>
            <span className="info-value">{nftBalance}</span>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <GiPawPrint style={{ marginRight: '8px' }} />
            {formOpen ? 'Cancelar' : 'Criar Pet NFT'}
          </button>
        </div>
      </div>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <div style={{ 
          padding: '12px', 
          background: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '12px', 
          background: '#d1fae5', 
          color: '#059669', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          ✅ {success}
        </div>
      )}

      {/* Formulário de criação */}
      {formOpen && (
        <div style={{ 
          background: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Criar Novo Pet NFT</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Foto do Pet:
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={onInputFileChange}
                style={{ marginBottom: '8px' }}
              />
              {uploading && <p>Enviando imagem para ICP...</p>}
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} 
                />
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Nome:
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Data de Nascimento:
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Espécie:
                </label>
                <input
                  type="text"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Gênero:
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">Selecionar</option>
                  <option value="male">Macho</option>
                  <option value="female">Fêmea</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Cor:
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isLost"
                    checked={formData.isLost}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  Pet está perdido
                </label>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: submitting ? '#ccc' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Criando NFT...' : 'Criar Pet NFT'}
              </button>
              
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de NFTs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {loadingPets ? (
          <div className="empty-state">Carregando pets...</div>
        ) : pets.length === 0 ? (
          <div className="empty-state">
            <GiPawPrint size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Você ainda não possui nenhum Pet NFT.</p>
            <p>Clique em "Criar Pet NFT" para começar!</p>
          </div>
        ) : (
          renderNFTs()
        )}
      </div>

      {/* Modal de Transfer */}
      {showTransferModal && (
        <div className="transfer-modal-overlay">
          <div className="transfer-modal">
            <div className="modal-header">
              Transfer Pet NFT #{transferTokenId}
            </div>
            
            <div className="form-group">
              <label>Token ID:</label>
              <input
                type="text"
                value={transferTokenId}
                readOnly
                className="form-input readonly"
              />
            </div>
            
            <div className="form-group">
              <label>Destination Address (Principal):</label>
              <input
                type="text"
                value={transferToAddress}
                onChange={(e) => setTransferToAddress(e.target.value)}
                placeholder="Enter recipient's Principal ID"
                className="form-input"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowTransferModal(false)}
                disabled={transferLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-transfer"
                onClick={transferNFT}
                disabled={transferLoading || !transferToAddress}
              >
                {transferLoading ? 'Transferring...' : 'Transfer NFT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTPetsPanel;