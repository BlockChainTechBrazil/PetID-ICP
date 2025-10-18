import { useTranslation } from 'react-i18next';
import { FiMapPin, FiGitBranch, FiHeart, FiMessageCircle, FiSettings, FiCpu } from 'react-icons/fi';
import { GiPawPrint } from 'react-icons/gi';

const navItemsBase = [
  { key: 'nfts', icon: <GiPawPrint className="w-6 h-6" /> }, // Ajustei o tamanho para 6x6
  { key: 'map', icon: <FiMapPin className="w-5 h-5" /> },
  { key: 'genealogy', icon: <FiGitBranch className="w-5 h-5" /> },
  { key: 'medical', icon: <FiHeart className="w-5 h-5" /> },
  { key: 'community', icon: <FiMessageCircle className="w-5 h-5" /> },
  { key: 'ia', icon: <FiCpu className="w-5 h-5" /> }, // ✅ Adicionado aba IA
  // { key: 'settings', icon: <FiSettings className="w-5 h-5" /> }, // Ocultado conforme solicitado
];

const SidebarNav = ({ active, onChange }) => {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItemsBase.map(item => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition relative overflow-hidden
              ${active === item.key ? 'bg-gradient-to-r from-brand-500/90 to-petPurple-500/90 text-white shadow-inner' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-surface-100'}`}
        >
          <span className="text-lg leading-none flex items-center">{item.icon}</span>
          <span>{t(`profile.tabs.${item.key}`)}</span>
        </button>
      ))}
    </nav>
  );
};

export default SidebarNav;
