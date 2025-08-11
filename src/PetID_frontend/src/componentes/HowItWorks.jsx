import React from 'react';
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
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('howItWorks.title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('howItWorks.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md h-full">
                <div className="text-4xl font-bold text-blue-500 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform translate-x-1/2">
                  <div className="text-blue-300 text-4xl">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
