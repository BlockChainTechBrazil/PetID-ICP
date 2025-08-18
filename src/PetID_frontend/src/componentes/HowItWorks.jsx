import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      key: "connectWallet",
      title: t('howItWorks.steps.connectWallet.title'),
      description: t('howItWorks.steps.connectWallet.description')
    },
    {
      number: "02",
      key: "registerPet",
      title: t('howItWorks.steps.registerPet.title'),
      description: t('howItWorks.steps.registerPet.description')
    },
    {
      number: "03",
      key: "addMedicalHistory",
      title: t('howItWorks.steps.addMedicalHistory.title'),
      description: t('howItWorks.steps.addMedicalHistory.description')
    },
    {
      number: "04",
      key: "accessAnytime",
      title: t('howItWorks.steps.accessAnytime.title'),
      description: t('howItWorks.steps.accessAnytime.description')
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-brand-50 via-white to-accent-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 right-10 w-40 h-40 bg-brand-200/40 dark:bg-brand-600/30 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-4 w-56 h-56 bg-accent-200/40 dark:bg-accent-500/30 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5">
            <span className="bg-gradient-to-r from-accent-500 via-brand-600 to-brand-500 dark:from-accent-400 dark:via-indigo-400 dark:to-brand-400 bg-clip-text text-transparent">
              {t('howItWorks.title')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            {t('howItWorks.description')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <div key={step.key} className="relative group">
              <div className="h-full rounded-2xl bg-white/80 dark:bg-slate-800/60 backdrop-blur px-6 py-8 shadow-soft border border-brand-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-500 transition-all flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-brand-600 dark:text-indigo-300 tracking-wide">Step {step.number}</span>
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 dark:from-indigo-500 dark:to-accent-400 text-white flex items-center justify-center font-bold shadow">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-snug">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed flex-1">{step.description}</p>
                <div className="mt-6 text-brand-600 dark:text-indigo-400 text-sm font-medium flex items-center">
                  <span className="group-hover:translate-x-1 transition-transform">Detalhes</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 text-brand-300 dark:text-slate-600">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
