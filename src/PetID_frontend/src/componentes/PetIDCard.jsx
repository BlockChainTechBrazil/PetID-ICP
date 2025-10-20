import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import ICPImage from './ICPImage';
import CardIdTemplate from './CardIdTemplate';

const PetIDCard = ({ pet, onClose, actor }) => {
  const { t } = useTranslation();
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // Função para formatar data
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Função para formatar timestamp  
  const formatTimestamp = (ts) => {
    try {
      return new Date(Number(ts) / 1_000_000).toLocaleString('pt-BR');
    } catch {
      return '—';
    }
  };

  // Função para gerar hash fictício simplificado
  const generateSimplifiedHash = (petId) => {
    return `${petId.toString().padStart(4, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };

  // Data atual para rodapé
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // URL de verificação simples
  const verifyUrl = (typeof window !== 'undefined')
    ? `${window.location.origin}/?pet=${encodeURIComponent(pet?.id ?? '')}`
    : `https://petid.local/?pet=${encodeURIComponent(pet?.id ?? '')}`;

  // Gerar QR Code ao montar/alterar ID
  useEffect(() => {
    let alive = true;
    const gen = async () => {
      try {
        const url = await QRCode.toDataURL(verifyUrl, { width: 160, margin: 1 });
        if (alive) setQrDataUrl(url);
      } catch (e) {
        console.warn('[PetIDCard] QR falhou:', e);
      }
    };
    if (pet?.id != null) gen();
    return () => { alive = false; };
  }, [pet?.id, verifyUrl]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header com botão fechar */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">{t('document.digitalIdentity', 'Cartão de Identidade Digital')}</h1>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo do cartão */}
        <div className="p-8">
          {/* Usando o template CardIdTemplate para exibir o cartão */}
          <CardIdTemplate
            pet={pet}
            qrDataUrl={qrDataUrl}
            verifyUrl={verifyUrl}
            actor={actor}
            formatDate={formatDate}
            simplifiedId={generateSimplifiedHash(pet.id)}
          />

          {/* Botões de ação */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('document.print', 'Imprimir Documento')}
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
            >
              {t('document.close', 'Fechar')}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style jsx>{`
        @media print {
          .fixed {
            position: static !important;
            background: white !important;
          }
          
          .backdrop-blur-sm {
            backdrop-filter: none !important;
          }
          
          .bg-black\\/50 {
            background: white !important;
          }
          
          .shadow-2xl,
          .shadow-xl,
          .shadow-lg,
          .shadow-md {
            box-shadow: none !important;
          }
          
          .max-h-\\[90vh\\] {
            max-height: none !important;
          }
          
          .overflow-y-auto {
            overflow: visible !important;
          }
          
          button {
            display: none !important;
          }
          
          .border-t {
            border-top: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PetIDCard;