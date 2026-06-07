import { CheckCircle2, UserPlus, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface RightPanelProps {
  suggestions: User[];
  followingIds: string[];
  onToggleFollow: (userId: string) => void;
}

export default function RightPanel({ suggestions, followingIds, onToggleFollow }: RightPanelProps) {
  return (
    <aside className="hidden lg:block w-80 bg-dark-bg p-6 h-screen sticky top-0 border-r border-dark-border flex-shrink-0">
      {/* Suggestions Segment */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-5 mb-6">
        <h3 className="font-bold text-sm mb-4 text-dark-text tracking-wide border-b border-dark-border pb-2">
          مهندسون قد تعرفهم
        </h3>
        
        {suggestions.length === 0 ? (
          <p className="text-xs text-dark-muted text-center py-4">لا توجد اقتراحات حالية.</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => {
              const isFollowing = followingIds.includes(s.id);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 text-right">
                  <Link to={`/profile/${s.username}`} className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={s.avatarUrl}
                      alt={s.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-dark-border"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate text-dark-text hover:text-brand-primary">{s.fullName}</span>
                        {s.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />}
                      </div>
                      <span className="text-[10px] text-dark-muted block font-mono truncate">@{s.username}</span>
                      <span className="text-[9px] text-brand-primary font-medium block truncate mt-0.5">{s.engineeringField}</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => onToggleFollow(s.id)}
                    className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                      isFollowing
                        ? 'bg-dark-border text-dark-muted hover:bg-red-500/10 hover:text-red-400'
                        : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white'
                    }`}
                    title={isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                  >
                    {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EngineerHub Quick Stats / Info */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-5 text-right space-y-3">
        <h4 className="font-bold text-xs text-brand-primary">نبذة عن ريادة الأعمال الهندسية</h4>
        <p className="text-[11px] text-dark-muted leading-relaxed">
          الهدف من المنصة هو المساهمة في تنمية المهارات، مشاركة المشاريع الإنشائية والتطوير الميكانيكي والبرمجي وتبادل الخبرات المهنية في بيئة تواصل عربية احترافية وخلاقة.
        </p>
        <div className="text-[10px] text-dark-muted font-mono pt-2 border-t border-dark-border">
          EngineerHub © {new Date().getFullYear()} • صنع بحب للعقول العربية
        </div>
      </div>
    </aside>
  );
}
