import { useState } from 'react';
import { Post, User } from '../types';
import { Heart, MessageCircle, Play, Sparkles, Search } from 'lucide-react';
import PostCard from '../components/PostCard';

interface ExplorePageProps {
  posts: Post[];
  currentUser: User | null;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
}

export default function ExplorePage({ posts, currentUser, onLike, onSave, onComment, onDelete }: ExplorePageProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts and reels to display
  const exploreItems = posts.filter(p => p.type !== 'story');

  // Filter based on search query
  const filteredItems = exploreItems.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      (item.caption || '').toLowerCase().includes(query) ||
      (item.fullName || '').toLowerCase().includes(query) ||
      (item.username || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none text-right">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Title */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2 justify-end sm:justify-start">
              <span>استكشاف الابتكارات الهندسية</span>
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-xs text-dark-muted mt-1 leading-relaxed">تصفح أفكار، رسومات، ونماذج تخصصية شاركها كبار المهندسين والمبدعين العرب.</p>
          </div>
        </div>

        {/* Dynamic Search Bar (Matches Instagram style spec) */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-dark-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="بحث عن مشاريع هندسية، زملاء عمل، أو أفكار ملهمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border/80 focus:border-brand-primary rounded-2xl pr-10 pl-4 py-2.5 text-xs text-dark-text focus:outline-none placeholder:text-dark-muted transition-all font-sans text-right"
          />
        </div>

        {/* Grid display */}
        {filteredItems.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center">
            <p className="text-xs text-dark-muted">لم نجد أي منشورات توافق بحثك حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPost(item)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-dark-card border border-dark-border"
              >
                {/* Media visualizer helper */}
                {item.mediaUrls[0]?.endsWith('.mp4') || item.mediaUrls[0]?.includes('mixkit.co') ? (
                  <div className="w-full h-full relative">
                    <video src={item.mediaUrls[0]} className="w-full h-full object-cover pointer-events-none" muted />
                    <div className="absolute top-2.5 right-2.5 p-1.5 bg-black/40 text-white rounded-lg">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.mediaUrls[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'}
                    alt="Explore piece"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* Overlying Details on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-200">
                  <span className="flex items-center gap-1.5 text-white font-mono text-sm font-bold">
                    <Heart className="w-5 h-5 fill-white text-white" />
                    {item.likesCount}
                  </span>
                  <span className="flex items-center gap-1.5 text-white font-mono text-sm font-bold">
                    <MessageCircle className="w-5 h-5 fill-white text-white" />
                    {item.comments.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enlarged Single View Dialog Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          {/* backdrop click */}
          <div className="absolute inset-0" onClick={() => setSelectedPost(null)} />
          
          <div className="relative w-full max-w-lg bg-dark-card rounded-2xl shadow-2xl overflow-hidden z-10 border border-dark-border max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="absolute top-4 left-4 z-20">
              <button
                onClick={() => setSelectedPost(null)}
                className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
              >
                إغلاق المنشور
              </button>
            </div>
            
            {/* Post Card item */}
            <PostCard
              post={selectedPost}
              currentUser={currentUser}
              onLike={onLike}
              onSave={onSave}
              onComment={onComment}
              onDelete={(pId) => {
                onDelete(pId);
                setSelectedPost(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
