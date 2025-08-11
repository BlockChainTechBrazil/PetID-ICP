import React, { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "O que é o PetID?",
      answer: "PetID é uma plataforma descentralizada que utiliza a tecnologia blockchain para criar e gerenciar registros digitais de animais de estimação, garantindo autenticidade, segurança e imutabilidade das informações."
    },
    {
      question: "Como posso registrar meu pet?",
      answer: "Para registrar seu pet, conecte sua carteira digital, clique em 'Registrar Pet', preencha as informações solicitadas e envie o formulário. O registro será processado na blockchain do Internet Computer."
    },
    {
      question: "Quais informações posso armazenar?",
      answer: "Você pode armazenar informações básicas como nome, espécie, raça, idade, data de nascimento, fotos, histórico médico, vacinas, medicações, informações de microchip e muito mais."
    },
    {
      question: "É possível transferir a propriedade do pet?",
      answer: "Sim, o PetID permite a transferência de propriedade do pet para outro usuário de forma simples e transparente, registrando toda a transação na blockchain."
    },
    {
      question: "Quanto custa usar o PetID?",
      answer: "Durante o período de lançamento, o registro básico de pets é gratuito. Funcionalidades avançadas podem ter custos adicionais que serão claramente informados antes da utilização."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Encontre respostas para as perguntas mais comuns sobre o PetID e como ele pode ajudar você a cuidar melhor do seu pet.
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
