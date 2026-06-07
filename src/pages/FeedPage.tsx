import React, { useState, useEffect } from 'react';
import { User, Post, UserStories } from '../types';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RightPanel from '../components/RightPanel';
import { Sparkles, PenTool, Image, Film, Video, Download, CheckCircle, X, Smartphone, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedPageProps {
  currentUser: User | null;
  posts: Post[];
  storiesFeed: UserStories[];
  suggestions: User[];
  followingIds: string[];
  onToggleFollow: (userId: string) => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
  onOpenStory: (index: number) => void;
  onAddStory: () => void;
}

export default function FeedPage({
  currentUser,
  posts,
  storiesFeed,
  suggestions,
  followingIds,
  onToggleFollow,
  onLike,
  onSave,
  onComment,
  onDelete,
  onOpenStory,
  onAddStory
}: FeedPageProps) {
  const navigate = useNavigate();
  const [quickCaption, setQuickCaption] = useState('');
  
  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaInstructions, setShowPwaInstructions] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  });

  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    const handleInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowPwaInstructions(true);
    }
  };

  const feedPosts = posts.filter((p) => p.type === 'post');

  const handleQuickPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCaption.trim()) return;
    // Redirect to create page with pre-filled content or handle quickly
    navigate('/create', { state: { initialCaption: quickCaption } });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Scrollable Center Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-6 lg:p-8 scrollbar-none h-full">
        <div className="max-w-xl lg:max-w-2xl mx-auto">
          {/* Header Greeting */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-right">
              <h1 className="text-xl md:text-2xl font-black text-dark-text tracking-tight flex items-center gap-2">
                <span>أهلاً بك، {currentUser?.fullName.split(' ')[0]}</span>
                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400/20 animate-pulse" />
              </h1>
              <p className="text-[11px] text-dark-muted font-medium mt-1">تصفح آخر نشاطات المهندسين والزملاء العرب مهارياً.</p>
            </div>
          </div>

          {/* Professional Developer Signature Banner & PWA Installer */}
          <div className="bg-gradient-to-l from-brand-primary/15 via-dark-card to-dark-card/30 border border-dark-border rounded-2xl p-4 md:p-5 mb-6 text-right relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-brand-primary to-brand-secondary" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-[8px] font-bold text-brand-primary uppercase tracking-wider font-sans">
                    PLATFORM FOUNDER SIGNATURE
                  </span>
                </div>
                <h2 className="text-xs md:text-sm font-black text-white font-sans tracking-wide leading-tight group-hover:text-brand-primary transition-colors">
                  Developed by Engineer Ali Saifuddin Haider Al-Nawfal 2023
                </h2>
                <p className="text-[9px] text-dark-muted leading-relaxed">
                  ChemicalEngineersHub is a premium standalone Progressive Web App. Install now on your home screen for rapid access.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-md shadow-brand-primary/15 hover:shadow-brand-primary/30 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تثبيت التطبيق (PWA)</span>
                </button>
                {isAppInstalled && (
                  <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold px-2.5 py-1 rounded-lg">
                    مثبت بالفعل
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stories row */}
          <StoriesBar
            currentUser={currentUser}
            storiesFeed={storiesFeed}
            onOpenStory={onOpenStory}
            onAddStory={onAddStory}
          />

          {/* Quick Publisher Box */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6 text-right">
            <div className="flex items-start gap-3">
              <img
                src={currentUser?.avatarUrl}
                alt="My profile"
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
              />
              <form onSubmit={handleQuickPublish} className="flex-1">
                <textarea
                  value={quickCaption}
                  onChange={(e) => setQuickCaption(e.target.value)}
                  placeholder="شارك مشروعك الهندسي الجديد أو فكرة تخصصية مع الزملاء..."
                  rows={2}
                  className="w-full bg-dark-bg/40 border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted resize-none font-sans"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-border/60">
                  <div className="flex gap-2 text-dark-muted text-xs">
                    <button
                      type="button"
                      onClick={() => navigate('/create', { state: { type: 'post' } })}
                      className="flex items-center gap-1.5 hover:text-brand-primary py-1 px-2.5 rounded-lg hover:bg-dark-border/40 transition-colors"
                    >
                      <Image className="w-4 h-4 text-green-400" />
                      <span>صورة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/create', { state: { type: 'reel' } })}
                      className="flex items-center gap-1.5 hover:text-brand-primary py-1 px-2.5 rounded-lg hover:bg-dark-border/40 transition-colors"
                    >
                      <Video className="w-4 h-4 text-brand-secondary" />
                      <span>ريلز</span>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!quickCaption.trim()}
                    className="bg-brand-primary text-white font-bold text-xs px-4 py-1.5 rounded-xl hover:bg-brand-primary/95 disabled:opacity-50 transition-all flex items-center gap-1"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>نشر المنشور</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Publications Feed Stack */}
          <div className="space-y-6">
            {feedPosts.length === 0 ? (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center space-y-4">
                <p className="text-sm text-dark-muted">لا توجد منشورات هندسية من زملائك بعد.</p>
                <button
                  onClick={() => navigate('/create')}
                  className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  انشر أول مشروع لك الآن!
                </button>
              </div>
            ) : (
              feedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={onLike}
                  onSave={onSave}
                  onComment={onComment}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Persistent Desktop Right suggestions Column */}
      <RightPanel
        suggestions={suggestions}
        followingIds={followingIds}
        onToggleFollow={onToggleFollow}
      />

      {/* PWA Manual Install Instructions Modal */}
      {showPwaInstructions && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-right">
          <div className="bg-dark-card border border-dark-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowPwaInstructions(false)}
              className="absolute top-4 left-4 p-1.5 rounded-xl bg-dark-bg hover:bg-dark-border text-dark-muted hover:text-dark-text border border-dark-border transition-colors-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Download className="w-4.5 h-4.5 text-brand-primary" />
                <span>تثبيت تطبيق ChemicalEngineersHub على جهازك</span>
              </h3>
              <p className="text-[10px] text-dark-muted leading-relaxed">
                يدعم التطبيق تقنية تطبيقات الويب التقدمية (PWA) للتشغيل السريع والمباشر كـ تطبيق مستقل من الشاشة الرئيسية.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* iOS Safari */}
              <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-white block">مستخدمي هواتف الآيفون (iOS Safari)</span>
                  <span className="text-[10px] text-dark-muted block leading-relaxed">
                    انقر على أيقونة <span className="font-bold text-brand-primary">"مشاركة / Share"</span> في أسفل المتصفح، ثم اختر <span className="font-bold text-brand-primary">"إضافة إلى الشاشة الرئيسية / Add to Home Screen"</span>.
                  </span>
                </div>
              </div>

              {/* Android & PC browsers */}
              <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary mt-0.5">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-white block">مستخدمي أندرويد ومتصفح Chrome / Edge</span>
                  <span className="text-[10px] text-dark-muted block leading-relaxed">
                    اضغط على أيقونة القائمة (أو زر التثبيت في شريط العنوان)، ثم حدد <span className="font-bold text-brand-primary">"تثبيت التطبيق / Install App"</span> أو إضافة للشاشة.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPwaInstructions(false)}
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-brand-primary/15"
            >
              حسناً، فهمت الطريقة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
