import DashboardLayout from '../componentes/profile/DashboardLayout';
import SidebarNav from '../componentes/profile/SidebarNav';
import NFTPetsPanel from '../componentes/profile/NFTPetsPanel';
import MapPanel from '../componentes/profile/MapPanel';
import GenealogyPanel from '../componentes/profile/GenealogyPanel';
import MedicalPanel from '../componentes/profile/MedicalPanel';
import CommunityPanel from '../componentes/profile/CommunityPanel';
import SettingsPanel from '../componentes/profile/SettingsPanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-500 to-petPurple-500 text-white shadow hover:shadow-md transition">{t('profile.sync')}</button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-surface-100 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-surface-200 transition">{t('profile.export')}</button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: t('profile.stats.totalPets'), value: 3, color: 'from-petPink-400 to-petPurple-500' },
          { label: t('profile.stats.upcomingEvents'), value: 2, color: 'from-emerald-400 to-teal-500' },
          { label: t('profile.stats.medicalPendings'), value: 1, color: 'from-amber-400 to-orange-500' },
          { label: t('profile.stats.partnerClinics'), value: 3, color: 'from-indigo-400 to-accent-500' },
        ].map(c => (
          <div key={c.label} className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-white/70 to-white/40 dark:from-surface-75/70 dark:to-surface-100/40 backdrop-blur group border border-gray-200 dark:border-surface-100">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r ${c.color} mix-blend-overlay`} />
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">{c.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">{c.value}</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300">{t('profile.stats.today')}</span>
            </div>
          </div>
        ))}
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
      case 'settings': return <SettingsPanel />;
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
          {['nfts', 'map', 'genealogy', 'medical', 'community', 'settings'].map(key => {
            const iconMap = { nfts: '🐾', map: '🗺️', genealogy: '🌳', medical: '💊', community: '💬', settings: '⚙️' };
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
