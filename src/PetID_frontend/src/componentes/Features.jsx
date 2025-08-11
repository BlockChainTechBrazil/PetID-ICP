import React from 'react';
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('features.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
