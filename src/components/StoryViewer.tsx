import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { UserStories } from '../types';

interface StoryViewerProps {
  storiesFeed: UserStories[];
  initialUserIndex: number;
  onClose: () => void;
  onMarkViewed: (storyId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story slide

export default function StoryViewer({ storiesFeed, initialUserIndex, onClose, onMarkViewed }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const trackerInterval = useRef<any>(null);

  const currentGroup = storiesFeed[currentUserIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  // Increment slide duration or auto-advance
  useEffect(() => {
    if (!currentStory) return;
    
    // Mark as viewed when loaded
    onMarkViewed(currentStory.id);

    setProgress(0);
    if (trackerInterval.current) clearInterval(trackerInterval.current);

    if (isPaused) return;

    const intervalTime = 100;
    const progressStep = (intervalTime / STORY_DURATION) * 100;

    trackerInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + progressStep;
      });
    }, intervalTime);

    return () => {
      if (trackerInterval.current) clearInterval(trackerInterval.current);
    };
  }, [currentUserIndex, currentStoryIndex, isPaused]);

  const handleNext = () => {
    if (!currentGroup) return;

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else if (currentUserIndex < storiesFeed.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (currentUserIndex > 0) {
      const prevUserIndex = currentUserIndex - 1;
      setCurrentUserIndex(prevUserIndex);
      setCurrentStoryIndex(storiesFeed[prevUserIndex].stories.length - 1);
    } else {
      // Loop or restart progress
      setProgress(0);
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none text-right">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full max-w-lg aspect-[9/16] bg-neutral-900 md:rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col justify-between">
        
        {/* Progress indicators */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-30">
          {currentGroup.stories.map((_, idx) => {
            let fillWidth = '0%';
            if (idx < currentStoryIndex) fillWidth = '100%';
            else if (idx === currentStoryIndex) fillWidth = `${progress}%`;

            return (
              <div key={idx} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                  style={{ width: fillWidth }}
                />
              </div>
            );
          })}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <img
              src={currentGroup.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
              alt={currentGroup.username}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold font-mono">@{currentGroup.username}</span>
              <span className="text-white/60 text-[9px]">تم النشر اليوم</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStory.mediaType === 'video' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer flex items-center justify-center"
                title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-brand-primary" />}
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Left and Right navigation Taps / Chevrons */}
        <button
          onClick={handlePrev}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-30 transition-transform active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-30 transition-transform active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Media Canvas */}
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer relative"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
          )}

          {/* Pause sign indicator */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity pointer-events-none">
              <span className="text-white bg-black/50 font-semibold px-4 py-2 rounded-xl text-xs backdrop-blur-sm">
                موقوف مؤقتاً
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
