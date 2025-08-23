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
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 relative">
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5">
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 dark:from-indigo-400 dark:via-brand-400 dark:to-accent-400 bg-clip-text text-transparent">
              {t('features.title')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            {t('features.description')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.key}
              className="group relative rounded-2xl bg-white/80 dark:bg-gradient-to-br dark:from-slate-800/70 dark:via-slate-800/40 dark:to-slate-900/70 backdrop-blur px-4 sm:px-6 py-6 sm:py-8 shadow-soft border border-brand-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-petPurple-500/60 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-brand-50 via-accent-50 to-white dark:from-petPurple-500/10 dark:via-petPink-500/10 dark:to-petMint-500/10" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl sm:text-4xl drop-shadow-sm animate-wiggle-slow flex-shrink-0">{feature.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-snug bg-gradient-to-r from-brand-600 to-accent-500 dark:from-petPink-500 dark:to-petPurple-500 bg-clip-text text-transparent">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
