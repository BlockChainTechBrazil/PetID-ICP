import { useEffect } from 'react';

// Hook para revelar elementos com a classe `.reveal` quando entram na viewport
// Problema anterior: elementos lazy carregados após o primeiro querySelectorAll não eram observados ⇒ ficavam invisíveis.
// Solução: usar MutationObserver para detectar novos nós e registrá‑los no IntersectionObserver.
export function useScrollReveal(selector = '.reveal', options = {}) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = reduce
      ? null
      : new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -5% 0px', ...options }
      );

    const observeElement = el => {
      if (!el || !(el instanceof HTMLElement)) return;
      if (!el.classList.contains('reveal')) return;
      if (el.classList.contains('reveal-visible')) return; // já visível
      if (reduce) {
        el.classList.add('reveal-visible');
      } else {
        io.observe(el);
      }
    };

    // Observar elementos existentes inicialmente
    document.querySelectorAll(selector).forEach(observeElement);

    // MutationObserver para pegar elementos adicionados dinamicamente (lazy / roteamento)
    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // Se o próprio nó tem a classe
            observeElement(node);
            // E também qualquer descendente com a classe
            node.querySelectorAll?.(selector).forEach(observeElement);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, [selector, options]);
}
