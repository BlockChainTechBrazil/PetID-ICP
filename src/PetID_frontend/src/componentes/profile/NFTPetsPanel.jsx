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
import { useTranslation } from 'react-i18next';
import { GiPawPrint } from 'react-icons/gi';
import { FiFileText, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import petidLogo from '../../assets/logo/logo.jpg';

const gateways = [
  (cid) => `https://gateway.pinata.cloud/ipfs/${cid}`,
  (cid) => `https://gateway.pinata.cloud/ipfs/${cid}`,
  (cid) => `https://cloudflare-ipfs.com/ipfs/${cid}`,
  (cid) => `https://dweb.link/ipfs/${cid}`,
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
    color: #64748b;
    margin-right: 6px;
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
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .transfer-modal {
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 400px;
    max-width: 90vw;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
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
  const [actor, setActor] = useState(null);
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false); // upload de imagem
  const [uploadProgress, setUploadProgress] = useState(null); // futuro: porcentagem (não suportado fetch simples)
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    photo: '',
    nickname: '',
    birthDate: '',
    species: '',
    gender: '',
    color: '',
    isLost: false,
  });
  // Estado para informações DIP721
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

  const loadPets = async () => {
    setLoadingPets(true);
    try {
      // Primeiro, tentar carregar do localStorage como fallback
      const cachedPets = localStorage.getItem('userPets');
      if (cachedPets) {
        const parsedPets = JSON.parse(cachedPets);
        setPets(parsedPets);
        console.log('✅ Pets carregados do localStorage cache:', parsedPets);
      }
      
      // Se temos actor, tentar carregar do backend usando DIP721
      if (actor) {
        const res = await actor.getMyPets();
        if ('ok' in res) {
          // Converter BigInts para strings antes de salvar
          const petsWithStringIds = res.ok.map(pet => ({
            ...pet,
            id: pet.id.toString(), // Converter BigInt para string
            createdAt: pet.createdAt ? pet.createdAt.toString() : pet.createdAt,
            updatedAt: pet.updatedAt ? pet.updatedAt.toString() : pet.updatedAt
          }));
          
          setPets(petsWithStringIds);
          // Salvar no localStorage para cache
          localStorage.setItem('userPets', JSON.stringify(petsWithStringIds));
          console.log('✅ Pets NFT carregados do ICP (DIP721) e salvos no cache:', petsWithStringIds);
        }

        // ✅ CARREGAR INFORMAÇÕES DIP721
        try {
          const balance = await getUserNFTBalance();
          setNftBalance(balance);
          
          const supply = await actor.totalSupply();
          setTotalSupply(Number(supply));
          
          const interfaces = await actor.supportedInterfaces();
          setSupportedInterfaces(interfaces);
        } catch (e) {
          console.error('[NFTPetsPanel] error loading DIP721 info:', e);
        }
      }
    } catch (e) {
      console.error('[NFTPetsPanel] load pets error', e);
      // Em caso de erro, tentar carregar do localStorage
      const cachedPets = localStorage.getItem('userPets');
      if (cachedPets) {
        const parsedPets = JSON.parse(cachedPets);
        setPets(parsedPets);
        console.log('💾 Usando pets do localStorage devido a erro:', parsedPets);
      }
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => { 
    loadPets(); 
  }, [actor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) { setError(t('petPanel.unsupportedType')); return; }
    if (file.size > 5 * 1024 * 1024) { setError(t('petPanel.max5mb')); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    // upload automático
    autoUpload(file);
  };

  const onInputFileChange = (e) => handleFileSelect(e.target.files?.[0]);

  const uploadToIPFS = async (file) => {
    const jwtToken = import.meta.env.REACT_APP_PINATA_JWT;
    if (!jwtToken) throw new Error('Config PINATA JWT ausente');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('pinataMetadata', JSON.stringify({ name: `pet-${Date.now()}` }));
    // Usando XMLHttpRequest para permitir progresso futuro
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.pinata.cloud/pinning/pinFileToIPFS');
      xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(pct);
        }
      };
      xhr.onerror = () => reject(new Error('Erro de rede no upload'));
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.IpfsHash);
          } else {
            reject(new Error('Falha upload IPFS: ' + xhr.status));
          }
        } catch (e) { reject(e); }
      };
      xhr.send(fd);
    });
  };

  const autoUpload = useCallback(async (file) => {
    setUploading(true); setUploadProgress(null); setError(''); setSuccess('');
    try {
      const cid = await uploadToIPFS(file);
      setFormData(f => ({ ...f, photo: cid }));
      setSuccess(t('petPanel.imgSent'));
    } catch (e) {
      setError(e.message || t('petPanel.invalidImage'));
      setFormData(f => ({ ...f, photo: '' }));
    } finally { setUploading(false); setUploadProgress(null); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(''); setSuccess('');
    try {
      if (!actor) throw new Error('Actor not ready');
      // Se há arquivo selecionado mas ainda não temos CID, faz upload agora
      if (selectedFile && !formData.photo) {
        await autoUpload(selectedFile);
      }
      if (!formData.photo) throw new Error(t('petPanel.invalidImage'));
      if (!formData.nickname || !formData.birthDate || !formData.species || !formData.gender || !formData.color) {
        throw new Error(t('petPanel.fillAll'));
      }
      
      // ✅ MIGRAÇÃO: Usar mint() DIP721 ao invés de createPet()
      const identity = authClient.getIdentity();
      const userPrincipal = identity.getPrincipal();
      
      const res = await actor.mint(userPrincipal, {
        photo: formData.photo,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
        species: formData.species,
        gender: formData.gender,
        color: formData.color,
        isLost: formData.isLost,
      });
      
      if ('ok' in res) {
        const tokenId = res.ok.toString();
        setSuccess(`${t('petPanel.petRegistered')} - NFT Token ID: ${tokenId}`);
        setFormData({ photo: '', nickname: '', birthDate: '', species: '', gender: '', color: '', isLost: false });
        setSelectedFile(null); setImagePreview('');
        loadPets();
        setFormOpen(false);
      } else if ('err' in res) { setError(res.err); }
    } catch (er) { setError(er.message); } finally { setSubmitting(false); }
  };

  const formatDate = (dateString) => {
    try { return new Date(dateString).toLocaleDateString(); } catch { return dateString; }
  };
  const formatTimestamp = (ts) => { try { return new Date(Number(ts) / 1_000_000).toLocaleString(); } catch { return '—'; } };
  const formatPrincipal = (p) => { const s = p.toString(); return s.slice(0, 6) + '...' + s.slice(-6); };

  // ✅ NOVA FUNCIONALIDADE DIP721: Buscar metadata do NFT
  const getTokenMetadata = async (tokenId) => {
    try {
      if (!actor) return null;
      const res = await actor.tokenMetadata(BigInt(tokenId));
      if ('ok' in res) {
        return res.ok;
      }
      return null;
    } catch (e) {
      console.error('[NFTPetsPanel] error getting token metadata:', e);
      return null;
    }
  };

  // ✅ NOVA FUNCIONALIDADE DIP721: Verificar saldo de NFTs do usuário
  const getUserNFTBalance = async () => {
    try {
      if (!actor || !authClient) return 0;
      const identity = authClient.getIdentity();
      const userPrincipal = identity.getPrincipal();
      const balance = await actor.balanceOf(userPrincipal);
      return Number(balance);
    } catch (e) {
      console.error('[NFTPetsPanel] error getting NFT balance:', e);
      return 0;
    }
  };

  // ✅ NOVA FUNCIONALIDADE DIP721: Transferir NFT
  const transferNFT = async () => {
    if (!transferTokenId || !transferToAddress) {
      setError('Token ID and destination address are required');
      return;
    }

    setTransferLoading(true);
    setError('');
    
    try {
      if (!actor) throw new Error('Actor not ready');
      
      // Converter endereço string para Principal
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

  // ✅ NOVA FUNCIONALIDADE DIP721: Aprovar operador
  const approveOperator = async (tokenId, operatorAddress) => {
    try {
      if (!actor) throw new Error('Actor not ready');
      
      const operator = Principal.fromText(operatorAddress);
      const result = await actor.approve(operator, BigInt(tokenId));
      
      if ('ok' in result) {
        setSuccess(`Operator approved for token #${tokenId}`);
      } else if ('err' in result) {
        setError(`Approval failed: ${result.err}`);
      }
    } catch (e) {
      setError(`Approval error: ${e.message}`);
      console.error('[NFTPetsPanel] approve error:', e);
    }
  };

  // Função para gerar cartão de identidade digital do pet
  const generatePetDocument = (pet) => {
    // Criar um novo documento HTML para impressão
    const printWindow = window.open('', '_blank');
    const doc = printWindow.document;
    
    // Obter idioma atual do i18n
    const currentLanguage = i18n.language;
    const isEnglish = currentLanguage.startsWith('en');
    
    // Gerar hash fictício simplificado
    const generateSimpleHash = () => {
      const chars = '0123456789abcdef';
      let hash = '';
      for (let i = 0; i < 8; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    // Template HTML do cartão de identidade
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isEnglish ? 'en' : 'pt-BR'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PetID - ${pet.nickname}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f5f7fa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .pet-card {
            width: 420px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.12);
            overflow: hidden;
            position: relative;
            border: 1px solid rgba(0,0,0,0.04);
          }
          
          .card-header {
            position: relative;
            padding: 24px 24px 16px;
            background: #ffffff;
            border-bottom: 1px solid #f1f3f4;
          }
          
          .pet-name {
            font-size: 22px;
            font-weight: 600;
            color: #1a1a1a;
            text-align: left;
            letter-spacing: -0.02em;
          }
          
          .card-content {
            padding: 24px;
            display: grid;
            grid-template-columns: 100px 1fr;
            gap: 20px;
            align-items: start;
          }
          
          .pet-photo-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
          }
          
          .pet-photo {
            width: 100px;
            height: 100px;
            border-radius: 12px;
            object-fit: cover;
            border: 2px solid #e8eaed;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5f6368;
            font-size: 12px;
            text-align: center;
            font-weight: 400;
            position: relative;
          }
          
          .status-icon {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 10;
          }
          
          .status-home {
            background: #4caf50;
            color: white;
          }
          
          .status-lost {
            background: #ff9800;
            color: white;
          }
          
          .pet-id {
            margin-top: 8px;
            background: #f1f3f4;
            color: #5f6368;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            letter-spacing: 0.5px;
          }
          
          .pet-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          
          .info-box {
            background: #fafbfc;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e8eaed;
          }
          
          .info-label {
            font-size: 11px;
            color: #70757a;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 14px;
            color: #202124;
            font-weight: 500;
            line-height: 1.3;
          }
          
          .status-section {
            grid-column: 1 / -1;
            margin-top: 16px;
            background: #fafbfc;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e8eaed;
          }
          
          .status-label {
            font-size: 11px;
            color: #70757a;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
          }
          
          .status-hash {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 13px;
            color: #1565c0;
            background: #e3f2fd;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid #bbdefb;
            display: inline-block;
            letter-spacing: 1px;
          }
          
          .card-footer {
            background: #fafbfc;
            padding: 20px 24px;
            border-top: 1px solid #e8eaed;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          
          .petid-logo {
            font-size: 16px;
            font-weight: 600;
            color: #1565c0;
            display: flex;
            align-items: center;
            gap: 6px;
            letter-spacing: -0.02em;
          }
          
          .petid-logo img {
            width: 14px;
            height: 14px;
            opacity: 0.8;
            object-fit: contain;
          }
          
          .logo-badge {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          
          .footer-text {
            font-size: 11px;
            color: #70757a;
            line-height: 1.5;
          }
          
          .generation-date {
            font-weight: 500;
            color: #202124;
            margin-bottom: 2px;
          }
          
          .footer-description {
            opacity: 0.8;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .pet-card {
              box-shadow: none;
              border: 1px solid #e8eaed;
            }
          }
        </style>
      </head>
      <body>
        <div class="pet-card">
          <div class="card-header">
            <div class="pet-name">${pet.nickname}</div>
          </div>
          
          <div class="card-content">
            <div class="pet-photo-container">
              ${pet.photo ? 
                `<img src="${gateways[0](pet.photo)}" alt="${pet.nickname}" class="pet-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="pet-photo" style="display: none;">${isEnglish ? 'No photo' : 'Sem foto'}</div>` : 
                `<div class="pet-photo">${isEnglish ? 'No photo' : 'Sem foto'}</div>`
              }
              <div class="status-icon ${pet.isLost ? 'status-lost' : 'status-home'}">
                ${pet.isLost ? '❓' : '🏠'}
              </div>
              <div class="pet-id">ID ${pet.id}</div>
            </div>
            
            <div class="pet-info">
              <div class="info-box">
                <div class="info-label">${isEnglish ? 'Birth Date' : 'Nascimento'}</div>
                <div class="info-value">${formatDate(pet.birthDate)}</div>
              </div>
              
              <div class="info-box">
                <div class="info-label">${isEnglish ? 'Species' : 'Espécie'}</div>
                <div class="info-value">${t(`petForm.${pet.species}`, pet.species)}</div>
              </div>
              
              <div class="info-box">
                <div class="info-label">${isEnglish ? 'Gender' : 'Gênero'}</div>
                <div class="info-value">${t(`petForm.${pet.gender}`, pet.gender)}</div>
              </div>
              
              <div class="info-box">
                <div class="info-label">${isEnglish ? 'Color' : 'Cor'}</div>
                <div class="info-value">${t(`petForm.${pet.color}`, pet.color)}</div>
              </div>
            </div>
            
            <div class="status-section">
              <div class="status-label">${isEnglish ? 'Verification' : 'Verificação'}</div>
              <div class="status-hash">${generateSimpleHash()}</div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="logo-section">
              <div class="petid-logo">
                <img src="${petidLogo}" alt="PetID" style="width: 20px; height: 20px; opacity: 0.8;" />
                PetID
              </div>
              <div class="logo-badge">ID</div>
            </div>
            <div class="footer-text">
              <div class="generation-date">${isEnglish ? 'Issued on' : 'Emitido em'} ${new Date().toLocaleDateString(isEnglish ? 'en-US' : 'pt-BR')}</div>
              <div class="footer-description">${isEnglish ? 'Verified digital identity' : 'Identidade digital verificada'}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    doc.write(htmlContent);
    doc.close();
    
    // Auto-imprimir após 1 segundo para garantir que as imagens carreguem
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  // Função para renderizar NFTs com informações DIP721
  const renderNFTs = () => {
    return pets.map((pet) => (
      <div key={pet.id} className="nft-card">
        <img
          src={gateways[0](pet.photo)}
          alt={pet.nickname}
          className="nft-image"
        />
        <div className="nft-details">
          <h3>{pet.nickname}</h3>
          <div className="nft-metadata">
            <p><strong>🆔 Token ID:</strong> {pet.id}</p>
            <p><strong>📊 {t('species')}:</strong> {pet.species}</p>
            <p><strong>⚧ {t('gender')}:</strong> {pet.gender}</p>
            <p><strong>🎨 {t('color')}:</strong> {pet.color}</p>
            <p><strong>🎂 {t('birthDate')}:</strong> {pet.birthDate}</p>
            <p><strong>👤 {t('owner')}:</strong> {formatPrincipal(pet.owner)}</p>
            <p><strong>⏰ Created:</strong> {formatTimestamp(pet.createdAt)}</p>
          </div>
          <div className="nft-actions">
            <button 
              className="btn-view-metadata"
              onClick={() => getTokenMetadata(pet.id)}
            >
              🔍 View NFT Metadata
            </button>
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
          <div className="info-badge">
            <span className="info-label">Total Supply:</span>
            <span className="info-value">{totalSupply}</span>
          </div>
          <div className="info-badge">
            <span className="info-label">Standard:</span>
            <span className="info-value">{supportedInterfaces.join(', ') || 'DIP721'}</span>
          </div>
        </div>
      </div>
      <div className="nft-grid">
        {pets.length > 0 ? renderNFTs() : (
          <div className="empty-state">
            <p>No Pet NFTs found. Create your first Pet RWA!</p>
          </div>
        )}
      </div>

      {/* ✅ MODAL DE TRANSFERÊNCIA NFT */}
      {showTransferModal && (
        <div className="transfer-modal-overlay">
          <div className="transfer-modal">
            <div className="modal-header">
              <h3>🔄 Transfer Pet NFT</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTransferModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
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
                <label>Transfer to (Principal ID):</label>
                <input
                  type="text"
                  value={transferToAddress}
                  onChange={(e) => setTransferToAddress(e.target.value)}
                  placeholder="rdmx6-jaaaa-aaaaa-aaadq-cai"
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
        </div>
      )}
    </div>
  );
};

export default NFTPetsPanel;
