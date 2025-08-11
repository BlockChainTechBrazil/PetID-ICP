import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      key: "whatIs",
      question: t('faq.questions.whatIs.question'),
      answer: t('faq.questions.whatIs.answer')
    },
    {
      key: "howToRegister",
      question: t('faq.questions.howToRegister.question'),
      answer: t('faq.questions.howToRegister.answer')
    },
    {
      key: "whatInfo",
      question: t('faq.questions.whatInfo.question'),
      answer: t('faq.questions.whatInfo.answer')
    },
    {
      key: "transferOwnership",
      question: t('faq.questions.transferOwnership.question'),
      answer: t('faq.questions.transferOwnership.answer')
    },
    {
      key: "howMuch",
      question: t('faq.questions.howMuch.question'),
      answer: t('faq.questions.howMuch.answer')
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('faq.title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('faq.description')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border-b border-gray-200 pb-4">
              <button 
                className="w-full text-left flex justify-between items-center py-4"
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-xl font-semibold text-gray-900">{faq.question}</h3>
                <span className="text-blue-500 text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="pb-4 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
