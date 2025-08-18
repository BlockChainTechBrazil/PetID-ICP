import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-brand-700 dark:from-petPurple-500 dark:via-petPink-500 dark:to-petMint-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),transparent),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.7),transparent)] dark:opacity-10" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6 reveal">{t('cta.title')}</h2>
          <p className="text-lg md:text-xl mb-10 text-blue-100 dark:text-white/90 reveal delay-100">{t('cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center reveal delay-200">
            <Link to="/perfil" className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 dark:text-brand-600">{t('cta.primaryButton')}</Link>
            <a href="#faq" className="px-10 py-4 bg-blue-500/30 dark:bg-white/15 backdrop-blur rounded-full font-medium border border-white/40 dark:border-white/20 hover:bg-blue-500/40 dark:hover:bg-white/25 transition-all">{t('cta.secondaryButton')}</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
