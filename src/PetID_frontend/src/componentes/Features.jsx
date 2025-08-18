import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: "🔒",
      key: "secureRegistry",
      title: t('features.secureRegistry.title'),
      description: t('features.secureRegistry.description')
    },
    {
      icon: "🔄",
      key: "simpleTransfer",
      title: t('features.simpleTransfer.title'),
      description: t('features.simpleTransfer.description')
    },
    {
      icon: "📱",
      key: "universalAccess",
      title: t('features.universalAccess.title'),
      description: t('features.universalAccess.description')
    },
    {
      icon: "📋",
      key: "completeHistory",
      title: t('features.completeHistory.title'),
      description: t('features.completeHistory.description')
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-brand-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute -top-8 -left-8 w-64 h-64 bg-accent-200/40 dark:bg-accent-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-12 w-72 h-72 bg-brand-200/40 dark:bg-brand-600/30 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5">
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 dark:from-indigo-400 dark:via-brand-400 dark:to-accent-400 bg-clip-text text-transparent">
              {t('features.title')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            {t('features.description')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.key}
              className="group relative rounded-2xl bg-white/80 dark:bg-slate-800/60 backdrop-blur px-6 py-8 shadow-soft border border-brand-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-500 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-brand-50 via-accent-50 to-white dark:from-slate-800/40 dark:via-slate-800/20 dark:to-slate-900" />
              <div className="relative">
                <div className="text-4xl mb-5 drop-shadow-sm">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 leading-snug">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
              <div className="mt-6 flex items-center text-brand-600 dark:text-indigo-400 text-sm font-medium">
                <span className="group-hover:translate-x-1 transition-transform">Saiba mais</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
