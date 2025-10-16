import { useMemo, useState } from 'react';
import { FiUser, FiHeart, FiMessageCircle, FiSend, FiPlus, FiCalendar, FiX } from 'react-icons/fi';
import { GiPawPrint } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';

const seedPosts = [
  { id: 1, user: 'Ana', avatar: 'user', type: 'event', title: 'Ibirapuera Park Walk', date: '2025-10-20', time: '09:30', location: 'Parque Ibirapuera - Portão 10', content: 'Let’s gather pets to socialize and play. Bring water and toys!', tags: ['walk', 'social'], likes: 2, comments: [] },
  { id: 2, user: 'Carlos', avatar: 'user', type: 'tip', title: 'Hydration in Winter', date: '2025-10-18', content: 'Even in cold weather, encourage your pet to drink water. Use flowing fountains.', tags: ['health'], likes: 1, comments: [] },
  { id: 3, user: 'Marina', avatar: 'paw', type: 'meetup', title: 'Puppy Socialization', date: '2025-10-17', content: 'Puppies learn a lot in the first months. Bring yours to interact.', tags: ['puppies', 'training'], likes: 0, comments: [] },
  { id: 4, user: 'Leo', avatar: 'paw', type: 'event', title: 'Vaccination Day', date: '2025-10-22', time: '14:00', location: 'VetCare Clinic - Room 3', content: 'Free vaccines for rescued pets. Bring documents if available.', tags: ['health', 'vaccination'], likes: 3, comments: [] },
  { id: 5, user: 'Sofia', avatar: 'user', type: 'event', title: 'Sunset Dog Run', date: '2025-10-22', time: '17:30', location: 'Beach Park - Track A', content: 'Light run with dogs. Water points every 500m.', tags: ['run', 'outdoor'], likes: 1, comments: [] },
];

const avatarIcon = (kind) => kind === 'paw' ? <GiPawPrint className="w-5 h-5" /> : <FiUser className="w-5 h-5" />;

