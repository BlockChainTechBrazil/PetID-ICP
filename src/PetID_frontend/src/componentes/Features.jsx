import React from 'react';

const Features = () => {
  const features = [
    {
      icon: "🔒",
      title: "Registro Seguro",
      description: "Informações armazenadas de forma segura na blockchain, garantindo autenticidade e imutabilidade."
    },
    {
      icon: "🔄",
      title: "Transferência Simples",
      description: "Transferência de propriedade do pet de forma transparente e sem burocracia."
    },
    {
      icon: "📱",
      title: "Acesso Universal",
      description: "Acesse as informações do seu pet de qualquer dispositivo com conexão à internet."
    },
    {
      icon: "📋",
      title: "Histórico Completo",
      description: "Mantenha todo o histórico médico e de vacinação do seu pet em um único lugar."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Por que escolher o PetID?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma oferece soluções inovadoras para o registro e gerenciamento das informações do seu pet com a segurança da tecnologia blockchain.
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
