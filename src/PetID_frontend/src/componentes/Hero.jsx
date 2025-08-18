import { useTranslation } from 'react-i18next';
import DogParallax from './DogParallax';

const Hero = () => {
  const { t } = useTranslation();

  return (
  <section className="relative overflow-hidden pt-24 md:pt-28 pb-28 md:pb-32 bg-gradient-to-br from-white via-brand-50 to-violet-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      {/* Decor radial & gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-140px] left-[-140px] w-[480px] h-[480px] bg-gradient-to-br from-brand-400/25 via-sky-300/10 to-transparent rounded-full blur-3xl dark:from-brand-600/10" />
        <div className="absolute top-1/3 right-[-180px] w-[520px] h-[520px] bg-gradient-to-tr from-accent-300/30 via-fuchsia-300/20 to-transparent rounded-full blur-3xl dark:from-accent-500/20" />
        <div className="absolute bottom-[-180px] left-1/3 w-[560px] h-[560px] bg-gradient-to-tr from-indigo-300/30 via-violet-300/10 to-transparent rounded-full blur-3xl dark:from-indigo-500/20" />
        {/* Overlays coloridos dark para mais vida */}
        <div className="hidden dark:block absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-br from-petPurple-500/30 via-petPink-500/20 to-petMint-500/20 rounded-full blur-3xl mix-blend-screen animate-gradient-x" />
        <div className="hidden dark:block absolute -bottom-16 -right-10 w-[420px] h-[420px] bg-gradient-to-tr from-petMint-500/25 via-petYellow-500/20 to-petPurple-500/30 rounded-full blur-3xl mix-blend-screen animate-gradient-x" />
      </div>
      <DogParallax variant="hero" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-16 lg:gap-12 lg:grid-cols-2 items-center">
          {/* Coluna texto */}
          <div className="relative z-10 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-blue-200/60 dark:border-slate-700 shadow-sm mb-6 reveal">
              <span className="w-2.5 h-2.5 bg-gradient-to-tr from-brand-500 to-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-brand-700 dark:text-indigo-300">Blockchain + Identidade Digital</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.05] mb-6 tracking-tight reveal max-w-xl">
              {t('hero.title').split(' ').map((word, index) => {
                const highlightIndex = 1;
                return index === highlightIndex ? (
                  <span key={index} className="relative inline-block">
                    <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-500 dark:from-indigo-400 dark:via-brand-400 dark:to-accent-400 bg-clip-text text-transparent drop-shadow-sm">{word}</span>
                    <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-gradient-to-r from-brand-300/40 to-accent-300/40 dark:from-indigo-500/30 dark:to-accent-500/30 blur-[2px]" aria-hidden="true" />
                  </span>
                ) : (
                  word + ' '
                );
              })}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl reveal delay-100">
              {t('hero.description')}
            </p>
            {/* CTA + busca */}
            <div className="space-y-5 reveal delay-200 max-w-xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-brand-600 via-petPurple-500 to-accent-500 bg-[length:200%_200%] animate-gradient-x hover:from-brand-500 hover:via-petPink-500 hover:to-accent-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-300/50 animate-glow-pulse">
                  <span className="inline-flex items-center gap-2">
                    {t('hero.registerButton')}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </button>
                <button className="px-8 py-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur text-blue-700 dark:text-indigo-200 font-medium rounded-full shadow-md border border-blue-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200/40">
                  {t('hero.learnMoreButton')}
                </button>
              </div>
              <div className="group flex items-center gap-3 bg-white/80 dark:bg-slate-800/60 backdrop-blur px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all w-full">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input placeholder={t('hero.searchPlaceholder', 'Busque o ID do seu pet')} aria-label={t('hero.searchPlaceholder', 'Busque o ID do seu pet')} className="bg-transparent flex-1 outline-none text-sm text-slate-600 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" />
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-petPink-500 to-petPurple-500 text-white font-semibold shadow-sm">Beta</span>
              </div>
            </div>
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 text-center reveal delay-300" aria-label="Indicadores de confiança">
              {[
                { value: '+100', label: t('hero.stats.pets') },
                { value: '+30', label: t('hero.stats.clinics') },
                { value: '+10K', label: t('hero.stats.transactions') },
              ].map((s, i) => (
                <div key={i} className="relative px-2 py-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-petPink-500/10 via-petPurple-500/10 to-petMint-500/10 pointer-events-none" />
                  <p className="relative text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-brand-600 via-petPurple-500 to-accent-500 dark:from-petPink-500 dark:via-petPurple-500 dark:to-petMint-500 bg-clip-text text-transparent drop-shadow">{s.value}</p>
                  <p className="text-[10px] md:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Coluna imagem */}
          <div className="relative order-1 lg:order-2 reveal">
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-300/40 via-indigo-200/20 to-transparent dark:from-indigo-500/30 rounded-[2.5rem] blur-2xl" />
              <div className="overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-blue-200/40 dark:ring-indigo-500/20 border border-white/40 dark:border-slate-700/40">
                <img
                  src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80"
                  alt="Cachorro feliz olhando para a câmera"
                  className="w-full h-[340px] md:h-[500px] object-cover"
                  loading="eager"
                  decoding="async"
                  sizes="(min-width:1024px) 520px, 90vw"
                  srcSet="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80 600w, https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80 900w, https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80 1200w"
                />
              </div>
              <div className="absolute -bottom-6 left-4 md:left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg p-4 w-48 border border-blue-100 dark:border-slate-700 hover:shadow-xl transition-all">
                <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 animate-pulse" />{t('hero.badge.nftIdentity.title')}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('hero.badge.nftIdentity.subtitle')}</p>
              </div>
              <div className="absolute top-6 -right-4 md:right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg p-4 w-48 border border-blue-100 dark:border-slate-700 hover:shadow-xl transition-all">
                <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-accent-500 to-pink-500 animate-pulse" />{t('hero.badge.secureHistory.title')}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('hero.badge.secureHistory.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
