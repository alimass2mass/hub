import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, CheckCircle2, MoreHorizontal, Trash2, Send, ChevronRight, ChevronLeft, Share2, Check, Volume2, VolumeX } from 'lucide-react';
import { Post, Comment, User } from '../types';

interface PostCardProps {
  key?: string;
  post: Post;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, currentUser, onLike, onSave, onComment, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [showComments, setShowShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const cleanCaption = post.caption ? post.caption.replace(/#\w+/g, '').trim() : '';
    const shareText = cleanCaption 
      ? (cleanCaption.length > 80 ? `${cleanCaption.substring(0, 80)}...` : cleanCaption)
      : 'شاهد هذا المنشور الهندسي المتميز على منصة EngineerHub';

    const shareData = {
      title: `منشور مهني بقلم م. ${post.fullName} | EngineerHub`,
      text: `${shareText}\n\nتابع نقاشات الهندسة والمشاريع على EngineerHub 💻🚀`,
      url: shareUrl,
    };

    // 1. Attempt Native System Web Share API if supported and permitted
    if (navigator.share) {
      try {
        // Some browsers require explicit canShare check
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } else {
          await navigator.share({
            title: shareData.title,
            text: shareData.text,
            url: shareData.url
          });
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      } catch (err) {
        console.warn("Native share succeeded with fallback or was cancelled by user.", err);
        // If aborted/cancelled, we should still copy to clipboard as a helpful fallback!
      }
    }

    // 2. Reliable Fallback: Clipboard API
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 3. Robust Legacy/Iframe Sandboxing Fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        // Prevent scrolling down on insertion
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error("Failed to copy link via fallback method", e);
      }
    }
  };

  // For handling multiple images slides
  const nextMedia = () => {
    if (currentMediaIndex < post.mediaUrls.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
    }
  };

  const handleLikeLocal = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    onLike(post.id);
  };

  const handleSaveLocal = () => {
    setIsSaved(!isSaved);
    onSave(post.id);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  // Process caption to highlights hashtags
  const formatCaption = (text: string) => {
    if (!text) return '';
    return text.split(/(\s+)/).map((word, idx) => {
      if (word.startsWith('#')) {
        return (
          <span key={idx} className="text-brand-primary font-bold hover:underline cursor-pointer">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <article className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden mb-6 text-right select-none transition-all hover:shadow-xl hover:shadow-brand-primary/5">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-dark-border">
        <div className="flex items-center gap-3">
          <img
            src={post.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
            alt={post.fullName}
            className="w-10 h-10 rounded-xl object-cover border border-dark-border"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-dark-text">{post.fullName}</span>
              {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/10" />}
            </div>
            {post.location && <span className="text-[10px] text-dark-muted block mt-0.5">{post.location}</span>}
          </div>
        </div>

        {/* Delete button or more button */}
        {currentUser && currentUser.id === post.userId && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-dark-muted hover:text-red-400 p-1.5 rounded-xl hover:bg-dark-border/40 transition-colors"
            title="حذف المنشور"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Description caption */}
      {post.caption && <p className="px-4 pt-3 pb-2 text-xs leading-relaxed text-dark-text">{formatCaption(post.caption)}</p>}

      {/* Media Carousel */}
      {post.mediaUrls.length > 0 && (
        <div className="relative aspect-video w-full bg-black/60 flex items-center justify-center group overflow-hidden">
          {post.mediaUrls[currentMediaIndex].endsWith('.mp4') || post.mediaUrls[currentMediaIndex].includes('mixkit.co/videos') ? (
            <div className="relative w-full h-full">
              <video
                src={post.mediaUrls[currentMediaIndex]}
                className="w-full h-full object-cover"
                controls
                playsInline
                muted={isMuted}
              />
              {/* Sound Toggle Floating Button overlay to easily bypass mobile browser autoplay silent blocks */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-3 right-3 z-35 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold shadow-xl leading-none"
                title={isMuted ? 'تشغيل الصوت' : 'كتم صوت الفيديو'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    <span>تشغيل الصوت</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                    <span>كتم الصوت</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <img
              src={post.mediaUrls[currentMediaIndex]}
              alt="Post publication"
              className="w-full h-full object-cover"
            />
          )}

          {/* Dots Indicator */}
          {post.mediaUrls.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {post.mediaUrls.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentMediaIndex ? 'w-4 bg-brand-primary' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Slider Buttons */}
          {post.mediaUrls.length > 1 && currentMediaIndex > 0 && (
            <button
              onClick={prevMedia}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 z-10 transition-transform active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Slider Left Buttons */}
          {post.mediaUrls.length > 1 && currentMediaIndex < post.mediaUrls.length - 1 && (
            <button
              onClick={nextMedia}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 z-10 transition-transform active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Action panel (Like, Comment, Save) */}
      <div className="p-4 flex items-center justify-between border-t border-dark-border">
        <div className="flex gap-4">
          <button
            onClick={handleLikeLocal}
            className={`flex items-center gap-2 text-xs font-semibold ${
              isLiked ? 'text-red-500 font-bold' : 'text-dark-muted hover:text-red-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
            <span className="font-mono">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowShowComments(!showComments)}
            className="flex items-center gap-2 text-xs font-semibold text-dark-muted hover:text-brand-primary"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-mono">{post.comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              copied ? 'text-green-500 font-bold animate-pulse' : 'text-dark-muted hover:text-brand-primary'
            }`}
            title="مشاركة المنشور"
          >
            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
          </button>
        </div>

        <button
          onClick={handleSaveLocal}
          className={`text-xs font-semibold ${isSaved ? 'text-brand-primary' : 'text-dark-muted hover:text-brand-primary'}`}
          title={isSaved ? 'إزالة الحفظ' : 'احفظ في الإشارات المرجعية'}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-brand-primary' : ''}`} />
        </button>
      </div>

      {/* Expanded Comment Segment */}
      {showComments && (
        <div className="border-t border-dark-border bg-dark-bg/25">
          {/* Scrollable list */}
          <div className="max-h-60 overflow-y-auto p-4 space-y-3 border-b border-dark-border">
            {post.comments.length === 0 ? (
              <p className="text-xs text-dark-muted text-center py-2">لا توجد تعليقات بعد. كن أول من يعلق!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 items-start text-xs text-right">
                  <img
                    src={comment.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt={comment.username}
                    className="w-7 h-7 rounded-lg object-cover border border-dark-border flex-shrink-0"
                  />
                  <div className="flex-1 bg-dark-border/20 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[11px] text-brand-primary font-mono">@{comment.username}</span>
                      <span className="text-[9px] text-dark-muted">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-dark-text font-medium leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form to submit feedback comment */}
          {currentUser && (
            <form onSubmit={handleSendComment} className="p-3 flex items-center gap-2.5 bg-dark-card">
              <img
                src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={currentUser.username}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <input
                type="text"
                placeholder="أضف تعليقاً مهنياً مع الزملاء..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
