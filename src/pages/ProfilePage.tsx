import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Post } from '../types';
import { MockDB } from '../utils/db';
import { CheckCircle2, MapPin, Link2, Grid, Film, Bookmark, Lock, ArrowLeft, MessageSquare, Heart, Play, MessageCircle, ShieldCheck, KeyRound, EyeOff, Check, Ban, AlertCircle } from 'lucide-react';
import PostCard from '../components/PostCard';

interface ProfilePageProps {
  currentUser: User | null;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
  onToggleFollow: (userId: string) => void;
  followingIds: string[];
  onUpdateProfile?: (updates: Partial<User>) => void;
}

export default function ProfilePage({
  currentUser,
  onLike,
  onSave,
  onComment,
  onDelete,
  onToggleFollow,
  followingIds,
  onUpdateProfile
}: ProfilePageProps) {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(null);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'post' | 'reel' | 'saved'>('post');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 2FA state simulation
  const [authCode, setAuthCode] = useState('482 910');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!profile?.twoFactorEnabled) return;

    const generateCode = () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      return `${code.substring(0, 3)} ${code.substring(3, 6)}`;
    };

    setAuthCode(generateCode());
    setTimeLeft(30);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setAuthCode(generateCode());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.twoFactorEnabled]);

  const handleToggle2FA = (enabled: boolean) => {
    if (profile) {
      setProfile({ ...profile, twoFactorEnabled: enabled });
    }
    if (onUpdateProfile) {
      onUpdateProfile({ twoFactorEnabled: enabled });
    }
  };

  const handleToggleActiveStatus = (hidden: boolean) => {
    if (profile) {
      setProfile({ ...profile, hideActiveStatus: hidden });
    }
    if (onUpdateProfile) {
      onUpdateProfile({ hideActiveStatus: hidden });
    }
  };

  const isMe = currentUser?.username.toLowerCase() === username?.toLowerCase();

  // Load profile and related posts
  useEffect(() => {
    if (!username) return;
    const userPr = MockDB.getUserProfile(username);
    setProfile(userPr);

    if (userPr) {
      const postsList = MockDB.getUserPosts(userPr.id, activeTab);
      setProfilePosts(postsList);
    }
  }, [username, activeTab, currentUser]);

  const handleFollowUser = () => {
    if (!profile) return;
    onToggleFollow(profile.id);
    
    // Refresh counter
    setTimeout(() => {
      setProfile(MockDB.getUserProfile(profile.username));
    }, 100);
  };

  const handleStartConversation = () => {
    if (!profile) return;
    // Start conv
    MockDB.getOrCreateConversationId(profile.id);
    navigate('/messages');
  };

  const handleToggleBlock = () => {
    if (!currentUser || !profile) return;
    
    const isCurrentlyBlocked = currentUser.blockedUserIds?.includes(profile.id);
    let nextBlocked = currentUser.blockedUserIds || [];
    if (isCurrentlyBlocked) {
      nextBlocked = nextBlocked.filter(id => id !== profile.id);
    } else {
      nextBlocked = [...nextBlocked, profile.id];
    }
    
    MockDB.togglePrivacyOverride(currentUser.id, 'blocked', profile.id);
    
    if (onUpdateProfile) {
      onUpdateProfile({ blockedUserIds: nextBlocked });
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dark-muted h-screen">
        <ArrowLeft className="w-12 h-12 text-dark-border mb-3" />
        <h3 className="font-bold text-sm">عذراً، لم يتم العثور على هذا المهندس</h3>
        <Link to="/" className="text-brand-primary text-xs font-bold hover:underline mt-2">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const isBlockedByOpposing = profile.blockedUserIds?.includes(currentUser?.id || '');
  const isMyBlockedUser = currentUser?.blockedUserIds?.includes(profile.id);

  if (isBlockedByOpposing) {
    return (
      <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none text-right flex items-center justify-center bg-dark-bg text-dark-text select-none">
        <div className="max-w-md w-full bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto animate-pulse">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="font-black text-base text-white">الملف الشخصي غير متاح حالياً</h3>
          <p className="text-xs text-dark-muted leading-relaxed">
            عذراً، يفرض هذا الحساب قيوداً أمنية تمنعك من الوصول لملفّه الشخصي أو تصفح منشوراته ومراسلته.
          </p>
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="w-full bg-dark-bg border border-dark-border hover:border-brand-primary/40 text-dark-text hover:text-white font-bold text-xs py-3 rounded-xl transition-all"
          >
            رجوع للخلف
          </button>
        </div>
      </div>
    );
  }

  const isFollowing = followingIds.includes(profile.id);

  return (
    <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none text-right">
      <div className="max-w-2xl mx-auto">
        
        {/* Profile Card Header Segment */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-20 col-span-1 h-20 rounded-2xl object-cover border border-dark-border shadow-lg"
              />
              <div className="text-center sm:text-right min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 matches-rtl text-right">
                    <h2 className="text-lg font-black text-dark-text leading-snug">{profile.fullName}</h2>
                    {profile.isVerified && <CheckCircle2 className="w-4 h-4 text-brand-primary fill-brand-primary/10" />}
                  </div>
                  
                  {/* Block / Unblock Toggle Button next to name */}
                  {!isMe && (
                    <button
                      type="button"
                      onClick={handleToggleBlock}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all select-none ${
                        isMyBlockedUser
                          ? 'bg-red-500 hover:bg-red-650 text-white border-red-500 shadow-md shadow-red-500/15'
                          : 'bg-transparent text-red-400 hover:bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{isMyBlockedUser ? 'إلغاء الحظر' : 'حظر'}</span>
                    </button>
                  )}
                </div>
                <span className="text-xs text-dark-muted font-mono block mt-0.5">@{profile.username}</span>
                <span className="text-xs text-brand-primary font-semibold block mt-1.5">{profile.engineeringField}</span>

                {/* Bio text block */}
                {profile.bio && <p className="text-xs text-dark-text mt-3.5 leading-relaxed font-sans">{profile.bio}</p>}

                {/* Website and Locations */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[10px] text-dark-muted justify-center sm:justify-start font-mono">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-brand-primary"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Editing and settings options */}
            <div className="w-full sm:w-auto flex flex-row sm:flex-col gap-2 mt-3 sm:mt-0">
              {isMe ? (
                <Link
                  to="/profile/edit"
                  className="flex-1 text-center bg-dark-border/60 hover:bg-dark-border text-dark-text font-bold text-xs px-4 py-2.5 rounded-xl transition-colors border border-dark-border"
                >
                  تعديل الملف الشخصي
                </Link>
              ) : isMyBlockedUser ? (
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  className="flex-1 bg-red-500 hover:bg-red-650 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-red-500/10 whitespace-nowrap"
                >
                  إلغاء الحظر
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollowUser}
                    className={`flex-1 text-center font-bold text-xs px-4 py-2.5 rounded-xl transition-all ${
                      isFollowing
                        ? 'bg-dark-border text-dark-muted hover:bg-red-500/10 hover:text-red-400'
                        : 'bg-brand-primary text-white hover:bg-brand-primary/95'
                    }`}
                  >
                    {isFollowing ? 'متابع' : 'متابعة'}
                  </button>
                  <button
                    onClick={handleStartConversation}
                    className="flex-1 bg-dark-border/40 hover:bg-dark-border border border-dark-border p-2.5 rounded-xl text-dark-text flex items-center justify-center"
                    title="مراسلة خاصة"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar (Posts, followers, following) */}
          <div className="grid grid-cols-3 gap-2 border-t border-dark-border/60 mt-6 pt-5 text-center bg-dark-bg/20 rounded-xl p-3">
            <div>
              <span className="block text-base font-black text-dark-text font-mono">
                {profilePosts.filter((p) => p.type === 'post').length}
              </span>
              <span className="text-[10px] text-dark-muted font-medium">منشور</span>
            </div>
            <div>
              <span className="block text-base font-black text-dark-text font-mono">{profile.followersCount}</span>
              <span className="text-[10px] text-dark-muted font-medium">متابع</span>
            </div>
            <div>
              <span className="block text-base font-black text-dark-text font-mono">{profile.followingCount}</span>
              <span className="text-[10px] text-dark-muted font-medium">يتابع</span>
            </div>
          </div>
        </div>

        {/* Account Security Settings (Only for logged-in profile owner) */}
        {isMe && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 md:p-6 mb-6 select-none">
            <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-dark-border/60">
              <ShieldCheck className="w-5 h-5 text-brand-primary animate-pulse" />
              <h3 className="font-bold text-sm text-dark-text">أمان الحساب والخصوصية المهنية</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Two-Factor Authentication Card */}
              <div className="bg-dark-bg/40 border border-dark-border/80 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-dark-text flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-brand-primary" />
                      التحقق بخطوتين (2FA)
                    </span>
                    
                    {/* Flex-based robust Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle2FA(!profile.twoFactorEnabled)}
                      className={`w-11 h-5.5 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
                        profile.twoFactorEnabled ? 'bg-brand-primary justify-start' : 'bg-dark-border justify-end'
                      }`}
                      title={profile.twoFactorEnabled ? 'إلغاء التفعيل' : 'تفعيل التحقق'}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                  <p className="text-[10px] text-dark-muted leading-relaxed">
                    تأمين إضافي لحسابك يتطلب رمزاً عشوائياً مؤقتاً عند التسجيل لحماية مقالاتك وتصاميمك الهندسية وبيانات اتصالك ضد الاختراق الخارجي.
                  </p>
                </div>

                {profile.twoFactorEnabled && (
                  <div className="mt-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-3 text-right">
                    <span className="text-[9px] font-bold text-brand-primary block mb-1">مصادقة Google Authenticator نشطة</span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-dark-text bg-dark-bg px-2 py-1 rounded tracking-widest border border-dark-border">
                          {authCode}
                        </span>
                        <span className="text-[8px] font-mono text-dark-muted">({timeLeft}ث)</span>
                      </div>
                      <span className="text-[8px] text-dark-muted">يتجدد تلقائياً</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stealth Invisible Status */}
              <div className="bg-dark-bg/40 border border-dark-border/80 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-dark-text flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4 text-brand-primary" />
                      إخفاء الحالة النشطة (Invisible)
                    </span>
                    
                    {/* Flex-based robust Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActiveStatus(!profile.hideActiveStatus)}
                      className={`w-11 h-5.5 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
                        profile.hideActiveStatus ? 'bg-brand-primary justify-start' : 'bg-dark-border justify-end'
                      }`}
                      title={profile.hideActiveStatus ? 'إظهار التواجد' : 'إخفاء التواجد'}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                  <p className="text-[10px] text-dark-muted leading-relaxed">
                    احصل على خصوصية تامة وهدوء للتركيز. عند تفعيل الخيار، ستتصفح المنصة بشكل خفي ولن يشاهد الزملاء مؤشر تواجدك الأخضر في الرسائل.
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[9px] bg-dark-bg/25 px-2.5 py-1.5 rounded-lg border border-dark-border/40">
                  <div className={`w-2 h-2 rounded-full ${profile.hideActiveStatus ? 'bg-dark-muted animate-pulse' : 'bg-brand-primary animate-ping'}`} />
                  <span className={profile.hideActiveStatus ? 'text-dark-muted font-bold' : 'text-brand-primary font-black'}>
                    {profile.hideActiveStatus ? 'أنت تتصفح كزائر خفي الآن' : 'وضع الاتصال نشط ومرئي للزملاء'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Status overview footer */}
            <div className="mt-3.5 p-2.5 bg-brand-primary/5 rounded-xl border border-brand-primary/10 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-dark-text">
                <Check className="w-3.5 h-3.5 text-brand-primary" />
                <span className="font-semibold text-[9px]">حماية حسابك:</span>
                <span className={`font-extrabold ${profile.twoFactorEnabled ? 'text-brand-primary' : 'text-yellow-500'}`}>
                  {profile.twoFactorEnabled ? 'درجة أمان قصوى - الحساب محمي بالكامل' : 'أمان قياسي - ننصحك بتفعيل 2FA لحماية الحساب'}
                </span>
              </div>
              <span className="text-[8px] text-dark-muted font-mono">مؤمن بالكامل</span>
            </div>
          </div>
        )}

        {/* Blocked user feed shield gate */}
        {isMyBlockedUser ? (
          <div className="bg-dark-card border border-dark-border p-8 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center select-none shadow-lg">
            <Ban className="w-12 h-12 text-red-500/70 animate-pulse" />
            <h4 className="font-black text-sm text-white">لقد قمت بحظر هذا الحساب</h4>
            <p className="text-xs text-dark-muted max-w-sm leading-relaxed">
              لقد قمت بحظر المهندس {profile.fullName}. لا يمكنك مشاهدة ملفاته الهندسية، مخططاته، أو رييلزه، كما لا يمكنك التواصل معه طالما ظل الحظر سارياً.
            </p>
            <button
              onClick={handleToggleBlock}
              type="button"
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-red-500/20"
            >
              إلغاء حظر الحساب الهندسي
            </button>
          </div>
        ) : profile.isPrivate && !isMe && !isFollowing ? (
          <div className="bg-dark-card border border-dark-border p-8 rounded-2xl text-center space-y-3 flex flex-col items-center justify-center">
            <Lock className="w-10 h-10 text-brand-secondary/60 animate-bounce" />
            <h4 className="font-bold text-sm">هذا الحساب الهندسي خاص مغلق</h4>
            <p className="text-xs text-dark-muted">تابع هذا الحساب لتتمكن من تصفح مشاريعه ورسوماته الهندسية والريلز.</p>
          </div>
        ) : (
          <>
            {/* Nav tabs for feeds (منشورات, ريلز, محفوظ) */}
            <div className="flex border-b border-dark-border mb-6">
              <button
                onClick={() => setActiveTab('post')}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === 'post'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-dark-muted hover:text-dark-text'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>المنشورات</span>
              </button>
              <button
                onClick={() => setActiveTab('reel')}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === 'reel'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-dark-muted hover:text-dark-text'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>المقاطع القصيرة</span>
              </button>
              {isMe && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === 'saved'
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-dark-muted hover:text-dark-text'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>المحفوظات</span>
                </button>
              )}
            </div>

            {/* List of related publications in Instagram-style 3x3 Grid (Matches User Spec) */}
            <div className="mb-8">
              {profilePosts.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center text-dark-muted">
                  <p className="text-xs">لا توجد منشورات متطابقة في هذا التبويب.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5">
                  {profilePosts.map((post) => {
                    const mediaUrl = post.mediaUrls && post.mediaUrls[0];
                    const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.includes('mixkit.co'));

                    return (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group bg-dark-card border border-dark-border/40 select-none hover:shadow-lg transition-transform duration-200"
                      >
                        {isVideo ? (
                          <div className="w-full h-full relative">
                            <video src={mediaUrl} className="w-full h-full object-cover pointer-events-none" muted />
                            <div className="absolute top-2 right-2 p-1 bg-black/55 text-white rounded-lg">
                              <Play className="w-3.5 h-3.5 fill-white text-white" />
                            </div>
                          </div>
                        ) : mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt="thumbnail"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          // Text post elegant typography thumbnail
                          <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 via-dark-bg/60 to-dark-bg p-3 flex flex-col justify-between items-start text-right">
                            <span className="text-[9px] text-brand-primary/80 font-black uppercase tracking-wider font-mono">
                              منشور مهني
                            </span>
                            <p className="text-[10px] text-dark-text leading-relaxed line-clamp-3 font-sans font-medium w-full">
                              {post.caption}
                            </p>
                            <div className="w-full border-t border-dark-border/30 pt-1 flex justify-end">
                              <span className="text-[8px] text-dark-muted font-mono">🔍 قراءة ممتعة</span>
                            </div>
                          </div>
                        )}

                        {/* Hover Overlay Stats */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-200">
                          <span className="flex items-center gap-1.5 text-white font-mono text-xs font-extrabold">
                            <Heart className="w-4 h-4 fill-white text-white" />
                            {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1.5 text-white font-mono text-xs font-extrabold">
                            <MessageCircle className="w-4 h-4 fill-white text-white" />
                            {post.comments.length}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Immersive dialog/overlay focused post view */}
            {selectedPost && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                {/* Click backdrop to exit focus mode */}
                <div className="absolute inset-0" onClick={() => setSelectedPost(null)} />
                
                <div className="relative w-full max-w-lg bg-dark-card rounded-2xl shadow-2xl overflow-hidden z-10 border border-dark-border max-h-[90vh] overflow-y-auto scrollbar-none">
                  <div className="absolute top-4 left-4 z-20">
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="bg-black/70 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full hover:bg-black/90 transition-colors cursor-pointer border border-white/10"
                    >
                      إغلاق المنشور
                    </button>
                  </div>
                  
                  <div className="pointer-events-auto">
                    <PostCard
                      post={selectedPost}
                      currentUser={currentUser}
                      onLike={(pId) => {
                        onLike(pId);
                        if (selectedPost.id === pId) {
                          const isL = selectedPost.isLiked;
                          setSelectedPost({
                            ...selectedPost,
                            isLiked: !isL,
                            likesCount: isL ? selectedPost.likesCount - 1 : selectedPost.likesCount + 1
                          });
                        }
                      }}
                      onSave={(pId) => {
                        onSave(pId);
                        if (selectedPost.id === pId) {
                          setSelectedPost({
                            ...selectedPost,
                            isSaved: !selectedPost.isSaved
                          });
                        }
                      }}
                      onComment={(pId, text) => {
                        onComment(pId, text);
                        if (selectedPost.id === pId) {
                          const newComment = {
                            id: Math.random().toString(),
                            postId: pId,
                            userId: currentUser?.id || '',
                            username: currentUser?.username || '',
                            avatarUrl: currentUser?.avatarUrl || '',
                            text: text,
                            createdAt: new Date().toISOString()
                          };
                          setSelectedPost({
                            ...selectedPost,
                            comments: [...selectedPost.comments, newComment]
                          });
                        }
                      }}
                      onDelete={(pId) => {
                        onDelete(pId);
                        setSelectedPost(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
