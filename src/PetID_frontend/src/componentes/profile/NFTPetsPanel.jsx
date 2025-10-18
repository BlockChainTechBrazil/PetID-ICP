import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useTranslation } from 'react-i18next';
import { GiPawPrint } from 'react-icons/gi';
import { FiFileText } from 'react-icons/fi';
import petidLogo from '../../assets/logo/logo.jpg';
import ICPImage from '../ICPImage';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
        setError(t('errors.initActor', 'Error initializing actor'));
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

    const qrPayload = JSON.stringify({ id: pet.id, nickname: pet.nickname, owner: ownerAddress, url: `${window.location.origin}/?pet=${encodeURIComponent(pet.id)}` });
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 112 });
    } catch (e) { console.warn('QR generation failed', e); }
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
          html,body{height:100%}
          @page { size: auto; margin: 0; }
          /* Página em branco, apenas o card ficará azul */
          body{font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;background:#ffffff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:36px;color:#0b1220; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
          .card{width:820px;max-width:100%;background:#264766;border-radius:16px;box-shadow:0 18px 40px rgba(2,6,23,0.25);padding:28px;border:1px solid rgba(255,255,255,0.04);position:relative; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
          .topbar{height:56px;border-radius:10px;margin-bottom:18px;display:flex;align-items:center;padding:0 6px;justify-content:flex-start}
          .brand{display:flex;align-items:center;gap:10px;color:#93c5fd;font-weight:700;letter-spacing:.2px}
          .brand img{width:26px;height:26px;border-radius:6px}
          .grid{display:grid;grid-template-columns:1fr .9fr;gap:18px}
          .left{background:transparent;border-radius:12px;padding:4px}
          .pill{display:grid;grid-template-columns:120px 1fr;align-items:center;background:rgba(255,255,255,0.03);color:#e5e7eb;padding:12px;border-radius:10px;margin:8px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
          .pill .label{font-weight:700;letter-spacing:.6px;color:#c7d2fe;text-transform:uppercase;font-size:12px}
          .pill .value{font-weight:700;color:#f8fafc;letter-spacing:.2px;padding-left:6px}
          .photoWrap{position:relative;display:flex;align-items:center;justify-content:center}
          .photo{width:320px;height:320px;border-radius:16px;object-fit:cover;border:10px solid rgba(255,255,255,0.06);background:#0b1220}
          .status{position:absolute;top:12px;right:12px;background:${statusConfig.color};color:#fff;padding:6px 12px;border-radius:999px;font-weight:700;display:flex;gap:8px;align-items:center;box-shadow:0 6px 18px rgba(2,6,23,0.2)}
          /* Owner Ribbon em branco para contraste dentro do card azul */
          .ownerRibbon{position:absolute;right:18px;bottom:18px;background:#ffffff;color:#0b1220;padding:12px 14px;border-radius:12px;border:1px solid rgba(2,6,23,0.06);box-shadow:0 10px 22px rgba(2,6,23,0.12);max-width:54%; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
          .ownerRibbon .title{font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#2b6cb0;font-weight:800;margin-bottom:6px}
          .ownerRibbon .address{font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;word-break:break-all;color:#334155}
          .qr{position:absolute;left:20px;bottom:20px;background:#ffffff;border:1px solid rgba(2,6,23,0.06);border-radius:12px;padding:8px;box-shadow:0 10px 20px rgba(2,6,23,0.12); -webkit-print-color-adjust: exact; print-color-adjust: exact;}
          @media print{ 
            /* Mantém a página branca, e forçar o cartão com cor de fundo ainda visível quando possível */
            body{padding:0; background: #ffffff}
            .card{box-shadow:none;border-radius:8px;width:100%;padding:18px}
          }
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
              ${qrDataUrl ? `<div class="qr"><img width="96" height="96" src="${qrDataUrl}" alt="QR" style="display:block;border-radius:6px;"/></div>` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>`;

    // legacy: open printable window (kept for browsers that prefer print dialog)
    try {
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => printWindow.print(), 700);
    } catch (e) {
      console.warn('print window failed, fallback to PDF export', e);
    }
  };

  // Exporta o cartão como PDF rasterizado (html2canvas -> jsPDF) no tamanho de cartão CPF (85.6 x 53.98 mm)
  const exportPetCardAsPDF = async (pet) => {
    try {
      // dimensões em mm
      const widthMM = 85.6;
      const heightMM = 53.98;

      // calcular pixels para renderização (usar 2x scale para melhor qualidade)
      const dpi = 300; // para qualidade
      const pxPerMm = dpi / 25.4;
      const pxW = Math.round(widthMM * pxPerMm);
      const pxH = Math.round(heightMM * pxPerMm);

      // construir container offscreen
      const container = document.createElement('div');
      container.style.width = pxW + 'px';
      container.style.height = pxH + 'px';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.background = '#ffffff';
      container.style.padding = '0';
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '0';

      // card
      const card = document.createElement('div');
      card.style.width = '100%';
      card.style.height = '100%';
      card.style.boxSizing = 'border-box';
      card.style.background = '#264766';
      card.style.borderRadius = '6px';
      card.style.padding = Math.round(8 * pxPerMm / (dpi / 96)) + 'px';
      card.style.display = 'flex';
      card.style.gap = '12px';
      card.style.color = '#e5e7eb';
      card.style.fontFamily = 'Inter, system-ui, -apple-system, \"Segoe UI\", sans-serif';

      // left column (metadata)
      const left = document.createElement('div');
      left.style.flex = '1';
      left.style.display = 'flex';
      left.style.flexDirection = 'column';
      left.style.justifyContent = 'center';
      left.style.padding = '6px';

      const makePill = (label, value) => {
        const pill = document.createElement('div');
        pill.style.display = 'flex';
        pill.style.justifyContent = 'space-between';
        pill.style.alignItems = 'center';
        pill.style.padding = '6px 8px';
        pill.style.margin = '4px 0';
        pill.style.background = 'rgba(255,255,255,0.03)';
        pill.style.borderRadius = '8px';
        const lab = document.createElement('div'); lab.style.fontSize = '9px'; lab.style.letterSpacing = '.6px'; lab.style.color = '#a5b4fc'; lab.textContent = label;
        const val = document.createElement('div'); val.style.fontWeight = '700'; val.style.color = '#f8fafc'; val.textContent = value;
        pill.appendChild(lab); pill.appendChild(val);
        return pill;
      };

      left.appendChild(makePill(isEnglish ? 'Name' : 'Nome', pet.nickname || '-'));
      left.appendChild(makePill(isEnglish ? 'Pet ID' : 'ID do Pet', pet.id || '-'));
      left.appendChild(makePill(isEnglish ? 'Breed' : 'Raça', pet.species || '-'));
      left.appendChild(makePill(isEnglish ? 'Coat' : 'Cor', pet.color || '-'));

      // right column (photo + qr + owner)
      const right = document.createElement('div');
      right.style.width = Math.round(pxW * 0.45) + 'px';
      right.style.display = 'flex';
      right.style.flexDirection = 'column';
      right.style.alignItems = 'center';
      right.style.justifyContent = 'center';
      right.style.position = 'relative';

      const photo = document.createElement('img');
      const imageURL = await getICPImageURL(pet.photo);
      photo.src = imageURL || '';
      photo.alt = pet.nickname || 'photo';
      photo.style.width = Math.round(pxW * 0.5) + 'px';
      photo.style.height = Math.round(pxH * 0.45) + 'px';
      photo.style.objectFit = 'cover';
      photo.style.borderRadius = '10px';
      photo.style.boxShadow = '0 8px 20px rgba(2,6,23,0.2)';

      // gerar QR
      const ownerAddress = (pet.owner && String(pet.owner)) || (authClient?.getIdentity()?.getPrincipal()?.toString() || '');
      const qrPayload = JSON.stringify({ id: pet.id, nickname: pet.nickname, owner: ownerAddress, url: `${window.location.origin}/?pet=${encodeURIComponent(pet.id)}` });
      let qrDataUrl = '';
      try { qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 256 }); } catch (e) { console.warn('QR generation failed', e); }

      const qrWrap = document.createElement('div');
      qrWrap.style.position = 'absolute';
      qrWrap.style.left = '8px';
      qrWrap.style.bottom = '8px';
      qrWrap.style.background = '#ffffff';
      qrWrap.style.padding = '6px';
      qrWrap.style.borderRadius = '8px';
      qrWrap.style.boxShadow = '0 8px 18px rgba(2,6,23,0.12)';
      if (qrDataUrl) {
        const qrImg = document.createElement('img');
        qrImg.src = qrDataUrl;
        qrImg.width = Math.round(pxW * 0.22);
        qrImg.height = Math.round(pxW * 0.22);
        qrImg.style.display = 'block';
        qrWrap.appendChild(qrImg);
      }

      const ownerBox = document.createElement('div');
      ownerBox.style.position = 'absolute';
      ownerBox.style.right = '8px';
      ownerBox.style.bottom = '8px';
      ownerBox.style.background = '#ffffff';
      ownerBox.style.color = '#0b1220';
      ownerBox.style.padding = '8px 10px';
      ownerBox.style.borderRadius = '10px';
      ownerBox.style.maxWidth = Math.round(pxW * 0.42) + 'px';
      ownerBox.style.fontFamily = 'JetBrains Mono, monospace';
      ownerBox.style.fontSize = '10px';
      ownerBox.textContent = isEnglish ? 'Owner\n' : 'Dono\n';
      const ownerAddr = document.createElement('div'); ownerAddr.style.marginTop = '6px'; ownerAddr.style.whiteSpace = 'pre-wrap'; ownerAddr.textContent = ownerAddress;
      ownerBox.appendChild(ownerAddr);

      right.appendChild(photo);
      right.appendChild(qrWrap);
      right.appendChild(ownerBox);

      card.appendChild(left);
      card.appendChild(right);
      container.appendChild(card);
      document.body.appendChild(container);

      // renderizar com html2canvas
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: null });
      // gerar pdf
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [widthMM, heightMM] });
      pdf.addImage(imgData, 'PNG', 0, 0, widthMM, heightMM);
      pdf.save(`${pet.nickname || 'pet'}_card.pdf`);

      // cleanup
      document.body.removeChild(container);
    } catch (e) {
      console.error('exportPetCardAsPDF error', e);
      alert('Erro ao exportar PDF: ' + (e.message || e));
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
    if (!isAuthenticated || !actor) {
      setError(t('petForm.loginPrompt', 'To register your pet, you need to connect with your Internet Identity'));
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
                onClick={() => exportPetCardAsPDF(pet)}
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
          <div className="info-badge" title="DIP721 balance" style={{ maxWidth: '160px' }}>
            <span className="info-label">NFTs:</span>
            <span className="info-value">{nftBalance}</span>
          </div>
          <button className="btn btn-transfer" style={{ minHeight: 38 }} onClick={() => setFormOpen(!formOpen)}>
            <GiPawPrint style={{ marginRight: '8px' }} />
            {formOpen ? t('common.cancel', 'Cancel') : t('petPanel.createPetNft', 'Create Pet NFT')}
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