import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';
import { useTranslation } from 'react-i18next';
import { GiPawPrint } from 'react-icons/gi';
import { FiFileText, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import petidLogo from '../../assets/logo/logo.jpg';

const gateways = [
  (cid) => `https://ipfs.io/ipfs/${cid}`,
  (cid) => `https://gateway.pinata.cloud/ipfs/${cid}`,
  (cid) => `https://cloudflare-ipfs.com/ipfs/${cid}`,
  (cid) => `https://dweb.link/ipfs/${cid}`,
];

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
    // Loading log removido para produção
    setLoadingPets(true);
    
    try {
      // Primeiro, tentar carregar do localStorage como fallback
      const cachedPets = localStorage.getItem('userPets');
      if (cachedPets) {
        const parsedPets = JSON.parse(cachedPets);
        setPets(parsedPets);
        // Cache log removido para produção
      }
      
      // Verificar se temos autenticação válida antes de tentar o backend
      if (!isAuthenticated) {
        // Auth log removido para produção
        return;
      }
      
      // Se temos actor, tentar carregar do backend COM PROTEÇÃO EXTRA
      if (actor) {
        try {
          // Backend call log removido para produção
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
            // ICP load success log removido para produção
          } else {
            console.warn('[NFTPetsPanel] Backend returned error:', res.err);
          }
        } catch (backendError) {
          console.warn('[NFTPetsPanel] Backend call failed (using cache):', backendError.message || backendError);
          // NÃO fazer logout - apenas usar cache
        }
      }
    } catch (e) {
      console.error('[NFTPetsPanel] General error (not critical):', e.message || e);
      // Em caso de erro, tentar carregar do localStorage
      const cachedPets = localStorage.getItem('userPets');
      if (cachedPets) {
        try {
          const parsedPets = JSON.parse(cachedPets);
          setPets(parsedPets);
          // Fallback log removido para produção
        } catch (parseError) {
          console.warn('[NFTPetsPanel] Cache parse error:', parseError);
          setPets([]); // Array vazio se não conseguir parsear
        }
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
      const res = await actor.createPet({
        photo: formData.photo,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
        species: formData.species,
        gender: formData.gender,
        color: formData.color,
        isLost: formData.isLost,
      });
      if ('ok' in res) {
        setSuccess(t('petPanel.petRegistered'));
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

  return (
    <div className="space-y-8">
      {/* Stats dentro do painel */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {[
          { key: 'totalPets', value: pets.length, color: 'from-petPink-400 to-petPurple-500' },
          { key: 'upcomingEvents', value: 0, color: 'from-emerald-400 to-teal-500' }, // mock
          { key: 'medicalPendings', value: 0, color: 'from-amber-400 to-orange-500' }, // mock
          { key: 'partnerClinics', value: 0, color: 'from-indigo-400 to-accent-500' }, // mock
        ].map(c => (
          <div key={c.key} className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-white/70 to-white/40 dark:from-surface-75/70 dark:to-surface-100/40 backdrop-blur group border border-gray-200 dark:border-surface-100">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r ${c.color} mix-blend-overlay`} />
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">{t(`profile.stats.${c.key}`)}</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">{c.value}</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300">{t('profile.stats.today')}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Header + botão adicionar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <GiPawPrint className="text-xl text-[#8A8BED]" /> {t('petForm.myPets', 'Meus Pets')}
          {loadingPets && <svg className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24" />}
        </h2>
        {isAuthenticated && (
          <button
            onClick={() => setFormOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-brand-500 to-petPurple-500 text-white shadow hover:shadow-md transition"
          >
            <span className="text-lg">{formOpen ? '−' : '+'}</span> {formOpen ? t('petForm.register', 'Registrar Pet') : t('petForm.register', 'Registrar Pet')}
          </button>
        )}
      </div>

    

      {/* Acordeão do formulário */}
      {formOpen && (
        <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/70 backdrop-blur p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">{error}</div>}
            {success && <div className="p-3 rounded-md bg-green-100 text-green-700 text-sm">{success}</div>}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Coluna Imagem / Dropzone */}
              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200 mb-2">Imagem *</label>
                <div
                  className={`relative group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition cursor-pointer bg-white/70 dark:bg-surface-100/30 hover:border-indigo-400 dark:hover:border-indigo-500 ${uploading ? 'opacity-70' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; handleFileSelect(file); }}
                  onClick={() => document.getElementById('pet-image-input')?.click()}
                >
                  {!imagePreview && !formData.photo && (
                    <>
                      <svg className="h-10 w-10 text-indigo-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8.25A2.25 2.25 0 0 1 5.25 6h13.5A2.25 2.25 0 0 1 21 8.25v8.25m-18 0A2.25 2.25 0 0 0 5.25 18h13.5A2.25 2.25 0 0 0 21 16.5m-18 0v.75A2.25 2.25 0 0 0 5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25v-.75M12 12l3 3m0 0l3-3m-3 3V3" /></svg>
                      <p className="text-xs text-gray-600 dark:text-slate-200 leading-relaxed">{t('petPanel.selectOrDrop')}<br /><span className="text-[10px] uppercase tracking-wide font-medium text-indigo-500">{t('petPanel.fileTypes')}</span></p>
                    </>
                  )}
                  {(imagePreview || formData.photo) && (
                    <div className="relative w-40 h-40">
                      <img
                        src={imagePreview || gateways[0](formData.photo)}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-xl ring-2 ring-indigo-300/40 dark:ring-indigo-600/30 shadow"
                      />
                      {uploading && (
                        <div className="absolute inset-0 backdrop-blur-sm bg-black/40 flex flex-col items-center justify-center rounded-xl text-white text-xs gap-2">
                          <svg className="animate-spin h-6 w-6 text-indigo-200" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>{uploadProgress ? `${uploadProgress}%` : t('petPanel.uploadingImage')}</span>
                        </div>
                      )}
                      {formData.photo && !uploading && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">{t('petPanel.cidOk')}</span>
                      )}
                    </div>
                  )}
                  <input id="pet-image-input" type="file" accept="image/*" onChange={onInputFileChange} className="hidden" />
                </div>
                {formData.photo && (
                  <p className="mt-3 text-[10px] font-mono break-all text-emerald-600 dark:text-emerald-400">{t('petPanel.cidLabel')}: {formData.photo}</p>
                )}
              </div>
              {/* Coluna dados */}
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">{t('petPanel.nickname')} *</label>
                  <input name="nickname" value={formData.nickname} onChange={handleChange} placeholder={t('petForm.nicknamePlaceholder', 'Ex: Luna')} className="rounded-xl border border-gray-300 dark:border-surface-200 bg-white/80 dark:bg-surface-100/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">{t('petPanel.birthDate')} *</label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="rounded-xl border border-gray-300 dark:border-surface-200 bg-white/80 dark:bg-surface-100/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">{t('petForm.species')} *</label>
                  <select name="species" value={formData.species} onChange={handleChange} className="rounded-xl border border-gray-300 dark:border-surface-200 bg-white/80 dark:bg-surface-100/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-800 dark:text-slate-100">
                    <option value="">{t('petForm.selectSpecies')}</option>
                    <option value="dog">{t('petForm.dog')}</option>
                    <option value="cat">{t('petForm.cat')}</option>
                    <option value="bird">{t('petForm.bird')}</option>
                    <option value="snake">{t('petForm.snake')}</option>
                    <option value="hamster">{t('petForm.hamster')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">{t('petForm.gender')} *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="rounded-xl border border-gray-300 dark:border-surface-200 bg-white/80 dark:bg-surface-100/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-800 dark:text-slate-100">
                    <option value="">{t('petForm.selectGender')}</option>
                    <option value="male">{t('petForm.male')}</option>
                    <option value="female">{t('petForm.female')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">{t('petForm.color')} *</label>
                  <select name="color" value={formData.color} onChange={handleChange} className="rounded-xl border border-gray-300 dark:border-surface-200 bg-white/80 dark:bg-surface-100/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-800 dark:text-slate-100">
                    <option value="">{t('petForm.selectColor')}</option>
                    <option value="black">{t('petForm.black')}</option>
                    <option value="white">{t('petForm.white')}</option>
                    <option value="brown">{t('petForm.brown')}</option>
                    <option value="golden">{t('petForm.golden')}</option>
                    <option value="gray">{t('petForm.gray')}</option>
                    <option value="orange">{t('petForm.orange')}</option>
                    <option value="mixed">{t('petForm.mixed')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">{t('petForm.status')}</label>
                  <select 
                    name="isLost" 
                    value={formData.isLost.toString()} 
                    onChange={(e) => setFormData({...formData, isLost: e.target.value === 'true'})} 
                    className="rounded-xl border border-gray-300 dark:border-surface-200 bg-white/80 dark:bg-surface-100/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-800 dark:text-slate-100"
                  >
                    <option value="false">{t('petForm.notLost')}</option>
                    <option value="true">{t('petForm.lost')}</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">{/* Botões permanecem iguais */}
                  <button disabled={submitting || uploading} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-petPurple-600 text-white text-sm font-semibold shadow hover:shadow-md transition disabled:opacity-60 flex items-center gap-2">
                    {(submitting || uploading) && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    )}
                    {submitting ? t('petPanel.saving') : uploading ? t('petPanel.uploadingImage') : t('petPanel.savePet')}
                  </button>
                  <button type="button" onClick={() => setFormOpen(false)} className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-surface-200">{t('petPanel.close')}</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de pets */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
        {pets.length === 0 && !loadingPets && (
          <div className="col-span-full text-sm text-gray-500 dark:text-slate-400">{t('petPanel.noPets')}</div>
        )}
        {pets.map(pet => (
          <div key={pet.id} className="group relative w-full max-w-sm rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-br from-brand-500/10 via-petPink-400/10 to-accent-500/10" />
            {/* Imagem */}
            {pet.photo && (
              <div className="mb-3 relative w-full flex justify-center">
                <img
                  src={gateways[0](pet.photo)}
                  alt={pet.nickname}
                  className="w-32 h-32 object-cover rounded-xl ring-1 ring-gray-200 dark:ring-slate-700 shadow"
                  onError={(e) => {
                    const current = gateways.findIndex(g => e.target.src === g(pet.photo));
                    const next = gateways[current + 1];
                    if (next) e.target.src = next(pet.photo); else e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {pet.nickname} 
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">#{pet.id}</span>
                {pet.isLost && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300">
                    {t('petForm.lost')}
                  </span>
                )}
              </h3>
            </div>
            <div className="space-y-1 text-[11px] text-gray-500 dark:text-slate-400">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <p><span className="font-medium">{t('petForm.species')}:</span> {t(`petForm.${pet.species}`, pet.species)}</p>
                <p><span className="font-medium">{t('petForm.gender')}:</span> {t(`petForm.${pet.gender}`, pet.gender)}</p>
                <p><span className="font-medium">{t('petForm.color')}:</span> {t(`petForm.${pet.color}`, pet.color)}</p>
                <p><span className="font-medium">{t('petForm.status')}:</span> {pet.isLost ? t('petForm.lost') : t('petForm.notLost')}</p>
              </div>
              <p className="pt-1"><span className="font-medium">{t('petPanel.birth')}:</span> {formatDate(pet.birthDate)}</p>
              <p><span className="font-medium">{t('petPanel.created')}:</span> {formatTimestamp(pet.createdAt)}</p>
              <p><span className="font-medium">{t('petPanel.owner')}:</span> {formatPrincipal(pet.owner)}</p>
              {pet.photo && <p className="truncate"><span className="font-medium">{t('petPanel.cidLabel')}:</span> {pet.photo}</p>}
            </div>
            
            {/* Botão Document */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-surface-100">
              <button
                onClick={() => generatePetDocument(pet)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <FiFileText className="w-4 h-4" />
                Document
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTPetsPanel;
