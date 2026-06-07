import { Plus } from 'lucide-react';
import { User, UserStories } from '../types';

interface StoriesBarProps {
  currentUser: User | null;
  storiesFeed: UserStories[];
  onOpenStory: (index: number) => void;
  onAddStory: () => void;
}

export default function StoriesBar({ currentUser, storiesFeed, onOpenStory, onAddStory }: StoriesBarProps) {
  // Find index of my stories in the global feed
  const myStoriesIndex = storiesFeed.findIndex(feedItem => feedItem.userId === currentUser?.id);
  const myStoriesGroup = myStoriesIndex !== -1 ? storiesFeed[myStoriesIndex] : null;
  
  // Exclude my stories from the other users' list to avoid duplicate rendering
  const otherStoriesFeed = storiesFeed.filter(feedItem => feedItem.userId !== currentUser?.id);
  
  // Calculate if my stories are all viewed
  const allMyStoriesViewed = myStoriesGroup ? myStoriesGroup.stories.every(s => s.viewed) : false;

  return (
    <div className="flex gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl overflow-x-auto scrollbar-none items-center mb-6 text-right select-none">
      {/* Create / View my own story */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0 select-none">
        <div className="relative">
          {myStoriesGroup ? (
            /* If I have active stories, clicking my avatar opens my stories */
            <div 
              onClick={() => onOpenStory(myStoriesIndex)}
              className={`w-14.5 h-14.5 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                allMyStoriesViewed ? 'story-viewed-ring' : 'story-active-ring'
              }`}
            >
              <img
                src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="My avatar"
                className="w-13 h-13 rounded-full object-cover p-0.5 bg-dark-card"
              />
            </div>
          ) : (
            /* If I do NOT have stories, clicking my avatar adds a story */
            <div 
              onClick={onAddStory}
              className="w-14.5 h-14.5 rounded-full flex items-center justify-center border border-dark-border cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <img
                src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="My avatar"
                className="w-13 h-13 rounded-full object-cover p-0.5"
              />
            </div>
          )}
          
          {/* Small green/blue plus button to add another story anytime */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddStory();
            }}
            className="absolute bottom-0 left-0 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full p-1 border-2 border-dark-card shadow-md flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            title="نشر قصة جديدة"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-[11px] font-semibold text-dark-muted">قصتك</span>
      </div>

      {/* Group of existing stories of other people */}
      {otherStoriesFeed.map((feedItem) => {
        // Find if all stories in this sequence are viewed
        const allViewed = feedItem.stories.every((s) => s.viewed);
        // Find its original index in storiesFeed for accurate callback rendering
        const originalIndex = storiesFeed.findIndex(item => item.userId === feedItem.userId);

        return (
          <div
            key={feedItem.userId}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            onClick={() => onOpenStory(originalIndex)}
          >
            <div
              className={`w-14.5 h-14.5 rounded-full flex items-center justify-center ${
                allViewed ? 'story-viewed-ring' : 'story-active-ring'
              }`}
            >
              <img
                src={feedItem.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={feedItem.username}
                className="w-13 h-13 rounded-full object-cover p-0.5 bg-dark-card group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-[11px] font-semibold text-dark-muted group-hover:text-dark-text transition-colors">
              {feedItem.username}
            </span>
          </div>
        );
      })}
    </div>
  );
}
