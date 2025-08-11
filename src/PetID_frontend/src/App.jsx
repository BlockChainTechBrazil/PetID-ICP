import React from 'react';
import { PetID_backend } from 'declarations/PetID_backend';
import NavBar from './componentes/NavBar';
import Hero from './componentes/Hero';
import Features from './componentes/Features';
import HowItWorks from './componentes/HowItWorks';
import FAQ from './componentes/FAQ';
import PetForm from './componentes/PetForm';
import Footer from './componentes/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <PetForm />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
