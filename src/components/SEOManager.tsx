import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const SEO_TRANSLATIONS = {
  pt: {
    title: 'PetID - Identidade Digital para seus Pets no ICP',
    description: 'PetID é uma plataforma descentralizada que cria identidades digitais únicas e seguras para animais usando Internet Computer Protocol (ICP). Registre, gerencie e proteja seus pets com autenticação Internet Identity.',
    keywords: 'pet, blockchain, ICP, Internet Computer, identidade digital, animais, descentralizado, crypto, internet identity, motoko, brasil'
  },
  en: {
    title: 'PetID - Digital Identity for Your Pets on ICP',
    description: 'PetID is a decentralized platform that creates unique and secure digital identities for pets using Internet Computer Protocol (ICP). Register, manage and protect your pets with Internet Identity authentication.',
    keywords: 'pet, blockchain, ICP, Internet Computer, digital identity, pets, decentralized, crypto, internet identity, motoko'
  },
  es: {
    title: 'PetID - Identidad Digital para tus Mascotas en ICP',
    description: 'PetID es una plataforma descentralizada que crea identidades digitales únicas y seguras para mascotas usando Internet Computer Protocol (ICP). Registra, gestiona y protege tus mascotas con autenticación Internet Identity.',
    keywords: 'mascota, blockchain, ICP, Internet Computer, identidad digital, mascotas, descentralizado, crypto, internet identity, motoko, españa'
  }
};

function SEOManager() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language as keyof typeof SEO_TRANSLATIONS;
    const seoData = SEO_TRANSLATIONS[currentLang] || SEO_TRANSLATIONS.en;

    // Update document title
    document.title = seoData.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seoData.description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seoData.keywords);
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seoData.title);
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', seoData.description);
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', seoData.title);
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', seoData.description);
    }

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;

  }, [i18n.language]);

  return null; // Este componente não renderiza nada
}

export default SEOManager;
