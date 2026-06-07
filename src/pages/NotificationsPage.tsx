import { useEffect } from 'react';
import { AppNotification } from '../types';
import { MockDB } from '../utils/db';
import { Heart, MessageSquare, UserPlus, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationsPageProps {
  notifications: AppNotification[];
  refreshNotifications: () => void;
}

export default function NotificationsPage({ notifications, refreshNotifications }: NotificationsPageProps) {
  
  // Mark all read when user enters notifications page
  useEffect(() => {
    MockDB.markAllNotificationsRead();
    refreshNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500/10" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-brand-primary" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-brand-secondary" />;
      default:
        return <Bell className="w-4 h-4 text-dark-text" />;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none text-right">
      <div className="max-w-xl mx-auto">
        {/* Header bar */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <span>الإشعارات والنشاطات</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-xs text-dark-muted mt-1">تتبع التفاعل والتوجيه المباشر مع نقاشاتك ومقترحاتك الهندسية.</p>
          </div>
        </div>

        {/* List layout */}
        {notifications.length === 0 ? (
          <div className="bg-dark-card border border-dark-border p-12 rounded-2xl text-center space-y-3 flex flex-col items-center justify-center">
            <Bell className="w-10 h-10 text-dark-border" />
            <h3 className="font-bold text-xs">صندوق الإشعارات فارغ</h3>
            <p className="text-[10px] text-dark-muted/80">عندما يعجب أحد الزملاء بمخططاتك أو يقدم تتبعاً لمتابعتك ستظهر هنا.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  n.isRead
                    ? 'bg-dark-card border-dark-border text-dark-text'
                    : 'bg-brand-primary/5 border-brand-primary/30 text-dark-text shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-dark-border flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs leading-relaxed">
                      <Link to={`/profile/${n.actorUsername}`} className="font-bold text-brand-primary hover:underline font-mono ml-1">
                        @{n.actorUsername}
                      </Link>
                      <span>{n.text}</span>
                    </p>
                    <span className="text-[8px] text-dark-muted block mt-1.5 font-mono">
                      {new Date(n.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>

                {n.postId && (
                  <Link
                    to={`/profile/${MockDB.getCurrentUser()?.username}`}
                    className="text-[10px] bg-dark-border hover:bg-dark-border/80 border border-dark-border px-3 py-1.5 rounded-xl text-dark-muted font-medium"
                  >
                    عرض المنشور
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
