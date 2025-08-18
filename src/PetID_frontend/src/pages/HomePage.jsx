import { Suspense, lazy } from 'react';
import Hero from '../componentes/Hero';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useParallax } from '../hooks/useParallax';
const Features = lazy(() => import('../componentes/Features'));
const HowItWorks = lazy(() => import('../componentes/HowItWorks'));
const PetForm = lazy(() => import('../componentes/PetForm'));
const FAQ = lazy(() => import('../componentes/FAQ'));
const GallerySection = lazy(() => import('../componentes/GallerySection'));
const FinalCTA = lazy(() => import('../componentes/FinalCTA'));
const Footer = lazy(() => import('../componentes/Footer'));

function HomePage() {
  useScrollReveal();
  useParallax();
  return (
    <>
      <div className="reveal relative"><Hero /></div>
      <Suspense fallback={<div className="py-16 text-center text-slate-500">Carregando...</div>}>
        <div className="reveal"><Features /></div>
        <div className="reveal"><HowItWorks /></div>
        <div className="reveal"><GallerySection /></div>
        <div className="reveal"><PetForm /></div>
        <div id="faq" className="reveal"><FAQ /></div>
        <div className="reveal"><FinalCTA /></div>
        <div className="reveal"><Footer /></div>
      </Suspense>
    </>
  );
}

export default HomePage;
