import { useEffect } from 'react';

// Hook simples de parallax baseado em atributo data-parallax-speed
export function useParallax(selector = '[data-parallax]') {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      els.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.2;
        el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      });
    };

    // Usa requestAnimationFrame para performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [selector]);
}
