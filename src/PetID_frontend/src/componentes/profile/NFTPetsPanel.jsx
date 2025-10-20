import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Principal } from '@dfinity/principal';
import { useTranslation } from 'react-i18next';
import { GiPawPrint } from 'react-icons/gi';
import { FiFileText } from 'react-icons/fi';
import petidLogo from '../../assets/logo/logo.jpg';
import ICPImage from '../ICPImage';

// ✅ Removido: gateways IPFS desnecessários - agora usa ICPImage

// Estilos CSS para funcionalidades DIP721/NFT e layout escuro
const nftStyles = `
  .nft-panel {
    color: #e5e7eb; /* texto claro no tema escuro */
  }
  .nft-header h2 {
    color: #e5e7eb;
    font-size: 20px;
    font-weight: 600;
  }

  /* Card de pet (como na imagem 2) */
  .nft-card {
    background: radial-gradient(1200px 200px at -10% -20%, rgba(99,102,241,0.15), transparent),
                linear-gradient(180deg, #0f172a 0%, #0b1220 100%);
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 16px;
    padding: 18px 18px 20px 18px;
    display: grid;
  }

  /* 📱 MOBILE SAFE BUTTONS - Prevent accidental touches */
  .mobile-safe-btn {
    touch-action: manipulation !important;
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none !important;
    -webkit-user-select: none !important;
    user-select: none !important;
    pointer-events: auto !important;
    position: relative !important;
    z-index: 10 !important;
  }
  
  .mobile-safe-btn:active {
    transform: scale(0.95) !important;
    transition: transform 0.1s ease !important;
    grid-template-columns: 160px 1fr;
    gap: 16px;
    align-items: center;
    box-shadow: 0 14px 28px rgba(0,0,0,0.3);
    min-height: 220px;
    overflow: hidden;
    transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease;
  }
  .nft-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(0,0,0,0.35);
    border-color: rgba(148,163,184,0.28);
  }

  .nft-image {
    width: 160px;
    height: 160px;
    border-radius: 14px;
    object-fit: cover;
    background: #0f172a;
    border: 1px solid rgba(148,163,184,0.2);
  }

  .nft-details { display: flex; flex-direction: column; min-width: 0; gap: 10px; }
  .nft-titlebar { display:flex; align-items:center; justify-content: space-between; gap: 10px; }
  .nft-titlebar h3 { margin:0; color:#f3f4f6; font-size: 18px; font-weight: 700; letter-spacing: .2px; }
  .status-badge { display:inline-flex; align-items:center; gap:6px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border:1px solid rgba(255,255,255,0.18); }
  .status-home { background: rgba(16,185,129,0.15); color:#34d399; }
  .status-lost { background: rgba(245,158,11,0.15); color:#fbbf24; }

  .nft-left { display:flex; flex-direction: column; align-items: stretch; gap: 10px; }
  .nft-actions-under-image { display: grid; grid-template-columns: 1fr; gap: 8px; }

  .nft-metadata p {
    margin: 2px 0;
    font-size: 13px;
    color: #cbd5e1; /* cinza claro para legibilidade */
  }

  .nft-metadata strong {
    color: #93c5fd; /* azul claro para labels */
  }

  .nft-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 12px;
  }
  
  .dip721-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .info-badge {
    background: rgba(148,163,184,0.12);
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(148,163,184,0.24);
    color: #e5e7eb;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 38px;
  }
  
  .info-label {
    font-size: 12px;
    color: #c7d2fe;
    margin-bottom: 2px;
  }
  
  .info-value {
    font-weight: 700;
    color: #ffffff;
    font-size: 16px;
  }
  
  .nft-metadata p {
    margin: 4px 0;
    font-size: 14px;
  }
  
  .nft-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: auto; }

  .btn { 
    display: inline-flex; 
    align-items: center; 
    justify-content: center; 
    gap: 6px; 
    padding: 10px 16px; 
    border-radius: 10px; 
    border: 1px solid transparent; 
    font-size: 14px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: transform .06s ease, filter .15s ease; 
    width: 100%;
    box-sizing: border-box;
  }
  /* Evitar que o botão do cabeçalho expanda demais */
  .nft-header .btn { width: auto; padding: 10px 14px; }
  .btn:active { transform: translateY(1px); }
  .btn-primary { background: linear-gradient(135deg,#3b82f6,#6366f1); color: #fff; border-color: #4f46e5; }
  .btn-primary:hover { filter: brightness(1.05); }
  .btn-transfer { background: linear-gradient(135deg,#10b981,#059669); color: #fff; border-color: #059669; }
  .btn-transfer:hover { filter: brightness(1.05); }
  
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
    color: #94a3b8;
  }

  /* Responsividade */
  @media (max-width: 640px) {
    .nft-card { grid-template-columns: 1fr; padding: 14px; }
    .nft-image { width: 100%; height: 220px; }
    .nft-actions { grid-template-columns: 1fr; }
    .nft-actions-under-image { grid-template-columns: 1fr; }
  }
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = nftStyles;
  document.head.appendChild(styleSheet);
}

const NFTPetsPanel = () => {
  const { isAuthenticated, authClient, createBackendActor } = useAuth();
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

  // Formatar timestamp ICP (nanosegundos) em data legível
  const formatIcTimestamp = (value) => {
    try {
      if (!value && value !== 0) return '-';
      const ns = typeof value === 'bigint' ? value : BigInt(value);
      const ms = Number(ns / 1000000n);
      const locale = i18n.language?.startsWith('en') ? 'en-US' : (i18n.language?.startsWith('es') ? 'es-ES' : 'pt-BR');
      return new Date(ms).toLocaleString(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(value ?? '-');
    }
  };

  // Create actor when authenticated using shared context
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!isAuthenticated) {
        // Limpar actor se não está autenticado
        if (actor) {
          console.log('[NFTPetsPanel] Clearing actor due to authentication loss');
          setActor(null);
          setPets([]);
          initializedRef.current = false;
        }
        return;
      }
      
      if (initializedRef.current && actor) return; // Já inicializado
      
      initializedRef.current = true;
      try {
        const a = await createBackendActor();
        if (!mounted) return;
        if (a) {
          setActor(a);
          console.log('[NFTPetsPanel] Backend actor created successfully');
        } else {
          setError(t('errors.initActor', 'Error initializing actor. Please try logging out and in again.'));
          // Reset para permitir nova tentativa
          initializedRef.current = false;
        }
      } catch (e) {
        console.error('[NFTPetsPanel] actor error', e);
        if (mounted) {
          setError(t('errors.initActor', 'Error initializing actor. Please try logging out and in again.'));
          initializedRef.current = false;
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, [isAuthenticated, createBackendActor, actor]);

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
      console.error('❌ ICP upload error:', error);
      setError(t('errors.uploadICP', 'Error uploading to ICP'));
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
      console.error('❌ Auto-upload error:', e);
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

  // ✅ FUNÇÃO: Gerar cartão de identidade digital do pet
  const generatePetDocument = async (pet) => {
    const imageURL = await getICPImageURL(pet.photo);
    const printWindow = window.open('', '_blank');
    const doc = printWindow.document;
    const currentLanguage = i18n.language;
    const isEnglish = currentLanguage.startsWith('en');

    const ownerAddress = (pet.owner && String(pet.owner)) || (authClient?.getIdentity()?.getPrincipal()?.toString() || '');

    const formatDate = (dateString) => {
      try { return new Date(dateString).toLocaleDateString(isEnglish ? 'en-US' : 'pt-BR'); } catch { return dateString || ''; }
    };

    // Mapear status -> ícone e rótulo
    const status = pet.status || (pet.isLost ? 'lost' : 'home');
    const statusConfig = {
      home: { icon: '🏠', color: '#10b981', label: isEnglish ? 'Home' : 'Em casa' },
      lost: { icon: '❓', color: '#f59e0b', label: isEnglish ? 'Lost' : 'Perdido' },
      hospital: { icon: '🏥', color: '#ef4444', label: isEnglish ? 'Red Cross' : 'Cruz Vermelha' }
    }[status] || { icon: '🏠', color: '#10b981', label: isEnglish ? 'Home' : 'Em casa' };

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isEnglish ? 'en' : 'pt-BR'}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PetID - ${pet.nickname}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;background:#1e3a5f;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;color:#e5e7eb}
          .card{width:760px;max-width:100%;background:#264766;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.35);padding:18px 18px 22px;border:1px solid rgba(255,255,255,.08);position:relative}
          .topbar{height:46px;background:#0f2740;border-radius:10px;margin-bottom:16px;display:flex;align-items:center;padding:0 14px;justify-content:space-between}
          .brand{display:flex;align-items:center;gap:8px;color:#93c5fd;font-weight:700;letter-spacing:.5px}
          .brand img{width:22px;height:22px;border-radius:4px}
          .grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}
          .left{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px}
          .pill{display:grid;grid-template-columns:120px 1fr;align-items:center;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:#e5e7eb;padding:10px 12px;border-radius:10px;margin:8px 0}
          .pill .label{font-weight:700;letter-spacing:.6px;color:#e0e7ff;text-transform:uppercase;font-size:12px}
          .pill .value{font-weight:600;color:#f8fafc;letter-spacing:.3px}
          .photoWrap{position:relative;display:flex;align-items:center;justify-content:center}
          .photo{width:300px;height:300px;border-radius:18px;object-fit:cover;border:6px solid #e5e7eb;background:#0b1220}
          .status{position:absolute;top:10px;right:10px;background:${statusConfig.color};color:#fff;padding:6px 10px;border-radius:999px;font-weight:700;display:flex;gap:6px;align-items:center;border:2px solid #fff}
          .ownerRibbon{position:absolute;right:18px;bottom:18px;background:#111827;color:#fff;padding:10px 14px;border-radius:12px;border:1px solid #374151;box-shadow:0 6px 14px rgba(0,0,0,.3);max-width:54%;}
          .ownerRibbon .title{font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#93c5fd;font-weight:800;margin-bottom:4px}
          .ownerRibbon .address{font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;word-break:break-all}
        </style>
      </head>
      <body>
        <div class="card">
          <div class="topbar">
            <div class="brand"><img src="${petidLogo}" alt="PetID"/> PetID</div>
          </div>
          <div class="grid">
            <div class="left">
              <div class="pill"><div class="label">${isEnglish ? 'Name' : 'Nome'}</div><div class="value">${pet.nickname || '-'}</div></div>
              <div class="pill"><div class="label">${isEnglish ? 'Pet ID' : 'ID do Pet'}</div><div class="value">${pet.id || '-'}</div></div>
              <div class="pill"><div class="label">${isEnglish ? 'Breed' : 'Raça'}</div><div class="value">${pet.species || '-'}</div></div>
              <div class="pill"><div class="label">${isEnglish ? 'Coat' : 'Cor'}</div><div class="value">${pet.color || '-'}</div></div>
              <div class="pill"><div class="label">${isEnglish ? 'DOB' : 'Nascimento'}</div><div class="value">${formatDate(pet.birthDate) || '-'}</div></div>
              <div class="pill"><div class="label">${isEnglish ? 'Sex' : 'Sexo'}</div><div class="value">${pet.gender === 'male' ? (isEnglish ? 'Male' : 'Macho') : (isEnglish ? 'Female' : 'Fêmea')}</div></div>
            </div>
            <div class="photoWrap">
              ${imageURL ? `<img src="${imageURL}" class="photo" alt="${pet.nickname}"/>` : `<div class="photo" style="display:flex;align-items:center;justify-content:center;color:#94a3b8">${isEnglish ? 'No photo' : 'Sem foto'}</div>`}
              <div class="status"><span>${statusConfig.icon}</span><span>${statusConfig.label}</span></div>
              <div class="ownerRibbon">
                <div class="title">${isEnglish ? 'Owner' : 'Dono'}</div>
                <div class="address">${ownerAddress}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>`;

    doc.write(htmlContent);
    doc.close();
    setTimeout(() => printWindow.print(), 700);
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
      setError(t('errors.loadPets', 'Error loading pets'));
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
    
    // Verificação dupla de autenticação
    if (!isAuthenticated || !actor || !authClient) {
      setError(t('petForm.loginPrompt', 'To register your pet, you need to connect with your Internet Identity'));
      return;
    }
    
    // Verificar se ainda está autenticado no momento do submit
    try {
      const stillAuthenticated = await authClient.isAuthenticated();
      if (!stillAuthenticated) {
        setError(t('errors.sessionExpired', 'Session expired. Please log in again.'));
        return;
      }
    } catch (e) {
      console.error('[NFTPetsPanel] Auth check error:', e);
      setError(t('errors.authCheck', 'Authentication error. Please log in again.'));
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
        setSuccess(t('petPanel.nftCreated', 'Pet NFT created successfully! Token ID: {{id}}', { id: String(result.ok) }));
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
        setError(t('errors.createNft', 'Error creating Pet NFT: {{err}}', { err: String(result.err) }));
      }
    } catch (e) {
      setError(t('errors.generic', 'Error: {{message}}', { message: e.message }));
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
    return pets.map((pet) => {
      const status = pet.isLost ? 'lost' : 'home';
      return (
        <div key={pet.id} className="nft-card">
          <div className="nft-left">
            <ICPImage
              assetId={pet.photo}
              altText={pet.nickname}
              className="nft-image"
              actor={actor}
            />
            <div className="nft-actions-under-image">
              <button
                className="btn btn-transfer"
                onClick={() => {
                  setTransferTokenId(pet.id);
                  setShowTransferModal(true);
                }}
              >
                🔄 Transfer NFT
              </button>
              <button
                className="btn btn-primary"
                onClick={() => generatePetDocument(pet)}
              >
                <FiFileText />
                {t('identityCard', 'Cartão ID')}
              </button>
            </div>
          </div>
          <div className="nft-details">
            <div className="nft-titlebar">
              <h3>{pet.nickname}</h3>
              <span className={`status-badge ${status === 'lost' ? 'status-lost' : 'status-home'}`}>
                {status === 'lost' ? '❓ ' + t('petForm.lost', 'Lost') : '🏠 ' + t('petForm.notLost', 'At home')}
              </span>
            </div>
            <div className="nft-metadata">
              <p><strong>🆔 Token ID:</strong> {pet.id}</p>
              <p><strong>📊 {t('document.species', 'Species')}:</strong> {pet.species}</p>
              <p><strong>⚧ {t('document.gender', 'Gender')}:</strong> {pet.gender}</p>
              <p><strong>🎨 {t('document.color', 'Color')}:</strong> {pet.color}</p>
              <p><strong>🎂 {t('document.birthDate', 'Birth Date')}:</strong> {pet.birthDate}</p>
              <p><strong>⏰ {t('petPanel.created', 'Created')}:</strong> {formatIcTimestamp(pet.createdAt)}</p>
            </div>
          </div>
        </div>
      );
    });
  };

  // Renderizar NFTs no painel com informações DIP721
  return (
    <div className="nft-panel">
      <div className="nft-header">
        <h2>{t('petForm.myPets', 'My Pets')}</h2>
        <div className="dip721-info">
          <div className="info-badge" title="DIP721 balance" style={{maxWidth:'180px'}}>
            <span className="info-label">Your NFTs:</span>
            <span className="info-value">{nftBalance}</span>
          </div>
          
          {/* 💻 BOTÃO DESKTOP */}
          <button 
            className="btn btn-transfer hidden md:flex" 
            style={{minHeight:38}} 
            onClick={() => setFormOpen(!formOpen)}
          >
            <GiPawPrint style={{ marginRight: '8px' }} />
            {formOpen ? t('common.cancel', 'Cancel') : t('petPanel.createPetNft', 'Create Pet NFT')}
          </button>
        </div>
        
        {/* 📱 BOTÃO MOBILE SEGURO */}
        <div className="md:hidden mt-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 shadow-lg"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="text-center text-white mb-3">
              <GiPawPrint className="text-3xl mx-auto mb-2" />
              <h3 className="font-bold text-lg">
                {t('petPanel.createYourPet', 'Create Your Pet NFT')}
              </h3>
              <p className="text-sm opacity-90">
                {t('petPanel.mobileCreateDescription', 'Tap below to create your pet NFT safely')}
              </p>
            </div>
            <button
              className="w-full py-4 px-6 bg-white text-blue-600 font-bold rounded-lg shadow-md mobile-safe-btn"
              style={{ 
                minHeight: '56px'
              }}
              onTouchStart={(e) => {
                console.log('[Mobile NFT] 📱 Touch start detected');
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                console.log('[Mobile NFT] 📱 Touch end detected');
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Mobile NFT] 📱 SAFE MOBILE CLICK - Opening form');
                setFormOpen(!formOpen);
              }}
            >
              <span className="text-lg">
                {formOpen ? '❌ ' + t('common.cancel', 'Cancel') : '🐾 ' + t('petPanel.createPetNft', 'Create Pet NFT')}
              </span>
            </button>
          </div>
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
          <h3 style={{ marginBottom: '16px' }}>{t('petPanel.createNewNftTitle', 'Create New Pet NFT')}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                {t('petPanel.image', 'Image')}:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onInputFileChange}
                style={{ marginBottom: '8px' }}
              />
              {uploading && <p>{t('petPanel.uploadingImage', 'Uploading image...')}</p>}
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
                  {t('petForm.nickname', 'Nickname')}:
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  required
                  placeholder={t('petForm.nicknamePlaceholder', "Your pet's nickname (optional)")}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  {t('petForm.birthDate', 'Birth Date')}:
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
                  {t('petForm.species', 'Species')}:
                </label>
                <input
                  type="text"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  placeholder={t('petForm.selectSpecies', 'Select species')}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  {t('petForm.gender', 'Gender')}:
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">{t('petForm.selectGender', 'Select gender')}</option>
                  <option value="male">{t('petForm.male', 'Male')}</option>
                  <option value="female">{t('petForm.female', 'Female')}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  {t('petForm.color', 'Main Color')}:
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
                  {t('petForm.lost', 'Lost')}
                </label>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-transfer"
                style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? t('petPanel.creatingNft', 'Creating NFT...') : t('petPanel.createPetNft', 'Create Pet NFT')}
              </button>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="btn"
                style={{ background: '#374151', color: '#fff', borderColor: '#4b5563' }}
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de NFTs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {loadingPets ? (
          <div className="empty-state">{t('common.loading', 'Loading...')}</div>
        ) : pets.length === 0 ? (
          <div className="empty-state">
            <GiPawPrint size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>{t('petPanel.noPets', 'No pets registered yet.')}</p>
            <p>{t('petPanel.createFirstHint', 'Click "Create Pet NFT" to start!')}</p>
          </div>
        ) : (
          renderNFTs()
        )}
      </div>

      {/* 🚀 BOTÃO FLUTUANTE MOBILE - Sempre visível */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <button
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center text-white mobile-safe-btn"
          style={{ 
            border: '3px solid white'
          }}
          onTouchStart={(e) => {
            console.log('[FAB] 🎯 FAB Touch start');
            e.currentTarget.style.transform = 'scale(0.85)';
          }}
          onTouchEnd={(e) => {
            console.log('[FAB] 🎯 FAB Touch end');
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[FAB] 🎯 FAB CLICKED - Opening NFT form');
            setFormOpen(true);
            // Scroll to top para mostrar o form
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title={t('petPanel.createPetNft', 'Create Pet NFT')}
        >
          <GiPawPrint className="text-2xl" />
        </button>
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