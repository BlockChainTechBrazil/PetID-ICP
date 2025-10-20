import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Dados mock em Recife-PE
const petLocation = { lat: -8.0476, lng: -34.8770, label: 'Luna (Seu Pet)' };
const clinics = [
  { id: 1, name: 'PetShop Boa Viagem', lat: -8.1190, lng: -34.9019, services: ['Banho e Tosa', 'Acessórios'] },
  { id: 2, name: 'Clínica Vet Recife (Derby)', lat: -8.0539, lng: -34.9023, services: ['Emergência 24h', 'Vacinas'] },
  { id: 3, name: 'Amigos dos Pets - Graças', lat: -8.0456, lng: -34.8977, services: ['Consultas', 'Check-up'] },
  { id: 4, name: 'PetCare Casa Forte', lat: -8.0236, lng: -34.9202, services: ['Cirurgia', 'Dermatologia'] },
];

// Loader simples do Google Maps (evita dependência externa)
function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') return Promise.reject('window undefined');
  if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
  if (window.__googleMapsPromise) return window.__googleMapsPromise;
  window.__googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true; script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
  return window.__googleMapsPromise;
}

// Estilo dark custom (reduz saturação / clareia labels)
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1f2530' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#d0d6e2' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1f2530' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#28323f' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#23312a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3642' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d252e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17212b' }] }
];

