import DashboardLayout from '../componentes/profile/DashboardLayout';
import SidebarNav from '../componentes/profile/SidebarNav';
import NFTPetsPanel from '../componentes/profile/NFTPetsPanel';
import MapPanel from '../componentes/profile/MapPanel';
import GenealogyPanel from '../componentes/profile/GenealogyPanel';
import MedicalPanel from '../componentes/profile/MedicalPanel';
import CommunityPanel from '../componentes/profile/CommunityPanel';
import ChatIAPanel from '../componentes/profile/ChatIAPanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiGitBranch, FiHeart, FiMessageCircle, FiCpu } from 'react-icons/fi';
import { GiPawPrint } from 'react-icons/gi';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('nfts');
  const { t } = useTranslation();

  const Header = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-petPurple-600 dark:from-brand-400 dark:to-accent-400 bg-clip-text text-transparent">{t('profile.dashboardTitle')}</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">{t('profile.dashboardSubtitle')}</p>
        </div>
      </div>
    </div>
  );

  const renderPanel = () => {
    switch (activeTab) {
      case 'nfts': return <NFTPetsPanel />;
      case 'map': return <MapPanel />;
      case 'genealogy': return <GenealogyPanel />;
      case 'medical': return <MedicalPanel />;
      case 'community': return <CommunityPanel />;
      case 'chat': return <ChatIAPanel />;
      default: return null;
    }
  };

  return (
    <div className="w-full mx-auto px-3 sm:px-4 pb-16 bg-gradient-to-b from-white via-surface-50 to-surface-100 dark:from-[#0b1220] dark:via-[#0b1220] dark:to-[#111a29] transition-colors">
      <DashboardLayout
        sidebar={<SidebarNav active={activeTab} onChange={setActiveTab} />}
        header={Header}
      >
        {renderPanel()}
      </DashboardLayout>
      {/* Mobile bottom nav */}
      <div className="fixed bottom-3 left-0 right-0 px-2 sm:px-3 flex justify-center lg:hidden z-40">
        <div className="flex w-full max-w-md gap-0.5 bg-white/90 dark:bg-surface-75/90 backdrop-blur-xl border border-gray-200 dark:border-surface-100 rounded-2xl p-1.5 shadow-lg">
          {['nfts', 'map', 'genealogy', 'medical', 'community', 'chat'].map(key => {
            const iconMap = {
              nfts: <GiPawPrint className="w-5 h-5" />,
              map: <FiMapPin className="w-5 h-5" />,
              genealogy: <FiGitBranch className="w-5 h-5" />,
              medical: <FiHeart className="w-5 h-5" />,
              community: <FiMessageCircle className="w-5 h-5" />,
              chat: <FiCpu className="w-5 h-5" />
            };
            const active = activeTab === key;
            return (
              <button
                key={key}
                aria-label={t(`profile.tabs.${key}`)}
                onClick={() => setActiveTab(key)}
                className={`flex-1 basis-0 flex items-center justify-center rounded-xl py-2 text-lg transition relative ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'} ${active ? 'bg-gradient-to-r from-brand-500 to-petPurple-500 shadow' : 'hover:bg-gray-100 dark:hover:bg-surface-100'}`}
              >
                <span>{iconMap[key]}</span>
                {active && <span className="absolute -top-1 right-1 h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
