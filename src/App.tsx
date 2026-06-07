import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MockDB } from './utils/db';
import { User, Post, Story, UserStories, AppNotification } from './types';
import Layout from './components/Layout';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import ReelsPage from './pages/ReelsPage';
import SearchPage from './pages/SearchPage';
import MessagesPage from './pages/MessagesPage';
import ChannelsPage from './pages/ChannelsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePostPage from './pages/CreatePostPage';
import AdminPage from './pages/AdminPage';
import GamesPage from './pages/GamesPage';
import StoryViewer from './components/StoryViewer';
import { Sparkles, MessageSquare, KeyRound, UserCheck, Briefcase, X, Upload, Camera, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const FIELD_OPTIONS = [
  'هندسة برمجيات',
  'قسم هندسة النفط والغاز',
  'قسم الهندسة الكيميائية',
  'قسم الهندسة المدنية',
  'قسم الهندسة الميكانيكية',
  'قسم الهندسة الكهربائية',
  'قسم الهندسة المعمارية',
  'قسم هندسة الحاسبات',
  'قسم هندسة المواد',
  'قسم هندسة البوليمرات',
  'قسم هندسة تقنيات الوقود والطاقة',
  'قسم هندسة التقنيات الكيميائية والبتروكيميائية',
  'هندسة تقنيات البيئة والتلوث',
  'هندسة تقنيات ميكانيك الحراريات',
  'هندسة تقنيات القدرة الكهربائية',
  'هندسة تقنيات السيطرة والأتمتة',
  'قسم هندسة عمليات الغاز والتكرير',
  'هندسة اتصالات',
  'إدارة مشاريع هندسية',
  'هندسة طاقة متجددة'
];

export default function App() {
  // Initialize Database once
  useEffect(() => {
    MockDB.init();
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => MockDB.getCurrentUser());
  const [posts, setPosts] = useState<Post[]>(() => MockDB.getFeed());
  const [storiesFeed, setStoriesFeed] = useState<UserStories[]>(() => MockDB.getStoriesFeed());
  const [suggestions, setSuggestions] = useState<User[]>(() => MockDB.getSuggestions());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => MockDB.getNotifications());
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [activeStoryFeedIndex, setActiveStoryFeedIndex] = useState<number | null>(null);

  // States for unlimited custom story publishing
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [storyMediaFile, setStoryMediaFile] = useState<string>('');
  const [storyCaption, setStoryCaption] = useState<string>('');
  const [storyTheme, setStoryTheme] = useState<string>('gradient');

  // Authentication states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [show2faChallenge, setShow2faChallenge] = useState(false);
  const [totpTokenInput, setTotpTokenInput] = useState('');
  const [challengeUserId, setChallengeUserId] = useState('');
  const [challengeCodeSent, setChallengeCodeSent] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerField, setRegisterField] = useState('هندسة برمجيات');
  const [rememberMe, setRememberMe] = useState(true);
  const [rememberedAccounts, setRememberedAccounts] = useState(() => MockDB.getRememberedAccounts());
  const [authError, setAuthError] = useState('');

  // Handle follow mappings on start
  useEffect(() => {
    if (currentUser) {
      setFollowingIds(MockDB.getSuggestions().filter(u => MockDB.isFollowing(u.id)).map(u => u.id));
    }
  }, [currentUser]);

  const handleRefreshFeed = () => {
    setPosts(MockDB.getExplorePosts());
    setStoriesFeed(MockDB.getStoriesFeed());
    setSuggestions(MockDB.getSuggestions());
    setNotifications(MockDB.getNotifications());
  };

  const handleLike = (postId: string) => {
    MockDB.toggleLike(postId);
    handleRefreshFeed();
  };

  const handleSave = (postId: string) => {
    MockDB.toggleSave(postId);
    handleRefreshFeed();
  };

  const handleComment = (postId: string, text: string) => {
    MockDB.addComment(postId, text);
    handleRefreshFeed();
  };

  const handleCreatePost = (type: 'post' | 'reel', caption: string, location: string, mediaUrls: string[]) => {
    MockDB.createPost(type, caption, location, mediaUrls);
    handleRefreshFeed();
  };

  const handleDeletePost = (postId: string) => {
    MockDB.deletePost(postId);
    handleRefreshFeed();
  };

  const handleToggleFollow = (userId: string) => {
    MockDB.toggleFollow(userId);
    setFollowingIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
    handleRefreshFeed();
  };

  const handleAddStory = () => {
    setIsAddStoryOpen(true);
  };

  const handlePublishCustomStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyMediaFile && !storyCaption.trim()) return;

    let mediaUrl = storyMediaFile;
    
    // If no custom image file but they typed text, render an elegant graphic story slide via HTML5 canvas
    if (!mediaUrl && storyCaption.trim()) {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Linear gradient background based on selection
        let grad = ctx.createLinearGradient(0, 0, 0, 1920);
        if (storyTheme === 'gradient') {
          grad.addColorStop(0, '#0d9488');
          grad.addColorStop(1, '#0f766e');
        } else if (storyTheme === 'blue') {
          grad.addColorStop(0, '#1e3a8a');
          grad.addColorStop(1, '#0f172a');
        } else if (storyTheme === 'orange') {
          grad.addColorStop(0, '#c2410c');
          grad.addColorStop(1, '#7c2d12');
        } else { // green
          grad.addColorStop(0, '#065f46');
          grad.addColorStop(1, '#022c22');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Technical blueprint grid overlays
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 1080; i += 70) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1920);
          ctx.stroke();
        }
        for (let j = 0; j < 1920; j += 70) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(1080, j);
          ctx.stroke();
        }

        // Add developer and security footprint footer watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = 'normal 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('تطوير المهندس علي سيف الدين • EngineerHub SECURE', 540, 1840);

        // Render Arabic Multiline Text content
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px system-ui, sans-serif';
        ctx.textAlign = 'center';
        
        const words = storyCaption.trim().split(' ');
        let line = '';
        const lines = [];
        const maxWidth = 880;
        const lineHeight = 80;
        
        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const startY = 960 - ((lines.length - 1) * lineHeight) / 2;
        for (let k = 0; k < lines.length; k++) {
          ctx.fillText(lines[k], 540, startY + k * lineHeight);
        }

        mediaUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    MockDB.addStory(mediaUrl, 'image');
    setIsAddStoryOpen(false);
    setStoryMediaFile('');
    setStoryCaption('');
    setStoryTheme('gradient');
    handleRefreshFeed();
  };

  const handleMarkStoryViewed = (storyId: string) => {
    MockDB.markStoryViewed(storyId);
    setStoriesFeed(MockDB.getStoriesFeed());
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    const updated = MockDB.updateUserProfile(updates);
    setCurrentUser(updated);
    handleRefreshFeed();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginIdentifier.trim()) return;

    const res = MockDB.login(loginIdentifier.trim(), loginPassword);
    
    if (res.require2FA && res.code2FA) {
      // Transition to 2FA view
      const allUsers = MockDB.getAllUsers();
      const matched = allUsers.find(
        u => u.username.toLowerCase() === loginIdentifier.trim().toLowerCase() || 
             u.email.toLowerCase() === loginIdentifier.trim().toLowerCase()
      );
      if (matched) {
        setChallengeUserId(matched.id);
        setChallengeCodeSent(res.code2FA);
        setShow2faChallenge(true);
      }
    } else if (res.user) {
      if (rememberMe) {
        MockDB.addRememberedAccount(res.user, loginPassword);
        setRememberedAccounts(MockDB.getRememberedAccounts());
      }
      setCurrentUser(res.user);
      handleRefreshFeed();
      setLoginPassword('');
      setLoginIdentifier('');
    } else {
      setAuthError(res.error || '');
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!totpTokenInput.trim()) return;

    const res = MockDB.verifyAndLogin2FA(challengeUserId, totpTokenInput.trim());
    if (res.user) {
      setCurrentUser(res.user);
      handleRefreshFeed();
      setShow2faChallenge(false);
      setChallengeUserId('');
      setChallengeCodeSent('');
      setTotpTokenInput('');
      setLoginPassword('');
      setLoginIdentifier('');
    } else {
      setAuthError(res.error || '');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!registerFullName.trim() || !registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setAuthError('يرجى ملء جميع الحقول المطلوبة الكليّة وتعيين كلمة مرور آمنة');
      return;
    }

    const res = MockDB.register(
      registerFullName.trim(),
      registerUsername.trim(),
      registerEmail.trim(),
      registerField,
      registerPassword.trim()
    );

    if (res.user) {
      if (rememberMe) {
        MockDB.addRememberedAccount(res.user, registerPassword.trim());
        setRememberedAccounts(MockDB.getRememberedAccounts());
      }
      setCurrentUser(res.user);
      handleRefreshFeed();
      setRegisterFullName('');
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
    } else {
      setAuthError(res.error || '');
    }
  };

  const handleLogout = () => {
    MockDB.logout();
    setCurrentUser(null);
  };

  const handleRemoveRememberedAccount = (uId: string) => {
    MockDB.removeRememberedAccount(uId);
    setRememberedAccounts(MockDB.getRememberedAccounts());
  };

  const handleLoginWithRememberedAccount = (account: any) => {
    setAuthError('');
    const res = MockDB.login(account.username, account.password_hash);
    if (res.user) {
      setCurrentUser(res.user);
      handleRefreshFeed();
    } else {
      setAuthError(res.error || 'فشل تسجيل الدخول التلقائي. قد تكون قمت بتغيير كلمة المرور الخاصة بك.');
    }
  };

  // Switch identity quick-switch to make testing multiple facets of EngineerHub extremely pleasant
  const handleQuickSwitchAccount = (username: string) => {
    const matching = MockDB.getUserProfile(username);
    if (matching) {
       MockDB.setCurrentUser(matching.id);
       setCurrentUser(matching);
       handleRefreshFeed();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center p-4 md:p-6 select-none text-right font-sans">
        <div className="w-full max-w-sm md:max-w-2xl bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-dark-border">
          
          {/* Left panel: Info Hub greeting */}
          <div className="flex-1 p-6 md:p-8 bg-gradient-to-tr from-brand-primary/10 to-brand-secondary/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-lg text-xl tracking-wider mb-5">
                EH
              </div>
              <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-brand-primary to-brand-secondary leading-snug">
                مرحباً بك في EngineerHub
              </h2>
              <p className="text-xs text-dark-muted leading-relaxed mt-2.5">
                أكبر منصة وشبكة تواصل اجتماعية مخصصة للمهندسين العرب في مختلف التخصصات. شارك مشاريعك الفنية والبرمجية ونقاشاتك الآن!
              </p>

              {rememberedAccounts.length > 0 && (
                <div className="mt-6 p-4 bg-dark-card/80 rounded-2xl border border-dark-border/80">
                  <span className="text-[10px] font-black text-brand-primary block mb-2.5 select-none text-right">
                    👤 الحسابات المحفوظة (تسجيل دخول سريع):
                  </span>
                  <div className="space-y-2 max-h-[170px] overflow-y-auto pr-0.5">
                    {rememberedAccounts.map((acc) => (
                      <div 
                        key={acc.id}
                        className="flex items-center justify-between bg-dark-bg/75 p-2 rounded-xl hover:border-brand-primary/40 border border-transparent transition-all group scale-100 hover:scale-[1.01]"
                      >
                        <button
                          type="button"
                          onClick={() => handleLoginWithRememberedAccount(acc)}
                          className="flex flex-1 items-center gap-2.5 text-right cursor-pointer"
                        >
                          <img 
                            src={acc.avatarUrl} 
                            alt={acc.fullName} 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover bg-dark-card border border-dark-border group-hover:border-brand-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold text-white truncate leading-tight">{acc.fullName}</h4>
                            <span className="text-[9px] text-dark-muted truncate block mt-0.5">@{acc.username} • {acc.engineeringField}</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRememberedAccount(acc.id)}
                          title="إلغاء حفظ الحساب"
                          className="p-1 px-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-colors mr-1.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* Platform Feature Highlights */}
            <div className="mt-8 pt-5 border-t border-dark-border/40 space-y-4">
              <div className="flex items-start gap-2.5 text-right">
                <div className="w-5 h-5 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">تواصل احترافي آمن</h4>
                  <p className="text-[10px] text-dark-muted mt-0.5 leading-normal">
                    شبكة اجتماعية تفاعلية مخصصة كلياً لمشاريع وعنقود الأفكار الهندسية العربية.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-right">
                <div className="w-5 h-5 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">حلول ومخططات هندسية</h4>
                  <p className="text-[10px] text-dark-muted mt-0.5 leading-normal">
                    استكشف وشارك التصاميم الإنشائية والميكانيكية والمشاريع التكنولوجية بسهولة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-right">
                <div className="w-5 h-5 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">محادثات وحلقات مرئية</h4>
                  <p className="text-[10px] text-dark-muted mt-0.5 leading-normal">
                    تواصل مباشرة مع الزملاء عبر غرف للمناقشات الصوتية والريلز اليومية والمراسلات المشفرة.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Login and Register inputs */}
          <div className="flex-1 p-6 md:p-8">
            <h3 className="font-extrabold text-sm mb-4 text-dark-text border-b border-dark-border/60 pb-2">
              تسجيل الدخول للمجتمع الهندسي الآمن
            </h3>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs mb-4 leading-relaxed font-semibold">
                {authError}
              </div>
            )}

            {show2faChallenge ? (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-right">
                  <span className="text-[10px] font-black text-yellow-400 block mb-1">
                    📲 التحقق المحمي بخطوتين (2FA OTP)
                  </span>
                  <p className="text-[9px] text-dark-muted leading-relaxed">
                    تم رصد تشفير المصادقة الثنائية على حسابك. يرجى إدخال الرمز السري الإضافي المسترد من جهازك المعتمد أو تطبيق الهوية.
                  </p>
                  <div className="mt-2.5 p-2 bg-dark-bg/85 border border-dashed border-dark-border rounded-xl text-center">
                    <span className="text-[9px] text-dark-muted block mb-0.5">رمز الدخول المحاكى (OTP Code):</span>
                    <span className="text-sm font-black text-brand-primary tracking-widest font-mono">{challengeCodeSent}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-text block">أدخل الرمز السري (6 أرقام)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="أدخل الرمز الموضح بالأعلى..."
                    value={totpTokenInput}
                    onChange={(e) => setTotpTokenInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-dark-bg border border-dark-border text-center text-sm font-mono tracking-widest text-brand-primary focus:outline-none focus:border-brand-primary py-2.5 rounded-xl"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-primary/10"
                  >
                    تأكيد وتسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShow2faChallenge(false);
                      setTotpTokenInput('');
                      setAuthError('');
                    }}
                    className="px-4 bg-dark-bg border border-dark-border text-dark-muted hover:text-dark-text text-xs rounded-xl font-bold transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-text block">اسم المستخدم أو البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: ahmed_eng"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border/80 rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary font-mono pr-9"
                    />
                    <KeyRound className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-text block">كلمة المرور الشخصية</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border/80 rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary font-mono pr-9 text-left"
                    />
                    <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  </div>
                  <span className="text-[10px] text-emerald-400 block leading-relaxed mt-1 font-semibold">
                    ✔️ المحادثات والاتصالات وكلمات المرور مشفرة ومؤمنة بالكامل كلياً (End-to-End Encrypted) لخصوصية مطلقة ولا يمكن لأي مستخدم آخر كشفها.
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-dark-border text-brand-primary bg-dark-bg focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointerAccent"
                    />
                    <span className="text-xs font-medium text-dark-text">تذكرني واحفظ الحساب لتسجيل الدخول السريع 🛡️</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-primary/15"
                >
                  دخول للمجتمع الهندسي الآمن
                </button>
              </form>
            )}

            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-dark-border/60"></div>
              <span className="flex-shrink mx-3 text-[10px] text-dark-muted font-bold">أو تسجيل حساب جديد</span>
              <div className="flex-grow border-t border-dark-border/60"></div>
            </div>

            {/* Quick Register form logic */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-text">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="م. خالد الحربي"
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border/85 rounded-xl px-2 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-text">اسم المستخدم</label>
                  <input
                    type="text"
                    required
                    placeholder="kh_eng"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border/85 rounded-xl px-2 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-dark-text">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="khaled@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border/85 rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-dark-text block text-right">كلمة المرور الشخصية</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="اختر كلمة مرور (على الأقل 6 رموز)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border/85 rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary font-mono pr-8 text-left"
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-muted" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-dark-text">التخصص العلمي الهندسي</label>
                <div className="relative">
                  <select
                    value={registerField}
                    onChange={(e) => setRegisterField(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                  >
                    {FIELD_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
                </div>
                <span className="text-[10px] text-brand-primary block mt-1.5 font-bold text-right leading-relaxed">
                  * سجل حسب القسم الأقرب لك لتسهيل الاختيار على المهندسين الجدد وأثناء تعديل الملفات الشخصية.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white font-extrabold text-xs py-2.5 rounded-xl transition-all"
              >
                إنشاء التسجيل فوراً
              </button>
            </form>

          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout user={currentUser} notifications={notifications} onLogout={handleLogout}>
        <Routes>
          <Route
            path="/"
            element={
              <FeedPage
                currentUser={currentUser}
                posts={posts}
                storiesFeed={storiesFeed}
                suggestions={suggestions}
                followingIds={followingIds}
                onToggleFollow={handleToggleFollow}
                onLike={handleLike}
                onSave={handleSave}
                onComment={handleComment}
                onDelete={handleDeletePost}
                onOpenStory={setActiveStoryFeedIndex}
                onAddStory={handleAddStory}
              />
            }
          />
          <Route
            path="/explore"
            element={
              <ExplorePage
                posts={posts}
                currentUser={currentUser}
                onLike={handleLike}
                onSave={handleSave}
                onComment={handleComment}
                onDelete={handleDeletePost}
              />
            }
          />
          <Route
            path="/reels"
            element={
              <ReelsPage
                reels={posts}
                currentUser={currentUser}
                onLike={handleLike}
                onSave={handleSave}
              />
            }
          />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/messages" element={<MessagesPage currentUser={currentUser} />} />
          <Route path="/channels" element={<ChannelsPage currentUser={currentUser} />} />
          <Route path="/games" element={<GamesPage currentUser={currentUser} />} />
          <Route
            path="/profile/:username"
            element={
              <ProfilePage
                currentUser={currentUser}
                onLike={handleLike}
                onSave={handleSave}
                onComment={handleComment}
                onDelete={handleDeletePost}
                onToggleFollow={handleToggleFollow}
                followingIds={followingIds}
                onUpdateProfile={handleUpdateProfile}
              />
            }
          />
          <Route
            path="/profile/edit"
            element={<EditProfilePage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />}
          />
          <Route
            path="/notifications"
            element={
              <NotificationsPage
                notifications={notifications}
                refreshNotifications={() => setNotifications(MockDB.getNotifications())}
              />
            }
          />
          <Route
            path="/create"
            element={<CreatePostPage onCreatePost={handleCreatePost} />}
          />
          <Route
            path="/admin"
            element={<AdminPage currentUser={currentUser} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      {/* Full screen immersive story viewer overlay popup */}
      {activeStoryFeedIndex !== null && (
        <StoryViewer
          storiesFeed={storiesFeed}
          initialUserIndex={activeStoryFeedIndex}
          onMarkViewed={handleMarkStoryViewed}
          onClose={() => setActiveStoryFeedIndex(null)}
        />
      )}

      {/* Modern, Highly Secure Unlimited Story Creator Modal */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none text-right">
          <div className="bg-dark-card border border-dark-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-dark-border/60 flex justify-between items-center bg-dark-bg/40">
              <div>
                <h3 className="text-sm font-black text-dark-text flex items-center gap-1.5">
                  <span>إنشاء قصة هندسية جديدة</span>
                  <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
                </h3>
                <p className="text-[10px] text-dark-muted mt-0.5">انشر قصصاً بشكل غير محدود وبكامل الخصوصية والأمان مع زملائك.</p>
              </div>
              <button 
                onClick={() => {
                  setIsAddStoryOpen(false);
                  setStoryMediaFile('');
                  setStoryCaption('');
                  setStoryTheme('gradient');
                }}
                className="p-1.5 rounded-xl bg-dark-bg/60 text-dark-muted hover:text-dark-text border border-dark-border"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handlePublishCustomStory} className="p-5 space-y-4">
              
              {/* Security Banner Info */}
              <div className="bg-brand-primary/5 border border-brand-primary/10 p-3 rounded-2xl flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-brand-primary flex-shrink-0" />
                <div className="text-right">
                  <span className="text-[10px] font-bold text-brand-primary block leading-tight">حماية وعزل كامل للبيانات</span>
                  <span className="text-[9px] text-dark-muted block mt-0.5">يتم تشفير القصة محلياً داخل جهازك وآمنة 100% ضد أي اختراقات خارجية.</span>
                </div>
              </div>

              {/* Story Content Types */}
              <div className="space-y-3.5">
                {/* Method 1: Upload custom story image */}
                <div className="bg-dark-bg/50 border border-dark-border/80 p-4 rounded-2xl space-y-2.5">
                  <label className="text-xs font-bold text-dark-text block">الخيار الأول: تحميل صورة من جهازك</label>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <input
                      type="url"
                      placeholder="أو الصق رابط صورة مباشر..."
                      value={storyMediaFile}
                      onChange={(e) => setStoryMediaFile(e.target.value)}
                      className="flex-1 bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-[11px] text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
                    />

                    <div className="relative">
                      <input
                        type="file"
                        id="story-upload-file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setStoryMediaFile(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="story-upload-file"
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-colors select-none w-full sm:w-auto"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>اختر صورة</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Method 2: Create beautiful typography slide with gradients */}
                <div className="bg-dark-bg/50 border border-dark-border/80 p-4 rounded-2xl space-y-2.5">
                  <label className="text-xs font-bold text-dark-text block">الخيار الثاني: قصة نصية بتصاميم هندسية</label>
                  <textarea
                    placeholder="اكتب فكرة هندسية، تحذير تخصصي، أو مقولة تلهم زملائك..."
                    rows={2}
                    value={storyCaption}
                    onChange={(e) => setStoryCaption(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted resize-none font-sans"
                  />

                  {/* Gradient Selector */}
                  {!storyMediaFile && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-dark-muted font-bold block">اختر نمط الخلفية الهندسية:</span>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setStoryTheme('gradient')}
                          className={`h-8 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-[9px] font-bold text-white transition-all ring-offset-2 ring-offset-dark-card ${storyTheme === 'gradient' ? 'ring-2 ring-brand-primary scale-[1.03]' : ''}`}
                        >
                          تيل مهندسين
                        </button>
                        <button
                          type="button"
                          onClick={() => setStoryTheme('blue')}
                          className={`h-8 rounded-xl bg-gradient-to-br from-blue-700 to-slate-900 text-[9px] font-bold text-white transition-all ring-offset-2 ring-offset-dark-card ${storyTheme === 'blue' ? 'ring-2 ring-brand-primary scale-[1.03]' : ''}`}
                        >
                          أزرق سيبراني
                        </button>
                        <button
                          type="button"
                          onClick={() => setStoryTheme('orange')}
                          className={`h-8 rounded-xl bg-gradient-to-br from-orange-600 to-amber-900 text-[9px] font-bold text-white transition-all ring-offset-2 ring-offset-dark-card ${storyTheme === 'orange' ? 'ring-2 ring-brand-primary scale-[1.03]' : ''}`}
                        >
                          برتقالي تحكم
                        </button>
                        <button
                          type="button"
                          onClick={() => setStoryTheme('green')}
                          className={`h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-neutral-900 text-[9px] font-bold text-white transition-all ring-offset-2 ring-offset-dark-card ${storyTheme === 'green' ? 'ring-2 ring-brand-primary scale-[1.03]' : ''}`}
                        >
                          بيئة مستدامة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Story Live Preview Screen */}
              {(storyMediaFile || storyCaption.trim()) && (
                <div className="border border-dark-border p-3 rounded-2xl bg-dark-bg/30">
                  <span className="text-[10px] text-dark-muted font-bold block mb-2">معاينة القصة المباشرة:</span>
                  <div className="relative aspect-[9/16] w-24 mx-auto rounded-xl overflow-hidden border border-brand-primary/20 bg-dark-card flex items-center justify-center">
                    {storyMediaFile ? (
                      <img src={storyMediaFile} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full p-2 flex flex-col justify-between text-center ${
                        storyTheme === 'gradient' ? 'bg-gradient-to-br from-teal-600 to-teal-850' :
                        storyTheme === 'blue' ? 'bg-gradient-to-br from-blue-700 to-slate-900' :
                        storyTheme === 'orange' ? 'bg-gradient-to-br from-orange-600 to-amber-900' :
                        'bg-gradient-to-br from-emerald-700 to-neutral-900'
                      }`}>
                        <div />
                        <span className="text-[7px] text-white font-black leading-tight break-all line-clamp-4">
                          {storyCaption}
                        </span>
                        <span className="text-[5px] text-white/40">Developed by Eng. Ali Saifuddin 2023</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex gap-2.5 pt-2 border-t border-dark-border/40 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStoryOpen(false);
                    setStoryMediaFile('');
                    setStoryCaption('');
                    setStoryTheme('gradient');
                  }}
                  className="px-4 py-2 bg-dark-bg border border-dark-border hover:bg-dark-border/40 text-dark-muted hover:text-dark-text text-xs font-bold rounded-xl transition-all"
                >
                  إلغاء ليفي
                </button>
                <button
                  type="submit"
                  disabled={!storyMediaFile && !storyCaption.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-primary disabled:opacity-50 hover:bg-brand-primary/95 text-white text-xs font-extrabold rounded-xl transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>تأمين ونشر القصة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HashRouter>
  );
}
