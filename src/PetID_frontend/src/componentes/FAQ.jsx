import { useState } from 'react';
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
    <section className="py-20 bg-white dark:bg-gradient-to-b dark:from-surface-75 dark:via-surface-100 dark:to-surface-75 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-10 w-72 h-72 bg-gradient-to-br from-petPurple-500/25 via-petPink-500/25 to-petMint-500/25 blur-3xl rounded-full opacity-70" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-petMint-500/20 via-petPurple-500/20 to-transparent blur-3xl rounded-full opacity-60" />
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('faq.title')}</h2>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            {t('faq.description')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border border-gray-100 dark:border-surface-200 rounded-xl px-4 bg-white/70 dark:bg-surface-100/80 backdrop-blur shadow-sm hover:shadow-md transition">
              <button
                className="w-full text-left flex justify-between items-center py-4"
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
                <span className="text-brand-600 dark:text-petPink-500 text-xl font-bold">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="pb-4 -mt-2 text-gray-600 dark:text-slate-200 border-t border-gray-200 dark:border-surface-200 pt-4">
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
