
import { dogImages } from '../data/dogImages';

// Seleciona algumas imagens distintas para efeitos de parallax
const selected = [dogImages[0], dogImages[3], dogImages[6]].filter(Boolean);

// Config de posições por variante
const baseDogs = {
  hero: [
    { src: selected[0]?.src, speed: 0.1, className: 'w-36 md:w-44 top-[250px] left-[5%] rotate-[-4deg]' },
    { src: selected[1]?.src, speed: 0.1, className: 'w-40 md:w-52 top-[140px] right-[4%] rotate-[6deg]' },
    { src: selected[2]?.src, speed: 0.16, className: 'w-32 md:w-40 bottom-[40px] left-[65%] rotate-[3deg]' }
  ]
};

const DogParallax = ({ variant = 'hero' }) => {
  const dogs = baseDogs[variant] || [];
  const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" rx="24" fill="%23e0e7ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%235256a3">PetID</text></svg>';
  return (
    <div className="pointer-events-none select-none absolute inset-0 z-[1]" aria-hidden="true">
      {dogs.map((d, i) => (
        <div key={i} data-parallax data-parallax-speed={d.speed} className={`hidden md:block absolute ${d.className} drop-shadow-xl transition-transform duration-700 ease-out will-change-transform`}>
          <img
            src={d.src}
            alt="Cão decorativo"
            className="rounded-2xl shadow-xl ring-2 ring-white/40 dark:ring-petPurple-500/40 border border-white/30 dark:border-petPink-500/30 backdrop-blur-lg animate-float-soft"
            loading="lazy"
            decoding="async"
            width={300}
            height={200}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
          />
        </div>
      ))}
    </div>
  );
};

export default DogParallax;
