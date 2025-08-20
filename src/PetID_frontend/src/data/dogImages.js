// Centralização das imagens de cães e metadados.
// Facilita troca futura (CDN/IPFS) e reutilização em vários componentes.

import dog1 from '../assets/dogs/1.jpg';
import dog2 from '../assets/dogs/2.jpg';
import dog3 from '../assets/dogs/3.avif';
import dog4 from '../assets/dogs/4.jpg';
import dog5 from '../assets/dogs/5.jpg';
import dog6 from '../assets/dogs/6.jpeg';
import dog7 from '../assets/dogs/7.jpg';
import dog8 from '../assets/dogs/8.png';
import dog9 from '../assets/dogs/9.jpg';
import dog10 from '../assets/dogs/10.jpg';

export const dogImages = [
  { id: 1, src: dog1, alt: 'Cão 1' },
  { id: 2, src: dog2, alt: 'Cão 2' },
  { id: 3, src: dog3, alt: 'Cão 3' },
  { id: 4, src: dog4, alt: 'Cão 4' },
  { id: 5, src: dog5, alt: 'Cão 5' },
  { id: 6, src: dog6, alt: 'Cão 6' },
  { id: 7, src: dog7, alt: 'Cão 7' },
  { id: 8, src: dog8, alt: 'Cão 8' },
  { id: 9, src: dog9, alt: 'Cão 9' },
  { id: 10, src: dog10, alt: 'Cão 10' }
];

export default dogImages;
