import { useTranslation } from 'react-i18next';
import { FaInstagram } from 'react-icons/fa';
import PetIDLogo from '../assets/logo/logo.jpg';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 dark:bg-gradient-to-b dark:from-surface-100 dark:via-surface-75 dark:to-surface-100 text-white py-12 border-t border-gray-800 dark:border-surface-200 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-gradient-to-br from-petPurple-500/25 via-petPink-500/25 to-petMint-500/25 blur-3xl rounded-full opacity-70" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-gradient-to-tr from-petMint-500/20 via-petPurple-500/20 to-transparent blur-3xl rounded-full opacity-60" />
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src={PetIDLogo} alt="PetID Logo" className="h-10 w-10 mr-2 rounded-lg" />
              <span className="text-2xl font-bold text-white">PetID</span>
            </div>
            <p className="text-gray-400 dark:text-slate-300">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white/90 transition-colors focus:outline-none focus:text-white/90">{t('footer.registerPet')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.searchPet')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.transferOwnership')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.medicalHistory')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">{t('footer.about')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.mission')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.team')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.partners')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.support')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.partnerships')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.instagram.com/petid__?igsh=MW42NG50NnR5NXV5dQ==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white/90 transition-colors">
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-surface-200/60 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Blockchain Tech Brazil. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
