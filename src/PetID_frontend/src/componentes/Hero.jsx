import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dogAndCat from "../assets/dogs/Dog_nd_cat_1.jpg"

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/login');
  };

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
  
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-16 lg:gap-12 lg:grid-cols-2 items-center">
          {/* Coluna texto */}
          <div className="relative z-10 order-2 lg:order-1 px-2 sm:px-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-blue-200/60 dark:border-slate-700 shadow-sm mb-6 reveal">
              <span className="w-2.5 h-2.5 bg-gradient-to-tr from-brand-500 to-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-brand-700 dark:text-indigo-300">{t('hero.badge.blockchainIdentity')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.05] mb-6 tracking-tight reveal max-w-xl">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl reveal delay-100">
              {t('hero.description')}
            </p>
            {/* CTA + busca */}
            <div className="space-y-5 reveal delay-200 max-w-xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleRegisterClick}
                  className="group px-8 py-4 bg-gradient-to-r from-brand-600 via-petPurple-500 to-accent-500 bg-[length:200%_200%] animate-gradient-x hover:from-brand-500 hover:via-petPink-500 hover:to-accent-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-300/50 animate-glow-pulse"
                >
                  <span className="inline-flex items-center gap-2">
                    {t('hero.registerButton')}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </button>
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
          <div className="relative order-1 lg:order-2 reveal mx-12 sm:mx-0">
            <div className="relative w-full max-w-[200px] sm:max-w-md lg:max-w-xl mx-auto">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-300/40 via-indigo-200/20 to-transparent dark:from-indigo-500/30 rounded-[1rem] sm:rounded-[2.5rem] lg:rounded-[3rem] blur-lg" />
              <div className="overflow-hidden rounded-[1rem] sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl ring-1 ring-blue-200/40 dark:ring-indigo-500/20 border border-white/40 dark:border-slate-700/40">
                <img 
                  src={dogAndCat} 
                  alt="Cachorro e gato juntos - PetID" 
                  className="w-full h-[200px] sm:h-[380px] md:h-[420px] lg:h-[480px] object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
