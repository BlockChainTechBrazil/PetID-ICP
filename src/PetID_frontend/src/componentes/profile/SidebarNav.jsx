
import { useTranslation } from 'react-i18next';

const navItemsBase = [
  { key: 'nfts', icon: '🐾' },
  { key: 'map', icon: '🗺️' },
  { key: 'genealogy', icon: '🌳' },
  { key: 'medical', icon: '💊' },
  { key: 'community', icon: '💬' },
  { key: 'settings', icon: '⚙️' },
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
          <span className="text-lg leading-none">{item.icon}</span>
          <span>{t(`profile.tabs.${item.key}`)}</span>
        </button>
      ))}
    </nav>
  );
};

export default SidebarNav;
