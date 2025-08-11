import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Conecte sua carteira",
      description: "Conecte sua carteira digital compatível com ICP para começar a usar os serviços PetID."
    },
    {
      number: "02",
      title: "Cadastre seu pet",
      description: "Preencha as informações do seu pet, incluindo nome, espécie, raça, idade e foto."
    },
    {
      number: "03",
      title: "Adicione histórico médico",
      description: "Inclua informações sobre vacinas, medicações, consultas e outras informações de saúde."
    },
    {
      number: "04",
      title: "Acesse quando precisar",
      description: "As informações estarão sempre disponíveis quando você precisar, de forma segura e confiável."
    }
  ];

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Registrar e gerenciar as informações do seu pet nunca foi tão fácil e seguro.
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
