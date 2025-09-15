import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSettings } from 'react-icons/fi';

const SettingsPanel = () => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('User Demo');
  const [email, setEmail] = useState('user@example.com');
  const [emailNoti, setEmailNoti] = useState(true);
  const [pushNoti, setPushNoti] = useState(false);
  const [themePref, setThemePref] = useState(localStorage.getItem('theme') || 'dark');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) {
      const to = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(to);
    }
  }, [saved]);

  const save = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('pref_name', name);
      localStorage.setItem('pref_emailNoti', String(emailNoti));
      localStorage.setItem('pref_pushNoti', String(pushNoti));
      localStorage.setItem('theme', themePref);
      document.documentElement.classList.toggle('dark', themePref === 'dark');
      setSaving(false);
      setSaved(true);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/70 backdrop-blur p-6 md:p-8 shadow-sm w-full space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiSettings className="w-5 h-5" /> {t('profile.settings.title')}
          </h2>
          <p className="text-[11px] md:text-xs text-gray-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">{t('profile.settings.apiKeyHint')}</p>
        </div>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-500 to-petPurple-500 text-white shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
          {saving && <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />}
          {saved ? t('profile.settings.saved') : t('profile.settings.save')}
        </button>
      </div>

      {/* Sections Grid */}
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full">
        {/* Account Info */}
        <div className="rounded-xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-100/40 backdrop-blur p-5 space-y-5 shadow-sm w-full h-full flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{t('profile.settings.accountInfo')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600 dark:text-slate-300">
              {t('profile.settings.name')}
              <input value={name} onChange={e => setName(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-surface-100 bg-white/70 dark:bg-surface-100/60 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600 dark:text-slate-300">
              {t('profile.settings.email')}
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="px-3 py-2 rounded-lg border border-gray-300 dark:border-surface-100 bg-white/70 dark:bg-surface-100/60 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
            </label>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-slate-300">
            <span>{t('profile.settings.internetIdentity')}:</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-surface-100 text-[10px] font-medium">{t('profile.settings.notConnected')}</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-100/40 backdrop-blur p-5 space-y-5 shadow-sm w-full h-full flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{t('profile.settings.notifications')}</h3>
          <div className="flex flex-col gap-3 text-xs md:text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={emailNoti} onChange={e => setEmailNoti(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
              <span className="text-gray-700 dark:text-slate-300">{t('profile.settings.emailNotifications')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={pushNoti} onChange={e => setPushNoti(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
              <span className="text-gray-700 dark:text-slate-300">{t('profile.settings.pushNotifications')}</span>
            </label>
          </div>
          <div className="rounded-xl border border-red-200 dark:border-red-400/30 bg-red-50/70 dark:bg-red-500/10 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-red-700 dark:text-red-300">{t('profile.settings.dangerZone')}</h4>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-red-600 dark:text-red-300 font-medium">{t('profile.settings.deleteDisabled')}</span>
              <button type="button" disabled className="px-3 py-1.5 rounded-lg bg-red-500/50 text-white text-[11px] font-semibold cursor-not-allowed">{t('profile.settings.deleteAccount')}</button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-100/40 backdrop-blur p-5 space-y-5 shadow-sm w-full h-full flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{t('profile.settings.preferences')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] md:text-sm">
            <label className="flex flex-col gap-1 font-medium text-gray-600 dark:text-slate-300">
              {t('profile.settings.theme')}
              <select value={themePref} onChange={e => setThemePref(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-surface-100 bg-white/70 dark:bg-surface-100/60 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="light">{t('profile.settings.light')}</option>
                <option value="dark">{t('profile.settings.dark')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 font-medium text-gray-600 dark:text-slate-300">
              {t('profile.settings.language')}
              <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-surface-100 bg-white/70 dark:bg-surface-100/60 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
