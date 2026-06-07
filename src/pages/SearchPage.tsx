import { useState, useEffect } from 'react';
import { User, Post, Channel } from '../types';
import { MockDB } from '../utils/db';
import { Search, CheckCircle2, Hash, ArrowLeftRight, MessagesSquare, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'channels'>('users');
  const [results, setResults] = useState<{ users: User[]; posts: Post[]; channels: Channel[] }>({
    users: [],
    posts: [],
    channels: []
  });

  // Advanced search states
  const [selectedField, setSelectedField] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Unified watcher to trigger query-based and filter-based search
  useEffect(() => {
    const hasActiveFilters = selectedField || selectedSkill || selectedStatus;

    if (!query.trim() && !hasActiveFilters) {
      setResults({ users: [], posts: [], channels: [] });
      return;
    }

    const timer = setTimeout(() => {
      let matchedUsers: User[] = [];
      let matchedPosts: Post[] = [];
      let matchedChannels: Channel[] = [];

      // 1. Fetch search base
      if (query.trim()) {
        const searchRes = MockDB.search(query);
        matchedUsers = searchRes.users;
        matchedPosts = searchRes.posts;
        matchedChannels = searchRes.channels;
      } else {
        matchedUsers = MockDB.getAllUsers();
        matchedPosts = [];
        matchedChannels = [];
      }

      // 2. Filter by Engineering major (Field)
      if (selectedField) {
        matchedUsers = matchedUsers.filter(u =>
          u.engineeringField.toLowerCase().includes(selectedField.toLowerCase())
        );
      }

      // 3. Filter by Technical / Programming Skill
      if (selectedSkill) {
        const sLower = selectedSkill.toLowerCase();
        matchedUsers = matchedUsers.filter(u => {
          const hasInSkills = u.skills?.some(s => s.toLowerCase().includes(sLower));
          const hasInBio = u.bio?.toLowerCase().includes(sLower);
          const hasInField = u.engineeringField.toLowerCase().includes(sLower);
          return hasInSkills || hasInBio || hasInField;
        });
      }

      // 4. Filter by Professional hiring Status
      if (selectedStatus) {
        matchedUsers = matchedUsers.filter(u => u.professionalStatus === selectedStatus);
      }

      setResults({
        users: matchedUsers,
        posts: matchedPosts,
        channels: matchedChannels
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedField, selectedSkill, selectedStatus]);

  const hasAnyFilter = selectedField || selectedSkill || selectedStatus || query.trim();

  return (
    <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none text-right">
      <div className="max-w-2xl mx-auto">
        {/* Search header container */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2">البحث الموسع والمتقدم</h1>
          <p className="text-xs text-dark-muted">ابحث عن زملاء المهنة والمهندسين حسب الأقسام العلمية، المهارات البرمجية الدقيقة وحالة العمل.</p>
        </div>

        {/* Input block */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="ابحث بالاسم، التخصص أو الكلمات المفتاحية..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-2xl py-3.5 pr-11 pl-4 text-sm text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted" />
        </div>

        {/* Action Toggle for Advanced Filters */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-bold transition-colors text-brand-primary hover:text-brand-secondary"
          >
            <span className="text-[10px] bg-brand-primary/10 px-2 py-1 rounded-lg border border-brand-primary/20">
              {showAdvanced ? '⚙️ إخفاء الفلاتر المتقدمة ▲' : '⚙️ إظهار الفلاتر المتقدمة ▼'}
            </span>
          </button>
          
          {(selectedField || selectedSkill || selectedStatus || query) && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedField('');
                setSelectedSkill('');
                setSelectedStatus('');
              }}
              className="text-[10px] text-red-400 hover:text-red-500 font-bold bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20"
            >
              إعادة تعيين البحث والفلاتر ✕
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field/Major Dropdown select */}
              <div className="space-y-1.5 text-right">
                <label className="text-[10px] font-bold text-dark-muted block">القسم العلمي / التخصص</label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary cursor-pointer text-right appearance-none"
                >
                  <option value="">كل الأقسام العلمية</option>
                  <option value="برمجيات">💻 هندسة البرمجيات</option>
                  <option value="مدنية">🏗️ قسم الهندسة المدنية</option>
                  <option value="ميكانيك">⚙️ قسم الهندسة الميكانيكية</option>
                  <option value="كهرباء">⚡ قسم الهندسة الكهربائية</option>
                  <option value="معمار">📐 قسم الهندسة المعمارية</option>
                  <option value="اتصالات">📡 هندسة اتصالات</option>
                  <option value="إدارة مشاريع">💼 إدارة مشاريع هندسية</option>
                  <option value="طاقة متجددة">🔋 هندسة طاقة متجددة</option>
                  <option value="النفط والغاز">🛢️ قسم هندسة النفط والغاز</option>
                  <option value="كيمي">🧪 قسم الهندسة الكيميائية</option>
                </select>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5 text-right">
                <label className="text-[10px] font-bold text-dark-muted block">الحالة المهنية وتوفر المهندس</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary cursor-pointer text-right appearance-none"
                >
                  <option value="">كل الحالات المهنية</option>
                  <option value="متاح للعمل">🟢 متاح للعمل</option>
                  <option value="مشغول في مشروع">🟡 مشغول في مشروع</option>
                  <option value="أبحث عن فرص">🔵 أبحث عن فرص</option>
                </select>
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="space-y-1.5 text-right">
              <label className="text-[10px] font-bold text-dark-muted block">البحث بمهارة معينة / برنامج متخصص</label>
              <input
                type="text"
                placeholder="اكتب المهارة مثل: Revit، React، AutoCAD، SolidWorks..."
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted/65 font-sans"
              />
            </div>

            {/* Quick Pills for Skills */}
            <div className="space-y-1.5 pt-2 border-t border-dark-border/40 text-right">
              <span className="text-[9px] font-bold text-dark-muted block">مهارات هندسية شائعة للبحث السريع:</span>
              <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
                {['React', 'TypeScript', 'AutoCAD', 'Revit', 'BIM', 'HVAC', 'SolidWorks', 'MATLAB', 'Python', 'PMP'].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill === selectedSkill ? '' : skill)}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all font-mono ${
                      selectedSkill === skill
                        ? 'bg-brand-primary/25 border-brand-primary text-brand-primary font-black scale-105'
                        : 'bg-dark-bg border-dark-border text-dark-muted hover:text-dark-text hover:border-dark-muted'
                    }`}
                  >
                    #{skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs picker if search query or active filters entered */}
        {hasAnyFilter && (
          <div className="flex border-b border-dark-border mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'users'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-muted hover:text-dark-text'
              }`}
            >
              المهندسون ({results.users.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'posts'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-muted hover:text-dark-text'
              }`}
              disabled={!query.trim()}
              title={!query.trim() ? "يرجى كتابة كلمة بحث لإظهار المنشورات المتطابقة" : ""}
            >
              المنشورات ({results.posts.length})
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'channels'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-muted hover:text-dark-text'
              }`}
              disabled={!query.trim()}
              title={!query.trim() ? "يرجى كتابة كلمة بحث لإظهار القنوات المتطابقة" : ""}
            >
              القنوات ({results.channels.length})
            </button>
          </div>
        )}

        {/* Dynamic Display Panel */}
        {!hasAnyFilter ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-dark-muted space-y-3">
            <Search className="w-12 h-12 text-dark-border animate-pulse" />
            <h3 className="font-bold text-sm">حدد فلاتر البحث أو ابدأ الكتابة</h3>
            <p className="text-xs leading-relaxed max-w-xs text-dark-muted/80">
              يمكنك الفلترة حسب تخصص المهندس العلمي، حالته المهنية للعمل، أو استكشاف أصحاب المهارات مباشرة.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* 1. Show Users List */}
            {activeTab === 'users' && (
              results.users.length === 0 ? (
                <p className="text-xs text-center text-dark-muted py-8">لا يوجد مهندسون يطابقون خيارات الفلترة والبحث الحالية.</p>
              ) : (
                results.users.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.username}`}
                    className="flex justify-between items-center p-3.5 bg-dark-card border border-dark-border rounded-2xl hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.fullName}
                        className="w-11 h-11 rounded-xl object-cover border border-dark-border"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-dark-text">{u.fullName}</span>
                          {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />}
                          {u.professionalStatus && u.professionalStatus !== 'غير محدد' && (
                            <span className={`inline-flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-full border leading-none ${
                              u.professionalStatus === 'متاح للعمل' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              u.professionalStatus === 'مشغول في مشروع' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/10' :
                              u.professionalStatus === 'أبحث عن فرص' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' :
                              'text-dark-muted bg-dark-border/40 border-dark-border/60'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                u.professionalStatus === 'متاح للعمل' ? 'bg-emerald-400 animate-pulse' :
                                u.professionalStatus === 'مشغول في مشروع' ? 'bg-yellow-400' :
                                u.professionalStatus === 'أبحث عن فرص' ? 'bg-cyan-400 animate-pulse' : 'bg-dark-muted'
                              }`} />
                              {u.professionalStatus}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-dark-muted block mt-0.5">@{u.username}</span>
                        <span className="text-[10px] text-brand-primary font-medium block mt-1">{u.engineeringField}</span>
                        
                        {/* Dynamic Skills Tags List */}
                        {u.skills && u.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {u.skills.map((sk, sIdx) => {
                              const isMatched = selectedSkill && sk.toLowerCase().includes(selectedSkill.toLowerCase());
                              return (
                                <span
                                  key={sIdx}
                                  className={`text-[8px] px-1.5 py-0.5 rounded border font-mono ${
                                    isMatched
                                      ? 'bg-brand-primary text-dark-bg border-brand-primary font-bold'
                                      : 'bg-dark-bg text-dark-text/75 border-dark-border/60'
                                  }`}
                                >
                                  #{sk}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    {u.location && (
                      <span className="text-[10px] bg-dark-border/40 text-dark-muted px-2.5 py-1 rounded-lg">
                        {u.location}
                      </span>
                    )}
                  </Link>
                ))
              )
            )}

            {/* 2. Show Posts List */}
            {activeTab === 'posts' && (
              results.posts.length === 0 ? (
                <p className="text-xs text-center text-dark-muted py-8">لا يوجد نتائج منشورة تطابق بحثك.</p>
              ) : (
                results.posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/profile/${post.username}`}
                    className="block p-4 bg-dark-card border border-dark-border rounded-2xl hover:border-brand-primary/40"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <img src={post.avatarUrl} className="w-6 h-6 rounded-lg object-cover" />
                      <span className="font-bold text-xs text-brand-primary font-mono">@{post.username}</span>
                      <span className="text-[9px] text-dark-muted">• {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-dark-text leading-relaxed line-clamp-2">{post.caption}</p>
                  </Link>
                ))
              )
            )}

            {/* 3. Show Channels List */}
            {activeTab === 'channels' && (
              results.channels.length === 0 ? (
                <p className="text-xs text-center text-dark-muted py-8">لا توجد قنوات توافق كلمة بحثك.</p>
              ) : (
                results.channels.map((chan) => (
                  <Link
                    key={chan.id}
                    to="/channels"
                    className="flex justify-between items-center p-4 bg-dark-card border border-dark-border rounded-2xl hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-sm text-dark-text">{chan.name}</h4>
                        <p className="text-[11px] text-dark-muted leading-relaxed line-clamp-1 mt-0.5">{chan.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-dark-muted bg-dark-border/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <MessagesSquare className="w-3.5 h-3.5" />
                      <span>{chan.membersCount} مهندس</span>
                    </span>
                  </Link>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
