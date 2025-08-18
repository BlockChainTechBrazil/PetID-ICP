
// Parallax de cães; variant 'hero' usa imagens menores e posicionamento fora do texto
const baseDogs = {
  hero: [
    { src: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=500&q=70', speed: 0.05, className: 'w-36 md:w-44 top-[-30px] left-[5%] rotate-[-4deg]' },
    { src: 'https://images.unsplash.com/photo-1557970876-3ef1c6172677?auto=format&fit=crop&w=500&q=70', speed: 0.1, className: 'w-40 md:w-52 top-[140px] right-[4%] rotate-[6deg]' },
    { src: 'https://images.unsplash.com/photo-1517865289-95c1dfeaf5f3?auto=format&fit=crop&w=500&q=70', speed: 0.16, className: 'w-32 md:w-40 bottom-[40px] left-[55%] rotate-[3deg]' }
  ]
};

const DogParallax = ({ variant = 'hero' }) => {
  const dogs = baseDogs[variant] || [];
  return (
    <div className="pointer-events-none select-none absolute inset-0 z-[1]" aria-hidden="true">
      {dogs.map((d, i) => (
        <div key={i} data-parallax data-parallax-speed={d.speed} className={`hidden md:block absolute ${d.className} drop-shadow-xl transition-transform duration-700 ease-out will-change-transform`}>
          <img src={d.src} alt="Dog" className="rounded-2xl shadow-xl ring-2 ring-white/40 dark:ring-slate-700/60 border border-white/30 dark:border-slate-600/40 backdrop-blur-lg" loading="lazy" />
        </div>
      ))}
    </div>
  );
};

export default DogParallax;