const MapPanel = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useStatic, setUseStatic] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  const openDirections = (place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener');
  };

  // Inicializa mapa (ou fallback estático)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Fallback estático sem dependências externas
      setUseStatic(true);
      setLoading(false);
      return;
    }
    let disposed = false;
    loadGoogleMaps(apiKey)
      .then(maps => {
        if (disposed) return;
        mapInstance.current = new maps.Map(mapRef.current, {
          center: petLocation,
          zoom: 15,
          disableDefaultUI: true,
          clickableIcons: false,
          styles: document.documentElement.classList.contains('dark') ? darkMapStyle : undefined
        });
        // Markers dinâmicos
        const petMarker = new maps.Marker({
          position: petLocation,
          map: mapInstance.current,
          title: petLocation.label,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ec4899',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });
        markersRef.current.pet = petMarker;
        clinics.forEach(c => {
          const svgPin = {
            url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path fill="%23ef4444" d="M12 22s-7-4.35-7-11a7 7 0 1 1 14 0c0 6.65-7 11-7 11z"/><circle cx="12" cy="11" r="3" fill="white"/></svg>',
            scaledSize: new maps.Size(40, 40),
            anchor: new maps.Point(20, 38)
          };
          const marker = new maps.Marker({
            position: { lat: c.lat, lng: c.lng },
            map: mapInstance.current,
            title: c.name,
            icon: svgPin
          });
          // Clique no marcador abre modal de detalhes
          marker.addListener('click', () => { console.log('[Map] marker click', c.id, c.name); setSelected(c.id); setShowDetails(true); });
          markersRef.current[c.id] = marker;
        });
        setLoading(false);
        // Quando o container mudar de tamanho, redimensionar o mapa para evitar corte (mobile/tab switches)
        try {
          const ro = new ResizeObserver(() => {
            try {
              maps.event.trigger(mapInstance.current, 'resize');
              mapInstance.current.setCenter(petLocation);
            } catch (e) { /* noop */ }
          });
          if (mapRef.current) {
            ro.observe(mapRef.current);
            // Adiciona listener para pointer events no container do mapa (diagnóstico)
            const el = mapRef.current;
            const onPointerDown = (ev) => { console.log('[Map] pointerdown on map container', ev.type, ev.pointerType); };
            const onClick = (ev) => { console.log('[Map] click on map container', ev.type); };
            el.addEventListener('pointerdown', onPointerDown, { passive: true });
            el.addEventListener('click', onClick, { passive: true });
            el.__diagnostics = { onPointerDown, onClick };
          }
          // também garantir resize em resize da janela
          const onWin = () => { try { maps.event.trigger(mapInstance.current, 'resize'); mapInstance.current.setCenter(petLocation); } catch (e) { } };
          window.addEventListener('resize', onWin);
          // salvar referências para cleanup
          mapRef.current.__ro = ro; mapRef.current.__onWin = onWin;
        } catch (e) { /* ResizeObserver pode não estar disponível em alguns browsers */ }
      })
      .catch(e => { setError('Falha ao carregar Google Maps'); setLoading(false); console.error(e); });
    return () => {
      disposed = true;
      try {
        if (mapRef.current) {
          const ro = mapRef.current.__ro; if (ro) ro.disconnect();
          const onWin = mapRef.current.__onWin; if (onWin) window.removeEventListener('resize', onWin);
          // cleanup diagnostics listeners
          const diag = mapRef.current.__diagnostics;
          if (diag) {
            try { mapRef.current.removeEventListener('pointerdown', diag.onPointerDown); } catch (e) { }
            try { mapRef.current.removeEventListener('click', diag.onClick); } catch (e) { }
          }
        }
      } catch (e) { }
    };
  }, []);

  // Atualiza estilo quando muda dark mode
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!mapInstance.current) return;
      const dark = document.documentElement.classList.contains('dark');
      mapInstance.current.setOptions({ styles: dark ? darkMapStyle : undefined });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Centraliza mapa ao selecionar clínica
  useEffect(() => {
    if (!mapInstance.current || !selected) return;
    const marker = markersRef.current[selected];
    if (marker) {
      mapInstance.current.panTo(marker.getPosition());
      marker.setAnimation(window.google?.maps?.Animation?.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 1400);
    }
  }, [selected]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/60 dark:bg-surface-75/60 backdrop-blur relative overflow-hidden"
        style={{ minHeight: '18rem' }}>
        {useStatic ? (
          <div className="absolute inset-0 select-none">
            <div className="absolute inset-0 bg-gradient-to-br from-surface-50 to-gray-200 dark:from-[#101826] dark:to-[#1a2533]" />
            {/* Grade leve */}
            <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-slate-600" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {[petLocation, ...clinics].map((p, i, arr) => {
              // Normalização simples relativa ao conjunto de pontos
              const lats = arr.map(pt => pt.lat); const lngs = arr.map(pt => pt.lng);
              const minLat = Math.min(...lats), maxLat = Math.max(...lats);
              const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
              const x = (p.lng - minLng) / (maxLng - minLng || 1);
              const y = (p.lat - minLat) / (maxLat - minLat || 1);
              return (
                <div key={i} className="absolute" style={{ left: `calc(${x * 100}% - 10px)`, top: `calc(${(1 - y) * 100}% - 10px)` }}>
                  <div className={`${p.id ? 'bg-red-500' : 'bg-petPink-500'} text-white text-[10px] font-semibold rounded-full h-8 w-8 flex items-center justify-center shadow ring-2 ring-white/60 dark:ring-surface-75 animate-[float-soft_4s_ease-in-out_infinite]`}>
                    {p.id ? 'C' : 'P'}
                  </div>
                </div>
              );
            })}
            <div className="absolute bottom-2 left-2 text-[10px] px-2 py-1 rounded bg-white/70 dark:bg-surface-100/70 text-gray-600 dark:text-slate-300 backdrop-blur">
              {t('profile.map.staticNote')}
            </div>
          </div>
        ) : (
          <>
            <div ref={mapRef} className="absolute inset-0" />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm">
                <div className="h-10 w-10 border-2 border-petPurple-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-slate-400">Carregando mapa...</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-red-600 dark:text-red-400 px-4 text-center">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t('profile.map.petLocation')}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">{petLocation.label}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3 flex items-center justify-between">{t('profile.map.partnerClinics')} <span className="text-[10px] font-normal text-gray-400">{clinics.length}</span></h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {clinics.map(c => (
              <div key={c.id} className={`w-full text-left text-xs p-3 rounded-xl border transition group ${selected === c.id ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-200 dark:border-surface-100 hover:border-indigo-300 dark:hover:border-indigo-400/50 bg-white/60 dark:bg-surface-100/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <button onClick={() => setSelected(c.id)} className="font-medium text-gray-700 dark:text-slate-200 text-left">
                    {c.name}
                  </button>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">{c.services.length}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{c.services.join(', ')}</p>
                  <button onClick={() => { setSelected(c.id); setShowDetails(true); }} className="shrink-0 text-[11px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20">
                    {t('profile.map.viewDetails')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal de detalhes do local */}
      {showDetails && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDetails(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 dark:border-surface-100 bg-white dark:bg-surface-75 shadow-2xl p-5">
            {(() => {
              const place = clinics.find(c => c.id === selected);
              if (!place) return null;
              return (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-1">{place.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">{t('profile.map.services')}: {place.services.join(', ')}</p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button onClick={() => setShowDetails(false)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-surface-100 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-surface-100">
                      {t('common.cancel')}
                    </button>
                    <button onClick={() => openDirections(place)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">
                      {t('profile.map.openDirections')}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPanel;