const CommunityPanel = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState(seedPosts);
  // filtros e busca
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | post | tip | meetup | event
  const [tagFilter, setTagFilter] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [newEvent, setNewEvent] = useState({ title: '', content: '', date: '', time: '', tags: '', location: '' });
  const [commentInputs, setCommentInputs] = useState({});
  const [composer, setComposer] = useState(null); // null | 'post' | 'event'
  const [fabOpen, setFabOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const normTags = (str) => str.split(/[,#]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  const matches = (p) => {
    const s = search.trim().toLowerCase();
    const tagList = normTags(tagFilter);
    const text = `${p.title || ''} ${p.content || ''} ${p.location || ''}`.toLowerCase();
    const okSearch = !s || text.includes(s);
    const okType = typeFilter === 'all' || p.type === typeFilter;
    const okTags = tagList.length === 0 || (p.tags || []).some(tg => tagList.includes(String(tg).toLowerCase()));
    return okSearch && okType && okTags;
  };
  const filteredPosts = useMemo(() => posts.filter(matches), [posts, search, typeFilter, tagFilter]);
  const events = filteredPosts.filter(p => p.type === 'event');

  // Calendar state
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const addMonths = (base, n) => {
    const d = new Date(base);
    d.setMonth(d.getMonth() + n);
    return d;
  };
  const fmtISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const monthMatrix = () => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    const first = new Date(y, m, 1);
    const start = new Date(y, m, 1 - first.getDay()); // domingo início
    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const cur = new Date(start);
        cur.setDate(start.getDate() + (w * 7 + d));
        days.push({
          date: cur,
          inMonth: cur.getMonth() === m,
          iso: fmtISO(cur.getFullYear(), cur.getMonth(), cur.getDate())
        });
      }
      weeks.push(days);
    }
    return weeks;
  };

  const likePost = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const addComment = (id) => {
    const text = (commentInputs[id] || '').trim();
    if (!text) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...(p.comments || []), { id: Date.now(), user: 'You', text }] } : p));
    setCommentInputs(prev => ({ ...prev, [id]: '' }));
  };

  const createPost = (e) => {
    e.preventDefault();
    const title = newPost.title.trim();
    const content = newPost.content.trim();
    if (!title || !content) return;
    const tags = newPost.tags.split(',').map(s => s.trim()).filter(Boolean);
    const post = {
      id: Date.now(),
      user: t('chat.you', 'You'),
      avatar: 'user',
      type: 'post',
      title,
      date: new Date().toISOString().slice(0, 10),
      content,
      tags,
      likes: 0,
      comments: []
    };
    setPosts(prev => [post, ...prev]);
    setNewPost({ title: '', content: '', tags: '' });
    setComposer(null);
    setFabOpen(false);
  };

  const createEvent = (e) => {
    e.preventDefault();
    const title = newEvent.title.trim();
    const content = newEvent.content.trim();
    const date = (newEvent.date || '').trim();
    const time = (newEvent.time || '').trim();
    if (!title || !content || !date) return;
    const tags = newEvent.tags.split(',').map(s => s.trim()).filter(Boolean);
    const post = {
      id: Date.now(),
      user: t('chat.you', 'You'),
      avatar: 'paw',
      type: 'event',
      title,
      date,
      time,
      content,
      tags,
      location: newEvent.location,
      likes: 0,
      comments: []
    };
    setPosts(prev => [post, ...prev]);
    setNewEvent({ title: '', content: '', date: '', time: '', tags: '', location: '' });
    setComposer(null);
    setFabOpen(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Filtros & Busca */}
      <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('community.searchPlaceholder', 'Search posts and events...')}
          className="flex-1 rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full md:w-auto rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm text-gray-800 dark:text-slate-100"
        >
          <option value="all">{t('community.filter.all', 'All')}</option>
          <option value="post">{t('community.types.post', 'Post')}</option>
          <option value="tip">{t('community.types.tip', 'Tip')}</option>
          <option value="meetup">{t('community.types.meetup', 'Meetup')}</option>
          <option value="event">{t('community.types.event', 'Event')}</option>
        </select>
        <input
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          placeholder={t('community.tagPlaceholder', '#tag or multiple, separated')}
          className="w-full md:w-64 rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm"
        />
      </div>

      {/* FAB */}
      <div className="flex justify-end">
        <div className="relative">
          <button onClick={() => setFabOpen(o => !o)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-petPurple-500 to-brand-500 text-white px-4 py-2 shadow">
            <FiPlus className="w-5 h-5" /> {t('community.new', 'New')}
          </button>
          {fabOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-surface-100 bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10">
              <button onClick={() => { setComposer('post'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-slate-100">{t('community.newPost', 'New Post')}</button>
              <button onClick={() => { setComposer('event'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-slate-100 flex items-center gap-2"><FiCalendar className="w-4 h-4" />{t('community.newEvent', 'New Event')}</button>
            </div>
          )}
        </div>
      </div>

      {/* Composers condicionais */}
      {composer === 'post' && (
        <form onSubmit={createPost} className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{t('community.composeTitle', 'Share with the community')}</h3>
            <button type="button" onClick={() => { setComposer(null); setFabOpen(false); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-100"><FiX /></button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={newPost.title} onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder={t('community.titlePlaceholder', 'Title (e.g., Meetup, Tip, Adoption)')} className="rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm" />
            <input value={newPost.tags} onChange={(e) => setNewPost(p => ({ ...p, tags: e.target.value }))} placeholder={t('community.tagsPlaceholder', 'Tags (comma-separated): walk, adoption, health')} className="rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm" />
          </div>
          <textarea value={newPost.content} onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))} placeholder={t('community.contentPlaceholder', 'Write something helpful or invite others...')} rows={4} className="mt-3 w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm" />
          <div className="flex justify-end mt-3 gap-2">
            <button type="button" onClick={() => { setComposer(null); setFabOpen(false); }} className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm">{t('common.cancel', 'Cancel')}</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-petPurple-500 text-white text-sm shadow"><FiSend className="w-4 h-4" />{t('community.post', 'Post')}</button>
          </div>
        </form>
      )}

      {composer === 'event' && (
        <form onSubmit={createEvent} className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/80 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{t('community.newEvent', 'New Event')}</h3>
            <button type="button" onClick={() => { setComposer(null); setFabOpen(false); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-100"><FiX /></button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={newEvent.title} onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder={t('community.titlePlaceholder', 'Title (e.g., Meetup, Tip, Adoption)')} className="rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm" />
            <input type="date" value={newEvent.date} onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.value }))} className="rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm" />
            <input type="time" value={newEvent.time} onChange={(e) => setNewEvent(p => ({ ...p, time: e.target.value }))} className="rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm" />
            <input value={newEvent.location} onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder={t('community.location', 'Location (optional)')} className="rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm md:col-span-2" />
            <input value={newEvent.tags} onChange={(e) => setNewEvent(p => ({ ...p, tags: e.target.value }))} placeholder={t('community.tagsPlaceholder', 'Tags (comma-separated): walk, adoption, health')} className="rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm md:col-span-2" />
          </div>
          <textarea value={newEvent.content} onChange={(e) => setNewEvent(p => ({ ...p, content: e.target.value }))} placeholder={t('community.contentPlaceholder', 'Write something helpful or invite others...')} rows={4} className="mt-3 w-full rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-sm" />
          <div className="flex justify-end mt-3 gap-2">
            <button type="button" onClick={() => { setComposer(null); setFabOpen(false); }} className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm">{t('common.cancel', 'Cancel')}</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-petPurple-500 text-white text-sm shadow"><FiSend className="w-4 h-4" />{t('community.create', 'Create')}</button>
          </div>
        </form>
      )}

      {/* Calendário de eventos */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white inline-flex items-center gap-2"><FiCalendar /> {t('community.calendar', 'Events Calendar')}</h4>
            <div className="flex gap-1">
              <button onClick={() => setMonthCursor(prev => addMonths(prev, -1))} className="px-2 py-1 rounded-md bg-gray-900/80 text-white">‹</button>
              <button onClick={() => setMonthCursor(prev => addMonths(prev, +1))} className="px-2 py-1 rounded-md bg-gray-900/80 text-white">›</button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-2">{monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
          <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-400 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthMatrix().flat().map(({ date, inMonth, iso }) => {
              const dayEvents = events.filter(e => e.date === iso);
              return (
                <div key={iso + date.getDate()} className={`min-h-[56px] rounded-md p-1 ${inMonth ? 'bg-white/70 dark:bg-surface-100' : 'bg-transparent opacity-40'} border border-gray-100 dark:border-surface-100`}>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">{date.getDate()}</div>
                  <div className="mt-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map(ev => (
                      <button key={ev.id} onClick={() => setSelectedEvent(ev)} className="text-left text-[9px] px-1 py-0.5 rounded bg-petPink-400/20 text-petPink-200 hover:bg-petPink-400/30 truncate" title={ev.title}>
                        {ev.time ? `${ev.time} • ` : ''}{ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && <span className="text-[9px] text-gray-400">+{dayEvents.length - 2}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lista de eventos abaixo do calendário */}
          <div className="mt-4">
            <h5 className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">{t('community.eventsList', 'Scheduled Events')}</h5>
            <div className="space-y-2 max-h-56 overflow-auto pr-1">
              {events
                .slice()
                .sort((a, b) => `${a.date} ${a.time || '00:00'}`.localeCompare(`${b.date} ${b.time || '00:00'}`))
                .map(ev => (
                  <button key={ev.id} onClick={() => setSelectedEvent(ev)} className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 dark:bg-surface-100 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-surface-100/80">
                    <div className="text-xs font-medium">{ev.title}</div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400">{ev.date} {ev.time ? `• ${ev.time}` : ''}{ev.location ? ` • 📍 ${ev.location}` : ''}</div>
                  </button>
                ))}
              {events.length === 0 && (
                <div className="text-[11px] text-gray-400">{t('community.noEvents', 'No events found for the selected filters.')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {filteredPosts.map(p => (
            <div key={p.id} className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-petPurple-500 flex items-center justify-center text-white">{avatarIcon(p.avatar)}</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{p.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">{p.user} • {p.date}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-surface-100 text-gray-700 dark:text-slate-200`}>
                  {t(`community.types.${p.type}`, p.type)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 leading-relaxed">{p.content}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {p.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300">#{tag}</span>)}
                {p.location && (
                  <span className="text-[10px] px-2 py-1 rounded bg-petPurple-400/20 text-petPurple-100">📍 {p.location}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => likePost(p.id)} className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-300 hover:text-petPurple-600">
                  <FiHeart className="w-4 h-4" /> {t('community.like', 'Like')} • {p.likes || 0}
                </button>
                <span className="text-sm text-gray-400">{(p.comments || []).length} {t('community.comments', 'comments')}</span>
              </div>

              {/* Comments */}
              {p.comments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {p.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-surface-100 flex items-center justify-center text-gray-600">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div className="text-xs bg-gray-50 dark:bg-surface-100 px-3 py-2 rounded-lg">
                        <span className="font-medium mr-1">{c.user}:</span>
                        <span className="text-gray-700 dark:text-slate-300">{c.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <input
                  value={commentInputs[p.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                  placeholder={t('community.commentPlaceholder', 'Write a comment...')}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-xs"
                />
                <button onClick={() => addComment(p.id)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs">
                  <FiMessageCircle className="w-4 h-4" /> {t('community.comment', 'Comment')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {filteredPosts.map(p => (
          <div key={p.id} className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-petPurple-500 flex items-center justify-center text-white">{avatarIcon(p.avatar)}</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{p.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{p.user} • {p.date}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-surface-100 text-gray-700 dark:text-slate-200">
                {t(`community.types.${p.type}`, p.type)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 leading-relaxed">{p.content}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {p.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300">#{tag}</span>)}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => likePost(p.id)} className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-300 hover:text-petPurple-600">
                <FiHeart className="w-4 h-4" /> {t('community.like', 'Like')} • {p.likes || 0}
              </button>
              <span className="text-sm text-gray-400">{(p.comments || []).length} {t('community.comments', 'comments')}</span>
            </div>

            {/* Comments */}
            {p.comments?.length > 0 && (
              <div className="mt-3 space-y-2">
                {p.comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-surface-100 flex items-center justify-center text-gray-600">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <div className="text-xs bg-gray-50 dark:bg-surface-100 px-3 py-2 rounded-lg">
                      <span className="font-medium mr-1">{c.user}:</span>
                      <span className="text-gray-700 dark:text-slate-300">{c.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <input
                value={commentInputs[p.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                placeholder={t('community.commentPlaceholder', 'Write a comment...')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-surface-100 bg-white dark:bg-surface-75 px-3 py-2 text-xs"
              />
              <button onClick={() => addComment(p.id)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs">
                <FiMessageCircle className="w-4 h-4" /> {t('community.comment', 'Comment')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-surface-100/60 bg-white/40 dark:bg-surface-75/40 backdrop-blur p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('community.futureNote', 'Future: create, comment and like posts, plus a real-time feed.')}</p>
      </div>

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-surface-100 bg-white dark:bg-surface-75 p-5 shadow-xl">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t('community.eventDetails', 'Event Details')}</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-100"><FiX /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-gray-800 dark:text-slate-100">{selectedEvent.title}</div>
              <div className="text-gray-600 dark:text-slate-300">{selectedEvent.content}</div>
              <div className="text-gray-600 dark:text-slate-300">
                <span className="font-medium">{t('community.date', 'Date')}:</span> {selectedEvent.date} {selectedEvent.time ? `• ${selectedEvent.time}` : ''}
              </div>
              {selectedEvent.location && (
                <div className="text-gray-600 dark:text-slate-300"><span className="font-medium">{t('community.location', 'Location (optional)')}:</span> {selectedEvent.location}</div>
              )}
              {(selectedEvent.tags || []).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedEvent.tags.map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-1 rounded bg-gray-100 dark:bg-surface-100 text-gray-600 dark:text-slate-300">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">{t('document.close', 'Close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPanel;
