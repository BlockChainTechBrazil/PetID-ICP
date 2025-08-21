import { Suspense, lazy, useEffect, useState } from 'react';
import Hero from '../componentes/Hero';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useParallax } from '../hooks/useParallax';
const Features = lazy(() => import('../componentes/Features'));
const HowItWorks = lazy(() => import('../componentes/HowItWorks'));
const FAQ = lazy(() => import('../componentes/FAQ'));
const GallerySection = lazy(() => import('../componentes/GallerySection'));
const FinalCTA = lazy(() => import('../componentes/FinalCTA'));
const Footer = lazy(() => import('../componentes/Footer'));

function HomePage() {
  useScrollReveal();
  useParallax();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowTop(y > 480);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <>
      <div className="reveal relative"><Hero /></div>
      <Suspense fallback={<div className="py-16 text-center text-slate-500">Carregando...</div>}>
        <div className="reveal"><Features /></div>
        <div className="reveal"><HowItWorks /></div>
        <div className="reveal"><GallerySection /></div>
        <div id="faq" className="reveal"><FAQ /></div>
        <div className="reveal"><FinalCTA /></div>
        <div className="reveal"><Footer /></div>
      </Suspense>
      {/* Botão flutuante voltar ao topo */}
      <button
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
        className={`fixed bottom-6 right-6 z-50 rounded-full p-3 md:p-4 shadow-lg ring-1 ring-indigo-300/40 dark:ring-indigo-500/30 border border-white/40 dark:border-slate-700/50 bg-gradient-to-br from-brand-600 via-indigo-600 to-accent-500 text-white transition-all duration-300 hover:shadow-2xl hover:from-brand-500 hover:to-accent-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/40 dark:focus-visible:ring-indigo-500/40 backdrop-blur ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}

export default HomePage;
