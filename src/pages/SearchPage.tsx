import { useState, useEffect } from 'react';
import { User, Post, Channel } from '../types';
import { MockDB } from '../utils/db';
import { Search, CheckCircle2, Hash, ArrowLeftRight, MessagesSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'channels'>('users');
  const [results, setResults] = useState<{ users: User[]; posts: Post[]; channels: Channel[] }>({
    users: [],
    posts: [],
    channels: []
  });

  // Query watcher to trigger auto search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], channels: [] });
      return;
    }
    const timer = setTimeout(() => {
      const searchRes = MockDB.search(query);
      setResults(searchRes);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none text-right">
      <div className="max-w-2xl mx-auto">
        {/* Search header container */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2">البحث الموسع</h1>
          <p className="text-xs text-dark-muted">ابحث عن زملاء المهنة، المنشورات المتخصصة وقنوات النقاش الفعالة.</p>
        </div>

        {/* Input block */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="ابحث عن هندسة برمجيات، م. أحمد، Revit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-2xl py-3.5 pr-11 pl-4 text-sm text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted" />
        </div>

        {/* Tabs picker if search query entered */}
        {query.trim() && (
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
            >
              القنوات ({results.channels.length})
            </button>
          </div>
        )}

        {/* Dynamic Display Panel */}
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-dark-muted space-y-3">
            <Search className="w-12 h-12 text-dark-border" />
            <h3 className="font-bold text-sm">ابدأ كتابة كلمة البحث</h3>
            <p className="text-xs leading-relaxed max-w-xs text-dark-muted/80">
              يمكنك البحث عن مهندس ميكانيك، كتابة موضوع مثل BIM أو حتى أسماء الزملاء والأصدقاء مباشرة.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Show Users List */}
            {activeTab === 'users' && (
              results.users.length === 0 ? (
                <p className="text-xs text-center text-dark-muted py-8">لا يوجد نتائج تطابق بحثك في المهندسين.</p>
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-dark-text">{u.fullName}</span>
                          {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />}
                        </div>
                        <span className="text-[10px] text-dark-muted block mt-0.5">@{u.username}</span>
                        <span className="text-[10px] text-brand-primary font-medium block mt-1">{u.engineeringField}</span>
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
