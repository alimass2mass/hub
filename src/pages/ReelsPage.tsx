import { useState } from 'react';
import { Post, User } from '../types';
import { Heart, MessageCircle, Volume2, VolumeX, CheckCircle2, Bookmark } from 'lucide-react';

interface ReelsPageProps {
  reels: Post[];
  currentUser: User | null;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
}

export default function ReelsPage({ reels, currentUser, onLike, onSave }: ReelsPageProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<string[]>([]);

  const handleLikeReel = (id: string) => {
    onLike(id);
    setLikedReels((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const reelList = reels.filter((r) => r.type === 'reel');

  return (
    <div className="h-screen bg-black overflow-y-scroll scroll-snap-y-mandatory select-none text-right scrollbar-none snapped-y-container">
      {reelList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
          <p className="text-sm">لا توجد مقاطع ريلز هندسية متوفرة الآن.</p>
        </div>
      ) : (
        reelList.map((reel) => {
          const isL = likedReels.includes(reel.id) ? !reel.isLiked : !!reel.isLiked;
          const displayLikes = isL ? reel.likesCount + 1 : reel.likesCount;

          return (
            <div
              key={reel.id}
              className="h-screen w-full relative flex items-center justify-center bg-zinc-950 snapped-y-item"
            >
              <div className="relative w-full max-w-[450px] h-full bg-black flex flex-col justify-between overflow-hidden">
                {/* Video backdrop */}
                <video
                  src={reel.mediaUrls[0]}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Top header options */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <span className="text-xs font-bold text-white bg-brand-primary px-3 py-1 rounded-full shadow-md">
                    ريلز التخصصات
                  </span>
                </div>

                {/* Right side floating action widgets (Instagram style spec) */}
                <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10 text-white select-none">
                  {/* Like Button */}
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => handleLikeReel(reel.id)}
                      className={`p-3 rounded-full transition-all active:scale-90 hover:scale-110 shadow-lg ${
                        isL ? 'bg-red-500 text-white scale-105' : 'bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70 text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isL ? 'fill-white' : ''}`} />
                    </button>
                    <span className="text-[11px] font-bold font-mono">{displayLikes}</span>
                  </div>

                  {/* Comment Count Indicator */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70 text-white cursor-pointer hover:scale-110 shadow-lg transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold font-mono">{reel.comments.length}</span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => onSave(reel.id)}
                    className="p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-black/70 text-white hover:scale-110 shadow-lg transition-all"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>

                {/* Bottom Overlay Info (Details, Caption, User) with padding-right for safe layout spacing */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pr-18 pt-12 text-white z-10 flex flex-col justify-end text-right">
                  <div className="flex items-center gap-3 mb-2.5">
                    <img
                      src={reel.avatarUrl}
                      alt={reel.username}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm">{reel.fullName}</span>
                        {reel.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />}
                      </div>
                      <span className="text-[10px] text-neutral-300 block font-mono">@{reel.username}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-200 leading-relaxed font-sans mb-1 overflow-hidden pointer-events-auto">
                    {reel.caption}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
