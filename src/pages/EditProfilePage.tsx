import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { MockDB } from '../utils/db';
import { useLanguage } from '../components/LanguageContext';
import { 
  Camera, 
  MapPin, 
  Link2, 
  Briefcase, 
  EyeOff, 
  Save, 
  ArrowLeft, 
  Shield, 
  Lock, 
  Key, 
  Smartphone, 
  Users, 
  RefreshCw, 
  AlertTriangle, 
  Trash2 
} from 'lucide-react';

interface EditProfilePageProps {
  currentUser: User | null;
  onUpdateProfile: (updates: Partial<User>) => void;
}

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

export default function EditProfilePage({ currentUser: initialUser, onUpdateProfile }: EditProfilePageProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t, isRtl } = useLanguage();
  
  // Local profile state synced with current state
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile');

  // Tab 1: Profile fields
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [locationValue, setLocationValue] = useState(currentUser?.location || '');
  const [engineeringField, setEngineeringField] = useState(currentUser?.engineeringField || 'هندسة برمجيات');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [professionalStatus, setProfessionalStatus] = useState(currentUser?.professionalStatus || 'متاح للعمل');
  const [skillsInput, setSkillsInput] = useState(currentUser?.skills?.join(', ') || '');

  // Tab 2: Security fields & simulation
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [simulatedFailedAttempts, setSimulatedFailedAttempts] = useState(0);
  const [isSimulatedLocked, setIsSimulatedLocked] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // Tab 3: Privacy & Moderation
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [hideActiveStatus, setHideActiveStatus] = useState(currentUser?.hideActiveStatus || false);
  const [messageControls, setMessageControls] = useState<'all' | 'followers' | 'none'>('all');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);

  // Feedback notifications
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load all users for the privacy block/mute list comparison
  useEffect(() => {
    // Sync current user states when provided
    if (initialUser) {
      setCurrentUser(initialUser);
      setFullName(initialUser.fullName || '');
      setBio(initialUser.bio || '');
      setWebsite(initialUser.website || '');
      setLocationValue(initialUser.location || '');
      setEngineeringField(initialUser.engineeringField || 'هندسة برمجيات');
      setAvatarUrl(initialUser.avatarUrl || '');
      setIsPrivate(initialUser.isPrivate || false);
      setHideActiveStatus(initialUser.hideActiveStatus || false);
      setProfessionalStatus(initialUser.professionalStatus || 'متاح للعمل');
      setSkillsInput(initialUser.skills?.join(', ') || '');
    }
    
    // Fetch all other users
    const all = MockDB.getAllUsers();
    if (initialUser) {
      setUserSuggestions(all.filter(u => u.id !== initialUser.id));
    } else {
      setUserSuggestions(all);
    }
  }, [initialUser]);

  // Handle lockout countdown simulation
  useEffect(() => {
    let timer: any;
    if (lockoutCountdown > 0) {
      timer = setInterval(() => {
        setLockoutCountdown(prev => {
          if (prev <= 1) {
            setIsSimulatedLocked(false);
            setSimulatedFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutCountdown]);

  const handleGeneralSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;

    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updates = {
      fullName,
      bio,
      website,
      location: locationValue,
      engineeringField,
      avatarUrl,
      isPrivate,
      hideActiveStatus,
      professionalStatus,
      skills
    };

    onUpdateProfile(updates);
    
    // Trigger success banner
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    
    // Create security log for profile update
    const updated = MockDB.addSecurityLog(currentUser.id, 'تحديث معلومات الملف الشخصي الأساسية', 'success');
    setCurrentUser(updated);
  };

  // Toggle 2FA directly
  const handleToggle2FA = (checked: boolean) => {
    if (!currentUser) return;
    const updates = { twoFactorEnabled: checked };
    onUpdateProfile(updates);
    
    const logsText = checked ? 'تفعيل ميزة التحقق بخطوتين 2FA' : 'إلغاء تفعيل ميزة التحقق بخطوتين 2FA';
    const updated = MockDB.addSecurityLog(currentUser.id, logsText, checked ? 'success' : 'warning');
    setCurrentUser(updated);
  };

  // Toggle Privacy status directly
  const handleTogglePrivateAccount = (checked: boolean) => {
    setIsPrivate(checked);
    if (!currentUser) return;
    const updates = { isPrivate: checked };
    onUpdateProfile(updates);
    
    const logsText = checked ? 'تغيير الخصوصية: حساب مغلق (خاص)' : 'تغيير الخصوصية: حساب مهني عام';
    const updated = MockDB.addSecurityLog(currentUser.id, logsText, 'success');
    setCurrentUser(updated);
  };

  const handleToggleInvisible = (checked: boolean) => {
    setHideActiveStatus(checked);
    if (!currentUser) return;
    const updates = { hideActiveStatus: checked };
    onUpdateProfile(updates);
    
    const logsText = checked ? 'تفعيل التصفح بوضعية التخفي (Invisible)' : 'إلغاء وضع التخفي والظهور كمتصل حالياً';
    const updated = MockDB.addSecurityLog(currentUser.id, logsText, 'success');
    setCurrentUser(updated);
  };

  // Handle Password Mutation
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية والجديدة' });
      return;
    }

    const res = MockDB.changePassword(currentUser.id, currentPassword, newPassword);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setPasswordStatus({ type: 'success', text: 'تم تحديث الرقم السري للحساب بنجاح وتأمينه بتشفير SHA-256!' });
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setPasswordStatus({ type: 'error', text: res.error || 'فشلت العملية' });
    }

    setTimeout(() => setPasswordStatus(null), 4000);
  };

  // Terminate device session
  const handleTerminateSession = (sessId: string) => {
    if (!currentUser) return;
    const updated = MockDB.terminateSession(currentUser.id, sessId);
    setCurrentUser(updated);
  };

  // Terminate all helper sessions to log out elsewhere
  const handleTerminateAllOtherSessions = () => {
    if (!currentUser) return;
    const remaining = (currentUser.activeSessions || []).filter(s => s.isCurrent);
    const updatedUser = MockDB.updateUserProfile({ activeSessions: remaining });
    MockDB.addSecurityLog(currentUser.id, 'إنهاء كافة الجلسات النشطة على الأجهزة الأخرى فوراً', 'warning');
    setCurrentUser(updatedUser);
  };

  // Trigger rate limiter brute-force mock
  const handleSimulateBruteForce = () => {
    if (isSimulatedLocked) return;
    
    const nextAttempts = simulatedFailedAttempts + 1;
    if (nextAttempts >= 3) {
      setIsSimulatedLocked(true);
      setLockoutCountdown(30);
      setSimulatedFailedAttempts(3);
      if (currentUser) {
        const logMsg = 'رصد هجوم brute force: تم إغلاق الحساب مؤقتاً لتكرار كلمات المرور الخاطئة';
        const updated = MockDB.addSecurityLog(currentUser.id, logMsg, 'failed', 'Unidentified Linux curl script', '185.34.19.11');
        setCurrentUser(updated);
      }
    } else {
      setSimulatedFailedAttempts(nextAttempts);
      if (currentUser) {
        MockDB.addSecurityLog(currentUser.id, `محاولة اختراق محاكاة بروتوكول Rate-Limit (${nextAttempts}/3)`, 'failed', 'Simulation client', '127.0.0.1');
        // read again
        const fresh = MockDB.getCurrentUser();
        if (fresh) setCurrentUser(fresh);
      }
    }
  };

  // Handle Block/Mute/Restrict lists overrides
  const handleTogglePrivacyCategory = (category: 'blocked' | 'muted' | 'restricted', targetId: string) => {
    if (!currentUser) return;
    const updated = MockDB.togglePrivacyOverride(currentUser.id, category, targetId);
    setCurrentUser(updated);
  };

  return (
    <div className={`p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none ${isRtl ? 'rtl text-right' : 'ltr text-left'} font-sans max-w-4xl mx-auto`}>
      
      {/* Top Banner with PWA Back Action */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-dark-border/40`}>
        <div>
          <span className={`text-[9px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-2.5 py-0.5 rounded font-bold uppercase tracking-wider block w-fit mb-1`}>
            {t('settings.title_banner')}
          </span>
          <h1 className="text-xl md:text-2xl font-black text-white">{t('settings.title')}</h1>
          <p className="text-xs text-dark-muted mt-1">{t('settings.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-1.5 px-4 py-2 bg-dark-card hover:bg-dark-border border border-dark-border rounded-xl text-dark-muted hover:text-dark-text text-xs transition-colors self-end md:self-center`}
        >
          <span>{t('settings.back_btn')}</span>
          <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-500/15 border border-green-500/20 text-green-400 font-bold text-xs rounded-xl mb-4 text-center flex items-center justify-center gap-2 animate-pulse">
          <span>{t('settings.success_save')}</span>
        </div>
      )}

      {/* Tabs Menu Navigation Row */}
      <div className="bg-dark-card border border-dark-border/80 p-1.5 rounded-2xl flex items-center gap-1.5 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15 font-black'
              : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg/60'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t('settings.tab_profile')}</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'security'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15 font-black'
              : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{t('settings.tab_security')}</span>
          {currentUser?.twoFactorEnabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'privacy'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15 font-black'
              : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{t('settings.tab_privacy')}</span>
        </button>
      </div>

      {/* Tab 1 content: Profile details */}
      {activeTab === 'profile' && (
        <form onSubmit={(e) => { e.preventDefault(); handleGeneralSave(); }} className="space-y-5">
          
          {/* Avatar Picture Section */}
          <div className={`bg-dark-card border border-dark-border p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5`}>
            <img
              src={avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
              alt="My Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary shadow-lg"
            />
            <div className={`flex-1 w-full text-center ${isRtl ? 'sm:text-right' : 'sm:text-left'}`}>
              <label className="text-xs font-bold text-dark-text block mb-1.5">{t('settings.avatar_label')}</label>
              
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-2.5">
                <input
                  type="url"
                  placeholder={t('settings.avatar_placeholder')}
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className={`flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans`}
                />
                
                <div className="relative flex-shrink-0">
                  <input
                    type="file"
                    id="avatar-upload-input"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setAvatarUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload-input"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-brand-primary/10 select-none"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('settings.avatar_upload')}</span>
                  </label>
                </div>
              </div>
              <span className="text-[10px] text-dark-muted block">
                {t('settings.avatar_help')}
              </span>
            </div>
          </div>

          {/* Interactive Language Selector directly in the Profile Appearance cockpit */}
          <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-3.5">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 pb-2 border-b border-dark-border/40">
              <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" style={{ animationDuration: '6s' }} />
              <span>{t('settings.lang_heading')}</span>
            </h3>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-dark-muted block">
                {t('settings.lang_label')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
                    language === 'ar'
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm shadow-brand-primary/5'
                      : 'bg-dark-bg border-dark-border text-dark-muted hover:text-dark-text'
                  }`}
                >
                  <span>🇸🇦 العربية (Arabic - RTL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
                    language === 'en'
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm shadow-brand-primary/5'
                      : 'bg-dark-bg border-dark-border text-dark-muted hover:text-dark-text'
                  }`}
                >
                  <span>🇺🇸 English (English - LTR)</span>
                </button>
              </div>
              <p className="text-[10px] text-dark-muted leading-relaxed">
                {t('settings.lang_notice')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name block */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-1.5">
              <label className="text-xs font-bold text-dark-text block">{t('settings.fullname_label')}</label>
              <input
                type="text"
                required
                placeholder={isRtl ? "مثال: م. علي سيف الدين" : "e.g. Eng. Ali Saifuddin"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* Specialization Selection */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-1.5">
              <label className="text-xs font-bold text-dark-text block">{t('settings.field_label')}</label>
              <div className="relative">
                <select
                  value={engineeringField}
                  onChange={(e) => setEngineeringField(e.target.value)}
                  className={`w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary appearance-none cursor-pointer ${isRtl ? 'text-right pl-9' : 'text-left pr-9'}`}
                >
                  {FIELD_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <Briefcase className={`w-4 h-4 absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none`} />
              </div>
            </div>
          </div>

          {/* Professional Status Selection */}
          <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-1.5">
            <label className="text-xs font-bold text-dark-text block">{t('settings.status_label')}</label>
            <div className="relative">
              <select
                value={professionalStatus}
                onChange={(e) => setProfessionalStatus(e.target.value)}
                className={`w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary appearance-none cursor-pointer ${isRtl ? 'text-right pl-9' : 'text-left pr-9'}`}
              >
                <option value="متاح للعمل">{isRtl ? '🟢 متاح للعمل (تلقي فرص جديدة)' : '🟢 Available (Open to opportunities)'}</option>
                <option value="مشغول في مشروع">{isRtl ? '🟡 مشغول في مشروع (لا أستقبل عروضاً حالية)' : '🟡 Busy in a project (unavailable)'}</option>
                <option value="أبحث عن فرص">{isRtl ? '🔵 أبحث عن فرص (مهتم بالتعاقد الفوري)' : '🔵 Searching for jobs (Immediate hirable)'}</option>
                <option value="غير محدد">{isRtl ? '⚪ غير محدد' : '⚪ Unspecified'}</option>
              </select>
              <Briefcase className={`w-4 h-4 absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none`} />
            </div>
          </div>

          {/* Technical/Programming Skills Input */}
          <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-1.5">
            <label className="text-xs font-bold text-dark-text block">{t('settings.skills_label')}</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('settings.skills_placeholder')}
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className={`w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
            <span className="text-[10px] text-dark-muted block mt-1">{t('settings.skills_help')}</span>
          </div>

          {/* Bio block */}
          <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-1.5">
            <label className="text-xs font-bold text-dark-text block">{t('settings.bio_label')}</label>
            <textarea
              placeholder={t('settings.bio_placeholder')}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary resize-none font-sans ${isRtl ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Website Portfolio section */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-1.5">
              <label className="text-xs font-bold text-dark-text block">{t('settings.website_label')}</label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://myportfolio.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={`w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 ${isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans`}
                />
                <Link2 className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-dark-muted`} />
              </div>
            </div>

            {/* Location block */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-1.5">
              <label className="text-xs font-bold text-dark-text block">{t('settings.location_label')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={isRtl ? "مثال: دبي، الإمارات العربية المتحدة" : "e.g. Dubai, UAE"}
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  className={`w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 ${isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted`}
                />
                <MapPin className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-dark-muted`} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-xs py-4 rounded-xl shadow-lg shadow-brand-primary/10 transition-all flex items-center justify-center gap-2 animate-none"
          >
            <Save className="w-4 h-4" />
            <span>{t('settings.save_btn')}</span>
          </button>
        </form>
      )}

      {/* Tab 2 content: Security Dashboard */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Two-Factor Authentication Management Card */}
          <div className="bg-dark-card border border-dark-border/80 p-5 rounded-2xl relative overflow-hidden">
            <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-1.5 h-full ${currentUser?.twoFactorEnabled ? 'bg-green-500' : 'bg-yellow-500'}`} />
            
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${currentUser?.twoFactorEnabled ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                    {currentUser?.twoFactorEnabled ? t('settings.sec_2fa_status_active') : t('settings.sec_2fa_status_inactive')}
                  </span>
                  <h3 className="text-xs font-black text-white">{t('settings.sec_2fa_title')}</h3>
                </div>
                <p className="text-[10px] text-dark-muted leading-relaxed max-w-xl">
                  {t('settings.sec_2fa_desc')}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-[10px] font-bold text-dark-muted">{t('settings.sec_2fa_toggle')}</span>
                <input
                  type="checkbox"
                  checked={currentUser?.twoFactorEnabled || false}
                  onChange={(e) => handleToggle2FA(e.target.checked)}
                  className="w-5 h-5 rounded-md accent-brand-primary cursor-pointer border border-dark-border/80"
                />
              </div>
            </div>
            {currentUser?.twoFactorEnabled && (
              <div className="mt-3 p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                <p className="text-[9px] text-brand-primary font-bold leading-relaxed">
                  {t('settings.sec_2fa_active_notice')}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Change Password Card */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5 pb-2 border-b border-dark-border/40">
                  <Key className="w-3.5 h-3.5 text-brand-primary" />
                  <span>{t('settings.sec_pw_title')}</span>
                </h3>

                {passwordStatus && (
                  <div className={`p-2.5 rounded-xl text-[10px] font-bold mb-3 ${
                    passwordStatus.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/25 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/25 text-red-500'
                  }`}>
                    {passwordStatus.text === 'تم تحديث الرقم السري للحساب بنجاح وتأمينه بتشفير SHA-256!' ? t('settings.sec_pw_success') : (passwordStatus.text === 'يرجى إدخال كلمة المرور الحالية والجديدة' ? t('settings.sec_pw_error_required') : passwordStatus.text)}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-dark-muted block">{t('settings.sec_pw_current')}</label>
                    <input
                      type="password"
                      placeholder="••••••"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary font-sans ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-dark-muted block">{t('settings.sec_pw_new')}</label>
                    <input
                      type="password"
                      placeholder={isRtl ? "أدخل كلمة مرور قوية جديدة..." : "Enter a strong new password..."}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary font-sans ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                    <span className="text-[9px] text-dark-muted block">{t('settings.sec_pw_help')}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-dark-bg hover:bg-dark-border text-white border border-dark-border/80 hover:border-brand-primary font-bold text-xs rounded-xl transition-all"
                  >
                    {t('settings.sec_pw_update_btn')}
                  </button>
                </form>
              </div>
            </div>

            {/* Rate Limiting, Threat telemetry simulator card */}
            <div className="bg-dark-card border border-dark-border p-5 rounded-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center justify-between pb-2 border-b border-dark-border/40">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                    <span>{t('settings.sec_rate_title')}</span>
                  </div>
                  <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                    {t('settings.sec_rate_active')}
                  </span>
                </h3>

                <div className={`p-3 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white">{t('settings.sec_rate_limit')}</span>
                    <span className="text-dark-muted font-mono">{t('settings.sec_rate_limit_value')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white">{t('settings.sec_rate_registered')}</span>
                    <span className={`font-black font-mono ${simulatedFailedAttempts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {simulatedFailedAttempts} / 3
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white">{t('settings.sec_rate_status')}</span>
                    {isSimulatedLocked ? (
                      <span className="text-red-500 font-bold animate-pulse text-[9px] bg-red-500/15 px-2 py-0.5 rounded">
                        {t('settings.sec_rate_status_locked').replace('{time}', String(lockoutCountdown))}
                      </span>
                    ) : (
                      <span className="text-green-400 font-bold text-[9px] bg-green-500/15 px-2 py-0.5 rounded">
                        {t('settings.sec_rate_status_active')}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-dark-muted leading-relaxed">
                  {t('settings.sec_rate_help')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateBruteForce}
                disabled={isSimulatedLocked}
                className={`w-full text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm ${
                  isSimulatedLocked 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-500 cursor-not-allowed' 
                    : 'bg-brand-primary/10 hover:bg-brand-primary/15 border border-brand-primary/20 text-brand-primary'
                }`}
              >
                {isSimulatedLocked ? (isRtl ? `انتظر فك الحظر المؤقت (${lockoutCountdown}ث)` : `Wait system cooling (${lockoutCountdown}s)`) : t('settings.sec_brute_test_btn')}
              </button>
            </div>
          </div>

          {/* Active Device Sessions List */}
          <div className="bg-dark-card border border-dark-border/85 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-dark-border/40">
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-brand-primary" />
                  <span>{t('settings.sec_sessions_title')}</span>
                </h3>
                <p className="text-[10px] text-dark-muted mt-0.5">{t('settings.sec_sessions_desc')}</p>
              </div>
              <button
                type="button"
                onClick={handleTerminateAllOtherSessions}
                className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all font-bold px-3 py-1.5 rounded-lg select-none"
              >
                {t('settings.sec_sessions_terminate_all')}
              </button>
            </div>

            <div className="divide-y divide-dark-border/40 space-y-3">
              {(currentUser?.activeSessions || []).map((session, index) => (
                <div key={session.id || index} className="flex items-center justify-between pt-3 first:pt-0">
                  <div className={`flex items-start gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="p-2 rounded-xl bg-dark-bg border border-dark-border/80 text-brand-primary mt-0.5">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-white">{session.deviceName}</span>
                        {session.isCurrent && (
                          <span className="text-[8px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold">
                            {t('settings.sec_sessions_current')}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-dark-muted block">
                        📍 {session.location} | {isRtl ? 'عنوان IP' : 'IP address'}: <span className="font-mono font-semibold">{session.ip}</span>
                      </span>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleTerminateSession(session.id)}
                      className="text-[9px] text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      {t('settings.sec_sessions_terminate')}
                    </button>
                  )}
                </div>
              ))}
              
              {(currentUser?.activeSessions || []).length === 0 && (
                <div className="text-center py-4 text-[10px] text-dark-muted">
                  {t('settings.sec_sessions_none')}
                </div>
              )}
            </div>
          </div>

          {/* Security Logs (سجل تنبيهات الأمان) */}
          <div className="bg-dark-card border border-dark-border/85 p-5 rounded-2xl space-y-3.5">
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brand-primary" />
                <span>{t('settings.sec_logs_title')}</span>
              </h3>
              <p className="text-[10px] text-dark-muted mt-0.5">{t('settings.sec_logs_desc')}</p>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-[10px]`}>
                <thead>
                  <tr className="border-b border-dark-border text-dark-muted uppercase font-bold text-[9px]">
                    <th className="pb-2.5">{t('settings.sec_logs_action')}</th>
                    <th className="pb-2.5 text-center">{t('settings.sec_logs_device')}</th>
                    <th className="pb-2.5 text-center">{t('settings.sec_logs_ip')}</th>
                    <th className="pb-2.5 text-center">{t('settings.sec_logs_time')}</th>
                    <th className="pb-2.5 text-center">{t('settings.sec_logs_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {(currentUser?.securityLogs || []).map((log, index) => (
                    <tr key={log.id || index} className="text-dark-text/90 hover:bg-dark-bg/40 transition-colors">
                      <td className="py-3 font-semibold text-white">{log.action}</td>
                      <td className="py-3 text-center text-dark-muted">{log.device}</td>
                      <td className="py-3 text-center font-mono font-semibold text-dark-muted/80">{log.ip}</td>
                      <td className="py-3 text-center text-dark-muted font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="py-3 text-center">
                        {log.status === 'success' && (
                          <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            Success
                          </span>
                        )}
                        {log.status === 'warning' && (
                          <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            Warning
                          </span>
                        )}
                        {log.status === 'failed' && (
                          <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                            FAIL BLOCK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(currentUser?.securityLogs || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-dark-muted font-bold text-[10px]">
                        {t('settings.sec_logs_none')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Privacy & Moderation list */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          
          {/* General Privacy settings switches */}
          <div className="bg-dark-card border border-dark-border p-5 rounded-2xl divide-y divide-dark-border/40">
            
            {/* Private Account switch */}
            <div className="pb-4 flex justify-between items-start gap-4">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-white block mb-1">{t('settings.priv_account_label')}</label>
                <span className="text-[10px] text-dark-muted">{t('settings.priv_account_desc')}</span>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => handleTogglePrivateAccount(e.target.checked)}
                className="w-4 h-4 rounded accent-brand-primary cursor-pointer mt-1"
              />
            </div>

            {/* Invisible Status switch */}
            <div className="pt-4 pb-4 flex justify-between items-start gap-4">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-white block mb-1">{t('settings.priv_status_label')}</label>
                <span className="text-[10px] text-dark-muted">{t('settings.priv_status_desc')}</span>
              </div>
              <input
                type="checkbox"
                checked={hideActiveStatus}
                onChange={(e) => handleToggleInvisible(e.target.checked)}
                className="w-4 h-4 rounded accent-brand-primary cursor-pointer mt-1"
              />
            </div>

            {/* Message rules selection */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-white block mb-1">{t('settings.priv_msg_label')}</label>
                <span className="text-[10px] text-dark-muted">{t('settings.priv_msg_desc')}</span>
              </div>
              <select
                value={messageControls}
                onChange={(e: any) => setMessageControls(e.target.value)}
                className={`bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary cursor-pointer ${isRtl ? 'text-right' : 'text-left'} min-w-[150px]`}
              >
                <option value="all">{t('settings.priv_msg_all')}</option>
                <option value="followers">{t('settings.priv_msg_followers')}</option>
                <option value="none">{t('settings.priv_msg_none')}</option>
              </select>
            </div>
          </div>

          {/* User Controls Panel (Block, Mute, Restrict) */}
          <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-primary" />
                <span>{t('settings.priv_users_panel_title')}</span>
              </h3>
              <p className="text-[10px] text-dark-muted mt-0.5">{t('settings.priv_users_panel_desc')}</p>
            </div>

            <div className="divide-y divide-dark-border/40 space-y-3.5">
              {userSuggestions.map((user) => {
                const isBlocked = currentUser?.blockedUserIds?.includes(user.id);
                const isMuted = currentUser?.mutedUserIds?.includes(user.id);
                const isRestricted = currentUser?.restrictedUserIds?.includes(user.id);

                return (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3.5 first:pt-0">
                    <div className={`flex items-center gap-2.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <img
                        src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-dark-border"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-white">{user.fullName}</span>
                          <span className="text-[9px] text-dark-muted font-mono">@{user.username}</span>
                        </div>
                        <span className="text-[9px] text-brand-primary block font-medium">{user.engineeringField}</span>
                        
                        {/* Interactive labels for active restrictions */}
                        <div className="flex gap-1.5 mt-1">
                          {isBlocked && (
                            <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold border border-red-500/15">
                              {t('settings.priv_status_blocked')}
                            </span>
                          )}
                          {isMuted && (
                            <span className="text-[8px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded font-bold border border-yellow-500/15">
                              {t('settings.priv_status_muted')}
                            </span>
                          )}
                          {isRestricted && (
                            <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold border border-purple-500/15">
                              {t('settings.priv_status_restricted')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick moderation toggle actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePrivacyCategory('blocked', user.id)}
                        className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                          isBlocked 
                            ? 'bg-red-500 text-white font-extrabold' 
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                        }`}
                      >
                        {isBlocked ? t('settings.priv_action_unblock') : t('settings.priv_action_block')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePrivacyCategory('muted', user.id)}
                        className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                          isMuted 
                            ? 'bg-yellow-500 text-dark-bg font-extrabold' 
                            : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300'
                        }`}
                      >
                        {isMuted ? t('settings.priv_action_unmute') : t('settings.priv_action_mute')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePrivacyCategory('restricted', user.id)}
                        className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                          isRestricted 
                            ? 'bg-purple-500 text-white font-extrabold' 
                            : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300'
                        }`}
                      >
                        {isRestricted ? t('settings.priv_action_unrestrict') : t('settings.priv_action_restrict')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
