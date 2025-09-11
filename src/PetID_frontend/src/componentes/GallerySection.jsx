import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dogImages } from '../data/dogImages';

// Mapeia para um array simples de fontes (backwards compat se necessário)
const images = dogImages.map(d => ({ src: d.src, alt: d.alt || 'Pet' }));

const GallerySection = () => {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(Array(images.length).fill(false));
  const handleLoad = (i) => setLoaded(prev => prev.map((v, idx) => idx === i ? true : v));

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 via-white to-white dark:from-surface-75 dark:via-surface-100 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div data-parallax data-parallax-speed="0.08" className="absolute -top-10 -left-10 w-72 h-72 bg-blue-100 dark:bg-petPurple-500/25 rounded-full blur-3xl opacity-70" />
        <div data-parallax data-parallax-speed="0.15" className="absolute bottom-0 -right-16 w-80 h-80 bg-pink-100 dark:bg-petPink-500/25 rounded-full blur-3xl opacity-70" />
        <div className="hidden md:block absolute top-1/2 left-1/3 w-80 h-80 -translate-y-1/2 bg-gradient-to-br from-petMint-500/20 via-petPurple-500/20 to-transparent rounded-full blur-3xl opacity-60" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 reveal">{t('gallery.title')}</h2>
          <p className="text-lg text-gray-600 dark:text-slate-400 reveal delay-100">{t('gallery.subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl md:rounded-2xl shadow-md group reveal delay-${(i + 1) * 50} bg-white dark:bg-gradient-to-br dark:from-surface-100 dark:via-surface-75 dark:to-surface-100 flex items-center justify-center aspect-[4/3] md:aspect-square`}
            >
              {!loaded[i] && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-100 dark:from-petPurple-500/20 dark:via-petPink-500/20 dark:to-petMint-500/20" />
              )}
              <img
                src={img.src}
                alt={img.alt}
                className={`max-w-full max-h-full w-full h-full object-contain md:object-cover object-center transform group-hover:scale-105  transition-[transform,filter,opacity] duration-700 ${loaded[i] ? 'opacity-100' : 'opacity-0'} ease-out`}
                loading="lazy"
                decoding="async"
                onLoad={() => handleLoad(i)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
