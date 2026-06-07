import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Compass, Film, Search, Bell, MessageSquare, Hash, PlusSquare, User as UserIcon, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import { User, AppNotification } from '../types';

interface LayoutProps {
  user: User | null;
  notifications: AppNotification[];
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, notifications, onLogout, children }: LayoutProps) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  interface NavItem {
    to: string;
    icon: any;
    label: string;
    badge?: number;
  }

  const NAV_ITEMS: NavItem[] = [
    { to: '/', icon: Home, label: 'الرئيسية' },
    { to: '/explore', icon: Compass, label: 'استكشاف' },
    { to: '/reels', icon: Film, label: 'ريلز الهندسية' },
    { to: '/search', icon: Search, label: 'بحث' },
    { to: '/notifications', icon: Bell, label: 'الإشعارات', badge: unreadCount },
    { to: '/messages', icon: MessageSquare, label: 'الرسائل' },
    { to: '/channels', icon: Hash, label: 'القنوات الهندسية' },
    { to: '/create', icon: PlusSquare, label: 'نشر جديد' },
    { to: `/profile/${user?.username || ''}`, icon: UserIcon, label: 'الملف الشخصي' }
  ];

  const adminItem: NavItem[] = user?.email === 'alisaifaldeen12@gmail.com'
    ? [{ to: '/admin', icon: ShieldCheck, label: 'لوحة الإدارة الأمنية' }]
    : [];

  const visibleNavItems: NavItem[] = [...NAV_ITEMS, ...adminItem];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col md:flex-row antialiased">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-dark-card border-l border-dark-border h-screen sticky top-0 p-5 flex-shrink-0 z-30">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-lg text-lg tracking-wider">
            EH
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-brand-primary to-brand-secondary text-xl font-heading">
              EngineerHub
            </span>
            <span className="text-[10px] text-dark-muted font-medium">مجتمع المهندسين العرب</span>
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
                      ? 'bg-brand-primary/10 text-brand-primary border-r-4 border-brand-primary'
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
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs truncate">{user.fullName}</span>
                  {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />}
                </div>
                <span className="text-[10px] text-dark-muted block truncate font-mono">@{user.username}</span>
              </div>
            </Link>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>

            {/* Developer Digital Signature with brand styles */}
            <div className="border-t border-dark-border/40 pt-3 text-center">
              <span className="text-[9px] text-dark-muted/65 block">Platform Engineering</span>
              <span className="text-[10px] text-brand-primary font-bold tracking-tight hover:text-brand-secondary transition-colors block mt-0.5 select-all leading-relaxed">
                Developed by Engineer Ali Saifuddin Haider Al-Nawfal 2023
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-screen pb-20 md:pb-0 flex flex-col">
        {/* Mobile Top Header (Matches Instagram spec) */}
        <header className="md:hidden flex h-14 bg-dark-card/95 backdrop-blur-md border-b border-dark-border px-4 items-center justify-between sticky top-0 z-40 select-none">
          {/* Right Logo and name */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-md text-xs tracking-wider">
              EH
            </div>
            <div className="flex flex-col text-right">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-brand-primary to-brand-secondary text-sm font-sans leading-none">
                EngineerHub
              </span>
              <span className="text-[8px] text-dark-muted font-medium block mt-0.5">
                مجتمع المهندسين العرب
              </span>
            </div>
          </Link>

          {/* Left Action Quick shortcuts: Notifications / Messages */}
          <div className="flex items-center gap-2.5">
            {user?.email === 'alisaifaldeen12@gmail.com' && (
              <Link
                to="/admin"
                className="p-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary hover:text-white transition-colors"
                title="لوحة الإدارة"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            )}
            <Link 
              to="/notifications" 
              className="p-1.5 rounded-xl bg-dark-bg/60 border border-dark-border/40 text-dark-muted hover:text-dark-text relative transition-colors"
              title="الإشعارات"
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
              title="الرسائل"
            >
              <MessageSquare className="w-4.5 h-4.5" />
            </Link>
            
            {/* Mobile Logout option indicator */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl bg-dark-bg/60 border border-dark-border/40 text-red-450 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Responsive mobile viewport, strictly 5 key navigation icons matching Instagram) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-md border-t border-dark-border py-2 px-1 flex justify-around items-center z-40 select-none">
        {/* 1. Home (الرئيسية) */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <Home className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">الرئيسية</span>
        </NavLink>

        {/* 2. Explore (استكشاف) */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <Compass className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">استكشاف</span>
        </NavLink>

        {/* 3. Create Content (+) (إنشاء) */}
        <NavLink
          to="/create"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <PlusSquare className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">نشر</span>
        </NavLink>

        {/* 4. Reels (الريلز) */}
        <NavLink
          to="/reels"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-brand-primary font-extrabold scale-105' : 'text-dark-muted hover:text-dark-text'
            }`
          }
        >
          <Film className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">ريلز</span>
        </NavLink>

        {/* 5. Profile with circular avatar image (الملف الشخصي) */}
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
              <span className="text-[9px] font-bold">الملف</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
