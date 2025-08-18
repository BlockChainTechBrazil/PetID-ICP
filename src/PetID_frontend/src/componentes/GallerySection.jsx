import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const images = [
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558944351-94ae21039c63?auto=format&fit=crop&w=800&q=80'
];

const GallerySection = () => {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(Array(images.length).fill(false));
  const handleLoad = (i) => setLoaded(prev => prev.map((v, idx) => idx === i ? true : v));

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div data-parallax data-parallax-speed="0.08" className="absolute -top-10 -left-10 w-72 h-72 bg-blue-100 dark:bg-brand-600/30 rounded-full blur-3xl opacity-60" />
        <div data-parallax data-parallax-speed="0.15" className="absolute bottom-0 -right-16 w-80 h-80 bg-pink-100 dark:bg-accent-500/30 rounded-full blur-3xl opacity-50" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 reveal">{t('gallery.title')}</h2>
          <p className="text-lg text-gray-600 dark:text-slate-400 reveal delay-100">{t('gallery.subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((src, i) => (
            <div key={i} className={`relative overflow-hidden rounded-2xl shadow-md aspect-[4/5] group reveal delay-${(i + 1) * 50} bg-white dark:bg-slate-800/60`}>
              {!loaded[i] && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-800" />
              )}
              <img
                src={src}
                srcSet={`${src}&w=400 400w, ${src}&w=600 600w, ${src}&w=800 800w`}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                alt="Pets e famílias felizes"
                className={`w-full h-full object-cover transform group-hover:scale-110 transition-[transform,filter,opacity] duration-700 ${loaded[i] ? 'opacity-100' : 'opacity-0'} ease-out`}
                loading="lazy"
                decoding="async"
                onLoad={() => handleLoad(i)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
