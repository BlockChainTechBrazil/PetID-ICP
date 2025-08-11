import React from 'react';

const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Registro <span className="text-blue-500">descentralizado</span> para seus pets
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              A PetID utiliza a tecnologia blockchain para criar registros imutáveis e seguros para seus animais de estimação, garantindo que suas informações estejam sempre acessíveis e protegidas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full shadow-lg transition-all duration-200">
                Registre seu Pet
              </button>
              <button className="px-8 py-3 bg-white hover:bg-gray-100 text-blue-500 font-medium rounded-full shadow-md border border-blue-200 transition-all duration-200">
                Saiba mais
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1587559070757-d27e856b22e4?q=80&w=1000" 
              alt="Cachorro feliz" 
              className="rounded-2xl shadow-xl w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
