import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from "../assets/logo/logo.jpg"

const PetIDCard = ({ pet, onClose }) => {
  const { t } = useTranslation();
  
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

  // Gateway para IPFS
  const gateways = [
    (cid) => `https://gateway.pinata.cloud/ipfs/${cid}`,
    (cid) => `https://ipfs.io/ipfs/${cid}`,
    (cid) => `https://cloudflare-ipfs.com/ipfs/${cid}`
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header com botão fechar */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">PetID - Cartão Digital</h1>
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
          {/* Cartão de identidade */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
            
            {/* Seção principal com foto e nome */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              
              {/* Coluna esquerda - Foto e nome */}
              <div className="flex flex-col items-center lg:items-start">
                {/* Nome do pet em destaque acima da foto */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center lg:text-left">
                  {pet.nickname}
                </h2>
                
                {/* Foto do pet */}
                <div className="relative">
                  {pet.photo ? (
                    <img
                      src={gateways[0](pet.photo)}
                      alt={pet.nickname}
                      className="w-40 h-40 object-cover rounded-2xl border-4 border-white shadow-xl"
                      onError={(e) => {
                        const current = gateways.findIndex(g => e.target.src === g(pet.photo));
                        const next = gateways[current + 1];
                        if (next) e.target.src = next(pet.photo); 
                        else e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gray-200 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* ID simplificado abaixo da foto */}
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-xl font-mono text-sm font-semibold shadow-md">
                      ID #{pet.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna direita - Informações */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Data de nascimento */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Data de nascimento
                  </div>
                  <div className="text-lg font-medium text-gray-800">
                    {formatDate(pet.birthDate)}
                  </div>
                </div>

                {/* Espécie */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Espécie
                  </div>
                  <div className="text-lg font-medium text-gray-800">
                    {t(`petForm.${pet.species}`, pet.species)}
                  </div>
                </div>

                {/* Gênero */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Gênero
                  </div>
                  <div className="text-lg font-medium text-gray-800">
                    {t(`petForm.${pet.gender}`, pet.gender)}
                  </div>
                </div>

                {/* Cor */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Cor
                  </div>
                  <div className="text-lg font-medium text-gray-800">
                    {t(`petForm.${pet.color}`, pet.color)}
                  </div>
                </div>
              </div>
            </div>

            {/* Identificador da blockchain */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Identificador Blockchain
              </div>
              <div className="font-mono text-lg font-bold text-indigo-600 break-all">
                ICP-PETID-{pet.id.toString().padStart(8, '0')}
              </div>
            </div>

            {/* Status com hash */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Status
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      pet.isLost 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {pet.isLost ? t('petForm.lost', 'Perdido') : t('petForm.notLost', 'Seguro')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Hash verificação
                  </div>
                  <div className="font-mono text-sm text-gray-600">
                    {generateSimplifiedHash(pet.id)}
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                {/* Logo PetID */}
                <div className="flex items-center gap-3">
                  <img src={Logo} alt="" />
                  <div>
                    <div className="font-bold text-indigo-600 text-lg">PetID</div>
                  </div>
                </div>
                
                {/* Informações do documento */}
                <div className="text-right text-sm text-gray-600">
                  <div className="font-medium">Documento gerado em {currentDate}</div>
                  <div className="text-xs mt-1">
                    Identidade digital segura e descentralizada para pets
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Documento
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Fechar
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