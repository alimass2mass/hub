import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Compass, Film, Search, Bell, MessageSquare, Hash, PlusSquare, User as UserIcon, LogOut, CheckCircle2, ShieldCheck, Gamepad2 } from 'lucide-react';
import { User, AppNotification } from '../types';
import { useLanguage } from './LanguageContext';

interface LayoutProps {
  user: User | null;
  notifications: AppNotification[];
  onLogout: () => void;
  onQuickSwitchAccount?: (username: string) => void;
  children: React.ReactNode;
}

export default function Layout({ user, notifications, onLogout, onQuickSwitchAccount, children }: LayoutProps) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const { t, isRtl } = useLanguage();

  interface NavItem {
    to: string;
    icon: any;
    label: string;
    badge?: number;
  }

  const NAV_ITEMS: NavItem[] = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/explore', icon: Compass, label: t('nav.explore') },
    { to: '/reels', icon: Film, label: t('nav.reels') },
    { to: '/search', icon: Search, label: t('nav.search') },
    { to: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadCount },
    { to: '/messages', icon: MessageSquare, label: t('nav.messages') },
    { to: '/channels', icon: Hash, label: t('nav.channels') },
    { to: '/games', icon: Gamepad2, label: isRtl ? 'ألعاب المهندسين 🎮' : 'Engineer Games' },
    { to: '/create', icon: PlusSquare, label: t('nav.create') },
    { to: `/profile/${user?.username || ''}`, icon: UserIcon, label: t('nav.profile') }
  ];

  const adminItem: NavItem[] = user?.email === 'alisaifaldeen12@gmail.com'
    ? [{ to: '/admin', icon: ShieldCheck, label: t('nav.admin') }]
    : [];

  const visibleNavItems: NavItem[] = [...NAV_ITEMS, ...adminItem];

  return (
    <div className={`min-h-screen bg-dark-bg text-dark-text flex flex-col md:flex-row antialiased ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Desktop Left Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 bg-dark-card ${isRtl ? 'border-l' : 'border-r'} border-dark-border h-screen sticky top-0 p-5 flex-shrink-0 z-30`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-3 py-4 mb-6">
          <img src="/logo.png" alt="Logo" referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover shadow-lg border border-dark-border" />
          <div className="flex flex-col">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-brand-primary to-brand-secondary text-lg font-heading leading-tight">
              ChemicalEngineersHub
            </span>
            <span className="text-[9px] text-dark-muted font-medium leading-none mt-1">الهيئة العامة للمهندسين الكيميائيين بالبصرة</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group text-sm font-semibold ${
                    isActive
                      ? `bg-brand-primary/10 text-brand-primary ${isRtl ? 'border-r-4 border-brand-primary' : 'border-l-4 border-brand-primary'}`
                      : 'text-dark-muted hover:bg-dark-border/40 hover:text-dark-text'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center justify-center min-w-5">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile segment at bottom */}
        {user && (
          <div className="mt-auto border-t border-dark-border pt-4 space-y-3">
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-border/40 transition-colors"
            >
              <img
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={user.fullName}
                className="w-10 h-10 rounded-xl object-cover border border-dark-border"
              />
              <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs truncate">{user.fullName}</span>
                  {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />}
                </div>
                <span className="text-[10px] text-dark-muted block truncate font-mono">@{user.username}</span>
              </div>
            </Link>

            {onQuickSwitchAccount && (
              <div className="bg-dark-bg/45 border border-dark-border p-2 rounded-xl space-y-2 select-none">
                <span className="text-[8px] font-black text-brand-primary block uppercase tracking-wider text-right">
                  🔄 تبديل الحساب السريع (للمحاكاة السهلة):
                </span>
                <div className="flex items-center justify-around gap-1 select-none">
                  {[
                    { username: 'alisaifaldeen', name: 'علي', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alisaifaldeen' },
                    { username: 'sara_mech', name: 'سارة', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sara_mech' },
                    { username: 'ahmed_eng', name: 'أحمد', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ahmed_eng' },
                    { username: 'admin', name: 'المشرف', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin' }
                  ].map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => onQuickSwitchAccount(acc.username)}
                      disabled={user?.username === acc.username}
                      className={`relative flex flex-col items-center gap-1 p-1 rounded-lg transition-all ${
                        user?.username === acc.username
                          ? 'ring-1.5 ring-brand-primary bg-brand-primary/15'
                          : 'hover:bg-dark-border/40 cursor-pointer opacity-65 hover:opacity-100'
                      }`}
                      title={`تبديل الحساب إلى م. ${acc.name}`}
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-6 h-6 rounded object-cover border border-dark-border"
                      />
                      <span className="text-[7.5px] font-extrabold text-dark-text leading-none">{acc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('nav.logout')}</span>
            </button>

            {/* Developer Digital Signature with brand styles */}
            <div className="border-t border-dark-border/40 pt-3 text-center">
              <span className="text-[9px] text-dark-muted/65 block">{t('nav.platform_eng')}</span>
              <span className="text-[10px] text-brand-primary font-bold tracking-tight hover:text-brand-secondary transition-colors block mt-0.5 select-all leading-relaxed">
                {t('nav.developed_by')}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-screen pb-20 md:pb-0 flex flex-col">
        {/* Mobile Top Header */}
        <header className="md:hidden flex h-14 bg-dark-card/95 backdrop-blur-md border-b border-dark-border px-4 items-center justify-between sticky top-0 z-40 select-none">
          {/* Right Logo and name */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" referrerPolicy="no-referrer" className="w-8 h-8 rounded-xl object-cover shadow-md border border-dark-border" />
            <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-brand-primary to-brand-secondary text-xs sm:text-sm font-sans leading-none">
                ChemicalEngineersHub
              </span>
              <span className="text-[8px] text-dark-muted font-medium block mt-0.5">
                الهيئة العامة للمهندسين الكيميائيين بالبصرة
              </span>
            </div>
          </Link>

          {/* Left Action Quick shortcuts */}
          <div className="flex items-center gap-2.5">
            {onQuickSwitchAccount && (
              <button
                type="button"
                onClick={() => {
                  const usernames = ['alisaifaldeen', 'sara_mech', 'ahmed_eng', 'admin'];
                  const currentIndex = usernames.indexOf(user?.username || '');
                  const nextIndex = (currentIndex + 1) % usernames.length;
                  onQuickSwitchAccount(usernames[nextIndex]);
                }}
                className="p-1.5 rounded-xl bg-brand-primary/15 border border-brand-primary/20 text-brand-primary font-black text-[8px] sm:text-[9px] hover:bg-brand-primary hover:text-white transition-all scale-100 active:scale-95 cursor-pointer"
                title="تبديل سريع للحسابات"
              >
                👥 تبديل
              </button>
            )}
            <Link
              to="/games"
              className="p-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center gap-1"
              title={isRtl ? 'ألعاب السيارات' : 'Games Hub'}
            >
              <Gamepad2 className="w-4.5 h-4.5 animate-bounce" />
              <span className="text-[10px] font-black hidden sm:inline">{isRtl ? 'لعبة السيارات' : 'Car GP'}</span>
            </Link>
            {user?.email === 'alisaifaldeen12@gmail.com' && (
              <Link
                to="/admin"
                className="p-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary hover:text-white transition-colors"
                title={t('nav.admin')}
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            )}
            <Link 
              to="/notifications" 
              className="p-1.5 rounded-xl bg-dark-bg/60 border border-dark-border/40 text-dark-muted hover:text-dark-text relative transition-colors"
              title={t('nav.notifications')}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white font-extrabold text-[8px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link 
              to="/messages" 
              className="p-1.5 rounded-xl bg-dark-bg/60 border border-dark-border/40 text-dark-muted hover:text-dark-text relative transition-colors"
              title={t('nav.messages')}
            >
              <MessageSquare className="w-4.5 h-4.5" />
            </Link>
            
            {/* Mobile Logout option indicator */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl bg-dark-bg/60 border border-dark-border/40 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title={t('nav.logout')}
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-md border-t border-dark-border py-2 px-1 flex justify-around items-center z-40 select-none">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <Home className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">{t('nav.home')}</span>
        </NavLink>

        {/* 2. Explore */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <Compass className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">{t('nav.explore')}</span>
        </NavLink>

        {/* 3. Create Content */}
        <NavLink
          to="/create"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <PlusSquare className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">{t('nav.create').split(' ')[0]}</span>
        </NavLink>

        {/* 4. Reels */}
        <NavLink
          to="/reels"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <Film className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">{t('nav.reels').split(' ')[0]}</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to={`/profile/${user?.username || ''}`}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="Me"
                className={`w-5.5 h-5.5 rounded-full object-cover p-[1px] border-2 transition-all ${
                  isActive ? 'border-brand-primary scale-105 shadow-md' : 'border-transparent'
                }`}
              />
              <span className="text-[9px] font-bold">{t('nav.profile').split(' ')[0]}</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
