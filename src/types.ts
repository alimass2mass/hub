export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  location?: string;
  engineeringField: string; // e.g. "هندسة برمجيات", "هندسة مدنية", "هندسة ميكانيكية"
  isPrivate: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  twoFactorEnabled?: boolean;
  hideActiveStatus?: boolean;
  blockedUserIds?: string[];
  mutedUserIds?: string[];
  restrictedUserIds?: string[];
  activeSessions?: UserSession[];
  securityLogs?: SecurityLog[];
  password_hash?: string;
  twoFactorSecret?: string;
  professionalStatus?: string; // e.g. "متاح للعمل", "مشغول في مشروع", "أبحث عن فرص"
}

export interface UserSession {
  id: string;
  deviceName: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityLog {
  id: string;
  action: string;
  timestamp: string;
  device: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
}


export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  fullName: string;
  isVerified: boolean;
  type: 'post' | 'reel' | 'story';
  caption?: string;
  location?: string;
  mediaUrls: string[]; // images or videos
  isLiked?: boolean;
  isSaved?: boolean;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  viewed: boolean;
  createdAt: string;
}

export interface UserStories {
  userId: string;
  username: string;
  avatarUrl?: string;
  stories: Story[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  userId: string; // Other user
  username: string;
  fullName: string;
  avatarUrl?: string;
  engineeringField?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'general' | 'jobs' | 'projects' | 'news';
  isPublic: boolean;
  membersCount: number;
  ownerId: string;
  lastMessage?: string;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string;
  actorUsername: string;
  actorAvatar?: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  postId?: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface GlobalActivityLog {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  engineeringField: string;
  timestamp: string;
  action: string;
  device: string;
  ip: string;
}

