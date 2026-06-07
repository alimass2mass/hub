import { User, Post, Story, UserStories, Message, Conversation, Channel, ChannelMessage, AppNotification, Comment, UserSession, SecurityLog, GlobalActivityLog } from '../types';

// Helper to generate UUIDs
const uuid = () => Math.random().toString(36).substring(2, 12);

// Local Storage Key constants
const KEYS = {
  USERS: 'eh_users',
  CURRENT_USER_ID: 'eh_curr_user_id',
  POSTS: 'eh_posts',
  STORIES: 'eh_stories',
  MESSAGES: 'eh_messages',
  CONVERSATIONS: 'eh_conversations',
  CHANNELS: 'eh_channels',
  CHANNEL_MESSAGES: 'eh_channel_msgs',
  NOTIFICATIONS: 'eh_notifications',
  FOLLOWS: 'eh_follows', // followerId_followingId mappings
  SAVED_POSTS: 'eh_saved_posts', // array of { userId, postId }
  LIKED_POSTS: 'eh_liked_posts', // array of { userId, postId }
  GLOBAL_ACTIVITY: 'eh_global_activity_logs',
};

// Initial Seed Data to load if nothing exists in LocalStorage
const SEED_USERS: User[] = [
  {
    id: 'user_super_admin',
    username: 'alisaifaldeen',
    fullName: 'المدير علي سيف الدين',
    email: 'alisaifaldeen12@gmail.com',
    bio: 'المدير العام للمنصة والمسؤول الأمني العام لشبكة المهندسين العرب 🛡️🔐',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    website: 'https://engineerhub.com',
    location: 'بغداد | العراق',
    engineeringField: 'هندسة برمجيات',
    isPrivate: false,
    isVerified: true,
    followersCount: 2450,
    followingCount: 15,
    postsCount: 1,
    professionalStatus: 'مشغول في مشروع',
    skills: ['React', 'Python', 'TypeScript', 'Node.js', 'Cybershield', 'Firewall'],
    password_hash: 'SecurePassword123!',
    twoFactorEnabled: false,
    hideActiveStatus: false,
    blockedUserIds: [],
    mutedUserIds: [],
    restrictedUserIds: [],
    activeSessions: [
      { id: 'sess_super_1', deviceName: 'Chrome on Mac Secure Console (الرئيسي)', location: 'Baghdad, Iraq', ip: '185.39.42.1', lastActive: 'الآن', isCurrent: true }
    ],
    securityLogs: [
      { id: 'sl_super_1', action: 'تهيئة الحماية الأمنية المشفرة وقاعدة البيانات', timestamp: new Date().toISOString(), device: 'Admin Console', ip: '127.0.0.1', status: 'success' }
    ]
  },
  {
    id: 'user_admin',
    username: 'admin',
    fullName: 'م. علي المسعودي',
    email: 'admin@engineerhub.com',
    bio: 'مؤسس منصة ChemicalEngineersHub | نجمع العقول الهندسية الكيميائية بالبصرة 💻✨',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    website: 'https://engineerhub.com',
    location: 'صنعاء | بغداد',
    engineeringField: 'هندسة برمجيات',
    isPrivate: false,
    isVerified: true,
    followersCount: 1450,
    followingCount: 92,
    postsCount: 4,
    professionalStatus: 'مشغول في مشروع',
    skills: ['Vite', 'React', 'TypeScript', 'Tailwind CSS', 'NoSQL', 'System Architecture'],
    password_hash: '123456',
    twoFactorEnabled: false,
    hideActiveStatus: false,
    blockedUserIds: [],
    mutedUserIds: [],
    restrictedUserIds: [],
    activeSessions: [
      { id: 'sess_admin_1', deviceName: 'Chrome on Mac M2 Pro (Current)', location: 'Baghdad, Iraq', ip: '185.39.42.112', lastActive: 'الآن', isCurrent: true },
      { id: 'sess_admin_2', deviceName: 'Xiaomi Redmi Note 12', location: 'Basra, Iraq', ip: '94.204.33.220', lastActive: 'منذ يومين', isCurrent: false }
    ],
    securityLogs: [
      { id: 'sl_admin_1', action: 'تسجيل دخول ناجح', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), device: 'Chrome on Mac M2 Pro', ip: '185.39.42.112', status: 'success' },
      { id: 'sl_admin_2', action: 'محاولة تسجيل دخول فاشلة لرقم IP غير آمن', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), device: 'Firefox on Android', ip: '43.102.39.10', status: 'failed' }
    ]
  },
  {
    id: 'user_ahmed',
    username: 'ahmed_eng',
    fullName: 'م. أحمد الجبوري',
    email: 'ahmed@example.com',
    bio: 'مهندس مشاريع إنشائية، مهتم بإدارة المشاريع الحديثة ومجال نمذجة معلومات البناء (BIM) 🏗️📐',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    website: 'https://ahmed-bim.net',
    location: 'بغداد | العراق',
    engineeringField: 'هندسة مدنية',
    isPrivate: false,
    isVerified: true,
    followersCount: 820,
    followingCount: 310,
    postsCount: 3,
    professionalStatus: 'متاح للعمل',
    skills: ['BIM', 'AutoCAD', 'Revit', 'PMP', 'Civil 3D', 'Project Management'],
    password_hash: '123456',
    twoFactorEnabled: false,
    hideActiveStatus: false,
    blockedUserIds: [],
    mutedUserIds: [],
    restrictedUserIds: [],
    activeSessions: [
      { id: 'sess_ahmed_1', deviceName: 'Apple Safari on iPhone 15 Pro Max', location: 'Baghdad, Iraq', ip: '185.39.43.204', lastActive: 'الآن', isCurrent: true },
      { id: 'sess_ahmed_2', deviceName: 'Chrome on Windows 11 Desktop', location: 'Baghdad, Iraq', ip: '185.39.43.2', lastActive: 'منذ يومين', isCurrent: false },
      { id: 'sess_ahmed_3', deviceName: 'Edge on iPad Pro', location: 'Erbil, Iraq', ip: '194.12.39.155', lastActive: 'منذ 5 أيام', isCurrent: false }
    ],
    securityLogs: [
      { id: 'sl_ahmed_1', action: 'تسجيل دخول ناجح', timestamp: new Date(Date.now() - 3600000).toISOString(), device: 'Apple Safari on iPhone 15 Pro Max', ip: '185.39.43.204', status: 'success' },
      { id: 'sl_ahmed_2', action: 'تعديل كلمة مرور الحساب', timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), device: 'Chrome on Windows 11 Desktop', ip: '185.39.43.2', status: 'success' },
      { id: 'sl_ahmed_3', action: 'تغيير إعداد حماية الخصوصية', timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), device: 'Edge on iPad Pro', ip: '194.12.39.155', status: 'warning' }
    ]
  },
  {
    id: 'user_sara',
    username: 'sara_mech',
    fullName: 'م. سارة المهيري',
    email: 'sara@example.com',
    bio: 'مهندسة ميكانيك رابحة، مهتمة بأنظمة الطاقة المتجددة، التكييف والتهوية (HVAC) والتحكم الصناعي الذكي ⚙️🔋',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    website: 'https://saraenergy.io',
    location: 'دبي | الإمارات',
    engineeringField: 'هندسة ميكانيكية',
    isPrivate: false,
    isVerified: true,
    followersCount: 540,
    followingCount: 180,
    postsCount: 2,
    professionalStatus: 'أبحث عن فرص',
    skills: ['HVAC', 'SolidWorks', 'MATLAB', 'Ansys', 'Thermodynamics', 'AutoCAD'],
    password_hash: '123456',
    twoFactorEnabled: false,
    hideActiveStatus: false,
    blockedUserIds: [],
    mutedUserIds: [],
    restrictedUserIds: [],
    activeSessions: [
      { id: 'sess_sara_1', deviceName: 'Safari on iPhone 14 Pro', location: 'Dubai, UAE', ip: '102.33.22.41', lastActive: 'الآن', isCurrent: true },
      { id: 'sess_sara_2', deviceName: 'Chrome on macOS Sonoma', location: 'Dubai, UAE', ip: '102.33.22.50', lastActive: 'منذ ساعة', isCurrent: false }
    ],
    securityLogs: [
      { id: 'sl_sara_1', action: 'تسجيل دخول ناجح للمنصة', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), device: 'Safari on iPhone 14 Pro', ip: '102.33.22.41', status: 'success' }
    ]
  }
];

const SEED_POSTS: Post[] = [
  {
    id: 'post_1',
    userId: 'user_ahmed',
    username: 'ahmed_eng',
    fullName: 'م. أحمد الجبوري',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    type: 'post',
    caption: 'سعيد بمشاركتكم تقدم سير العمل في مشروع تصاميم البرج السكني الجديد. نستخدم هنا أحدث تقنيات الـ Revit لتجنب أي تعارضات (Clashes) قبل دخول الموقع. #هندسة_مدنية #نمذجة #تطوير #بناء 🏗️',
    location: 'موقع العمل - بغداد الجديد',
    mediaUrls: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    likesCount: 124,
    commentsCount: 2,
    comments: [
      {
        id: 'c1',
        postId: 'post_1',
        userId: 'user_sara',
        username: 'sara_mech',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        text: 'عمل رائع جدا م. أحمد! هل تم دمج تصاميم التكييف والكهرباء بمراحلها الأولى؟',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c2',
        postId: 'post_1',
        userId: 'user_ahmed',
        username: 'ahmed_eng',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        text: 'أهلاً م. سارة، نعم بالتأكيد. التنسيق يتم مباشرة عبر ملف مركزي واحد لتفادي أي مشاكل لاحقاً.',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'post_2',
    userId: 'user_sara',
    username: 'sara_mech',
    fullName: 'م. سارة المهيري',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    type: 'post',
    caption: 'تصميم وتشغيل لوحة تحكم لأنظمة التدفئة المركزية في أحد المصانع الصديقة للبيئة. التركيز هنا على رفع كفاءة استهلاك الطاقة وتقليل الانبعاثات الحرارية الهادورة. #هندسة_ميكانيكية #طاقة #تحكم_صناعي 🛠️⚡',
    location: 'المنطقة الصناعية - دبي',
    mediaUrls: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    ],
    likesCount: 89,
    commentsCount: 1,
    comments: [
      {
        id: 'c3',
        postId: 'post_2',
        userId: 'user_admin',
        username: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        text: 'مثال رائع على تداخل الهندسة الميكانيكية والأنظمة الذكية الصديقة للبيئة م. سارة!',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'post_3',
    userId: 'user_admin',
    username: 'admin',
    fullName: 'م. علي المسعودي',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    type: 'post',
    caption: 'أهلاً بكم زملائي المهندسين في ChemicalEngineersHub! تم تطوير هذه النسخة لتوفير تجربة تفاعلية ممتازة، تدعم نقاشات العمل، القنوات العامة والتخصصية والمحادثات المباشرة، بالإضافة إلى القصص والمقاطع القصيرة (الريلز). نسعد بمقترحاتكم للتطوير! #مطورين #هندسة_كيميائية #البصرة #تواصل💻🚀',
    location: 'غرفة المطورين الرئيسي',
    mediaUrls: [
      'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80'
    ],
    likesCount: 231,
    commentsCount: 2,
    comments: [
      {
        id: 'c4',
        postId: 'post_3',
        userId: 'user_ahmed',
        username: 'ahmed_eng',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        text: 'مبارك إطلاق المنصة م. علي! خطوة ممتازة جداً ونحتاج لمثل هذا التجمع الاحترافي.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c5',
        postId: 'post_3',
        userId: 'user_sara',
        username: 'sara_mech',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        text: 'الواجهة مذهلة وتفاصيلها غاية في الحرفية والإبداع. فخورين بالانضمام والمشاركة!',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'reel_1',
    userId: 'user_admin',
    username: 'admin',
    fullName: 'م. علي المسعودي',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    type: 'reel',
    caption: 'كيف نقوم بهيكلة وتصميم المكونات في React و Vite بكفاءة عالية؟ #برمجة #ريلز💡🧑‍💻',
    location: 'استوديو البرمجة',
    mediaUrls: [
      'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screencast-34356-large.mp4'
    ],
    likesCount: 156,
    commentsCount: 0,
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'reel_2',
    userId: 'user_sara',
    username: 'sara_mech',
    fullName: 'م. سارة المهيري',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    type: 'reel',
    caption: 'جولة سريعة داخل محطة طاقة الرياح لتوليد الكهرباء النظيفة ♻️🌪️ #ميكانيك #بيئة',
    location: 'حقل رياح البحر',
    mediaUrls: [
      'https://assets.mixkit.co/videos/preview/mixkit-wind-turbines-spinning-under-clouds-32943-large.mp4'
    ],
    likesCount: 112,
    commentsCount: 0,
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  }
];

const SEED_STORIES: Story[] = [
  {
    id: 'story_1',
    userId: 'user_ahmed',
    username: 'ahmed_eng',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    viewed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'story_2',
    userId: 'user_sara',
    username: 'sara_mech',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    viewed: false,
    createdAt: new Date().toISOString()
  }
];

const SEED_CHANNELS: Channel[] = [
  {
    id: 'chan_1',
    name: 'الساحة العربية العامة',
    description: 'نقاشات مهنية هندسية متنوعة وإعلانات عامة وأخبار المهن وتجارب التطبيقات الابتكارية.',
    type: 'general',
    isPublic: true,
    membersCount: 450,
    ownerId: 'user_admin',
    lastMessage: 'مرحباً بجميع الزملاء في شبكة المهندسين العرب الأولى!'
  },
  {
    id: 'chan_2',
    name: 'فرص عمل وهندسة وتوظيف',
    description: 'أحدث عروض التوظيف والفرص الاستشارية والعقود والمشاريع الشاغرة بالوطن العربي وخارجه.',
    type: 'jobs',
    isPublic: true,
    membersCount: 310,
    ownerId: 'user_admin',
    lastMessage: 'متاح فرصة لمهندس مساحة خبير في الرياض - التفاصيل بالداخل'
  },
  {
    id: 'chan_3',
    name: 'نمذجة وإدارة المشاريع الإنشائية',
    description: 'نناقش هنا إدارة التشييد، عقود الفيديك، حساب الكميات، إدارة الجودة، وتقنيات الريفت وتنسيق النماذج.',
    type: 'projects',
    isPublic: true,
    membersCount: 220,
    ownerId: 'user_ahmed',
    lastMessage: 'أين يمكن تحميل عينات لمخططات مشاريع متكاملة؟'
  }
];

// Helper functions for reading/writing storage
const getJSON = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setJSON = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Database class implementing direct browser control over data storage
export class MockDB {
  static init() {
    if (!localStorage.getItem(KEYS.USERS)) {
      setJSON(KEYS.USERS, SEED_USERS);
      setJSON(KEYS.POSTS, SEED_POSTS);
      setJSON(KEYS.STORIES, SEED_STORIES);
      setJSON(KEYS.CHANNELS, SEED_CHANNELS);
      setJSON(KEYS.FOLLOWS, [
        { followerId: 'user_ahmed', followingId: 'user_admin', status: 'accepted' },
        { followerId: 'user_sara', followingId: 'user_admin', status: 'accepted' },
        { followerId: 'user_admin', followingId: 'user_ahmed', status: 'accepted' }
      ]);
      setJSON(KEYS.SAVED_POSTS, []);
      setJSON(KEYS.LIKED_POSTS, []);
      setJSON(KEYS.CURRENT_USER_ID, 'user_ahmed'); // Logged in as Ahmed by default to test out features!
    }

    // Do not seed remembered accounts with default demo accounts as requested by user
    const remembered = getJSON<any[]>('eh_remembered_accounts', []);
    if (remembered.length === 0) {
      setJSON('eh_remembered_accounts', []);
    }
  }

  // Auth Operations
  static getCurrentUser(): User | null {
    const userId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    if (!userId) return null;
    const users = getJSON<User[]>(KEYS.USERS, []);
    return users.find(u => u.id === userId) || null;
  }

  static setCurrentUser(userId: string) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  }

  static getGlobalActivities(): GlobalActivityLog[] {
    return getJSON<GlobalActivityLog[]>(KEYS.GLOBAL_ACTIVITY, []);
  }

  static logGlobalActivity(user: User, action: string) {
    const logs = this.getGlobalActivities();
    const newLog: GlobalActivityLog = {
      id: 'glog_' + Math.floor(Math.random() * 100000000),
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      engineeringField: user.engineeringField,
      timestamp: new Date().toISOString(),
      action,
      device: 'المنصة الآمنة (ويب الهاتف أو المتصفح)',
      ip: '185.39.42.' + Math.floor(Math.random() * 254 + 1)
    };
    const nextLogs = [newLog, ...logs].slice(0, 100);
    setJSON(KEYS.GLOBAL_ACTIVITY, nextLogs);
  }

  static getFailedAttempts(identifier: string): { count: number; lockedUntil: number } {
    const key = `failed_login_${identifier.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    if (!stored) return { count: 0, lockedUntil: 0 };
    try {
      return JSON.parse(stored);
    } catch {
      return { count: 0, lockedUntil: 0 };
    }
  }

  static incrementFailedAttempts(identifier: string) {
    const key = `failed_login_${identifier.toLowerCase()}`;
    const curr = this.getFailedAttempts(identifier);
    const count = curr.count + 1;
    const lockedUntil = count >= 3 ? Date.now() + 30000 : 0; // Lock for 30 seconds
    localStorage.setItem(key, JSON.stringify({ count, lockedUntil }));
  }

  static resetFailedAttempts(identifier: string) {
    const key = `failed_login_${identifier.toLowerCase()}`;
    localStorage.removeItem(key);
  }

  static addSecurityLog(userId: string, action: string, status: 'success' | 'failed' | 'warning', device = 'Chrome on WebApp (Current)', ip = '185.39.42.112'): User {
    const users = getJSON<User[]>(KEYS.USERS, []);
    let updatedUser: User | null = null;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const logs = u.securityLogs || [];
        const newLog: SecurityLog = {
          id: 'log_' + Math.floor(Math.random() * 10000000),
          action,
          timestamp: new Date().toISOString(),
          device,
          ip,
          status
        };
        updatedUser = {
          ...u,
          securityLogs: [newLog, ...logs].slice(0, 15)
        };
        return updatedUser;
      }
      return u;
    });
    if (updatedUser) {
      setJSON(KEYS.USERS, updatedUsers);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  static login(identifier: string, password_hash_or_plain: string): { user: User | null; error?: string; require2FA?: boolean; code2FA?: string } {
    const attempts = this.getFailedAttempts(identifier);
    if (attempts.lockedUntil > Date.now()) {
      const remaining = Math.round((attempts.lockedUntil - Date.now()) / 1000);
      return { 
        user: null, 
        error: `⚠️ تم حظر محاولات الدخول مؤقتاً لحماية الحساب (Rate Limit 🚫) انتظر ${remaining} ثانية لتجنب قفل الحساب الاحترازي.` 
      };
    }

    const users = getJSON<User[]>(KEYS.USERS, []);
    const cleanIdentifier = (identifier || '').trim().toLowerCase();
    const user = users.find(u => {
      const uUsername = (u.username || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();
      return uUsername === cleanIdentifier || uEmail === cleanIdentifier;
    });
    
    if (!user) {
      return { user: null, error: 'اسم المستخدم أو البريد الإلكتروني غير صحيح' };
    }

    // Check credentials (plain text mock check with fallback of '123456')
    const enteredPassClean = (password_hash_or_plain || '123456').trim();
    const actualPassClean = (user.password_hash || '123456').trim();

    if (actualPassClean !== enteredPassClean && user.password_hash !== password_hash_or_plain) {
      this.incrementFailedAttempts(identifier);
      const updatedAttempts = this.getFailedAttempts(identifier);
      const remainingHits = 3 - updatedAttempts.count;
      
      this.addSecurityLog(user.id, `محاولة تسجيل دخول فاشلة (رمز سري خاطئ)`, 'failed', 'Safari on iPhone', '185.45.19.22');

      if (remainingHits <= 0) {
        return { 
          user: null, 
          error: '⚠️ تم قفل وإيقاف تسجيل الدخول مؤقتاً لمدة 30 ثانية لتكرار إدخال كلمة مرور خاطئة (Brute Force Protection).' 
        };
      }
      return { 
        user: null, 
        error: `كلمة المرور غير صحيحة. متبقي لك ${remainingHits} محاولات قبل حظر الجلسة مؤقتاً.`
      };
    }

    // Reset failed counter
    this.resetFailedAttempts(identifier);

    // Check if 2FA is active
    if (user.twoFactorEnabled) {
      const mockCode = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem(`2fa_code_${user.id}`, mockCode);
      this.addSecurityLog(user.id, `إرسال رمز التحقق بخطوتين (2FA)`, 'warning');
      return { user: null, require2FA: true, code2FA: mockCode };
    }

    // Success login. Append session if not already active
    let sessions = user.activeSessions || [];
    if (!sessions.some(s => s.isCurrent)) {
      sessions = [
        { id: 'sess_' + uuid().substring(0, 8), deviceName: 'Chrome on Client App (الرئيسي)', location: 'Baghdad, Iraq', ip: '185.39.42.112', lastActive: 'الآن', isCurrent: true },
        ...sessions
      ];
    }
    
    user.activeSessions = sessions;
    const nextUsers = users.map(u => u.id === user.id ? user : u);
    setJSON(KEYS.USERS, nextUsers);

    this.addSecurityLog(user.id, 'تسجيل دخول ناجح للمنصة', 'success');
    this.logGlobalActivity(user, 'تسجيل دخول ناجح للمنصة');
    this.setCurrentUser(user.id);
    return { user };
  }

  static verifyAndLogin2FA(userId: string, code: string): { user: User | null; error?: string } {
    const savedCode = localStorage.getItem(`2fa_code_${userId}`);
    if (!savedCode || savedCode !== code.trim()) {
      return { user: null, error: 'رمز التحقق بخطوتين غير صحيح أو منتهي الصلاحية' };
    }
    
    // Clear code
    localStorage.removeItem(`2fa_code_${userId}`);
    
    const users = getJSON<User[]>(KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    if (!user) return { user: null, error: 'المستخدم غير موجود' };

    // Register active session
    let sessions = user.activeSessions || [];
    if (!sessions.some(s => s.isCurrent)) {
      sessions = [
        { id: 'sess_' + uuid().substring(0, 8), deviceName: 'Chrome Web Client (Current Device)', location: 'Baghdad, Iraq', ip: '185.39.42.112', lastActive: 'الآن', isCurrent: true },
        ...sessions
      ];
      user.activeSessions = sessions;
    }

    const nextUsers = users.map(u => u.id === user.id ? user : u);
    setJSON(KEYS.USERS, nextUsers);

    this.addSecurityLog(user.id, 'تسجيل دخول ناجح بعد التحقق الـ 2FA', 'success');
    this.logGlobalActivity(user, 'تسجيل دخول ناجح بعد التحقق الـ 2FA (الحماية المزدوجة)');
    this.setCurrentUser(user.id);
    return { user };
  }

  static register(fullName: string, username: string, email: string, engineeringField: string, password_hash?: string): { user: User | null; error?: string } {
    const users = getJSON<User[]>(KEYS.USERS, []);
    const usernameClean = username.trim().toLowerCase();
    const emailClean = email.trim().toLowerCase();

    if (users.some(u => u.username === usernameClean)) {
      return { user: null, error: 'اسم المستخدم مسجّل بالفعل' };
    }
    if (users.some(u => u.email === emailClean)) {
      return { user: null, error: 'البريد الإلكتروني مسجّل بالفعل' };
    }

    const newUser: User = {
      id: 'user_' + uuid(),
      username: usernameClean,
      fullName: fullName,
      email: emailClean,
      bio: '',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameClean}`,
      website: '',
      location: '',
      engineeringField: engineeringField || 'مهندس عام',
      isPrivate: false,
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      password_hash: password_hash || '123456', // user chosen custom password or default
      twoFactorEnabled: false,
      hideActiveStatus: false,
      blockedUserIds: [],
      mutedUserIds: [],
      restrictedUserIds: [],
      activeSessions: [
        { id: 'sess_' + uuid().substring(0, 8), deviceName: 'Browser Engine (الجلسة الحالية)', location: 'العراق', ip: '185.39.42.112', lastActive: 'الآن', isCurrent: true }
      ],
      securityLogs: [
        { id: 'sl_' + uuid().substring(0, 8), action: 'إنشاء الحساب وتفعيل بروتوكول الحماية ديفولت', timestamp: new Date().toISOString(), device: 'Browser Engine', ip: '185.39.42.112', status: 'success' }
      ]
    };

    users.push(newUser);
    setJSON(KEYS.USERS, users);
    this.logGlobalActivity(newUser, 'إنشاء حساب هندسي جديد بنجاح وتفعيل ملف الحماية للمشترك');
    this.setCurrentUser(newUser.id);
    return { user: newUser };
  }

  static logout() {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  }

  // Session & Security functions
  static terminateSession(userId: string, sessionId: string): User {
    const users = getJSON<User[]>(KEYS.USERS, []);
    let updated: User | null = null;
    const nextUsers = users.map(u => {
      if (u.id === userId) {
        const remainingSessions = (u.activeSessions || []).filter(s => s.id !== sessionId);
        const terminated = (u.activeSessions || []).find(s => s.id === sessionId);
        const termName = terminated ? terminated.deviceName : 'جهاز غير معروف';
        
        updated = {
          ...u,
          activeSessions: remainingSessions
        };
        return updated;
      }
      return u;
    });

    if (updated) {
      setJSON(KEYS.USERS, nextUsers);
      this.addSecurityLog(userId, `إلغاء جلسة نشطة لجهاز: ${sessionId}`, 'warning');
      return updated;
    }
    throw new Error('User not found');
  }

  static changePassword(userId: string, current: string, newPass: string): { success: boolean; error?: string; user?: User } {
    const users = getJSON<User[]>(KEYS.USERS, []);
    let updated: User | null = null;
    let err: string | undefined = undefined;

    const nextUsers = users.map(u => {
      if (u.id === userId) {
        if ((u.password_hash || '123456') !== current) {
          err = 'كلمة المرور الحالية غير صحيحة';
          return u;
        }
        if (newPass.length < 6) {
          err = 'يجب أن تكون كلمة المرور الجديدة مكونة من 6 أحرف على الأقل';
          return u;
        }
        updated = {
          ...u,
          password_hash: newPass
        };
        return updated;
      }
      return u;
    });

    if (err) return { success: false, error: err };
    if (updated) {
      setJSON(KEYS.USERS, nextUsers);
      this.addSecurityLog(userId, 'تغيير كلمة مرور الحساب بنجاح', 'success');
      return { success: true, user: updated };
    }
    return { success: false, error: 'لم يتم العثور على حسابك' };
  }

  static togglePrivacyOverride(userId: string, category: 'blocked' | 'muted' | 'restricted', targetId: string): User {
    const users = getJSON<User[]>(KEYS.USERS, []);
    let updated: User | null = null;
    const nextUsers = users.map(u => {
      if (u.id === userId) {
        let listArr: string[] = [];
        let actionWord = '';
        if (category === 'blocked') {
          listArr = u.blockedUserIds || [];
          if (listArr.includes(targetId)) {
            listArr = listArr.filter(id => id !== targetId);
            actionWord = 'إلغاء حظر المستخدم';
          } else {
            listArr = [...listArr, targetId];
            actionWord = 'حظر مستخدم';
          }
          updated = { ...u, blockedUserIds: listArr };
        } else if (category === 'muted') {
          listArr = u.mutedUserIds || [];
          if (listArr.includes(targetId)) {
            listArr = listArr.filter(id => id !== targetId);
            actionWord = 'إلغاء كتم منشورات المستخدم';
          } else {
            listArr = [...listArr, targetId];
            actionWord = 'كتم منشورات مستخدم';
          }
          updated = { ...u, mutedUserIds: listArr };
        } else if (category === 'restricted') {
          listArr = u.restrictedUserIds || [];
          if (listArr.includes(targetId)) {
            listArr = listArr.filter(id => id !== targetId);
            actionWord = 'إلغاء تقييد مستخدم';
          } else {
            listArr = [...listArr, targetId];
            actionWord = 'تقييد حساب مستخدم';
          }
          updated = { ...u, restrictedUserIds: listArr };
        }
        return updated!;
      }
      return u;
    });

    if (updated) {
      setJSON(KEYS.USERS, nextUsers);
      this.addSecurityLog(userId, `قم بـ: ${updated.fullName || updated.username}`, 'success');
      return updated;
    }
    throw new Error('User not found');
  }


  static updateUserProfile(updates: Partial<User>): User {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('No user logged in');

    const users = getJSON<User[]>(KEYS.USERS, []);
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, ...updates };
      }
      return u;
    });

    setJSON(KEYS.USERS, updatedUsers);
    return { ...currentUser, ...updates };
  }

  // Suggest suggestions
  static getSuggestions(): User[] {
    const curr = this.getCurrentUser();
    const users = getJSON<User[]>(KEYS.USERS, []);
    const follows = getJSON<any[]>(KEYS.FOLLOWS, []);

    if (!curr) return users.slice(0, 3);

    // Keep users other than current user who are not followed
    return users.filter(u => {
      if (u.id === curr.id) return false;
      const isFollowing = follows.some(f => f.followerId === curr.id && f.followingId === u.id);
      return !isFollowing;
    });
  }

  // Follow management
  static isFollowing(userId: string): boolean {
    const curr = this.getCurrentUser();
    if (!curr) return false;
    const follows = getJSON<any[]>(KEYS.FOLLOWS, []);
    return follows.some(f => f.followerId === curr.id && f.followingId === userId);
  }

  static toggleFollow(targetId: string): { following: boolean; pending: boolean } {
    const curr = this.getCurrentUser();
    if (!curr) return { following: false, pending: false };

    const follows = getJSON<any[]>(KEYS.FOLLOWS, []);
    const targetUser = getJSON<User[]>(KEYS.USERS, []).find(u => u.id === targetId);
    if (!targetUser) return { following: false, pending: false };

    const index = follows.findIndex(f => f.followerId === curr.id && f.followingId === targetId);
    let following = false;
    let pending = false;

    if (index > -1) {
      follows.splice(index, 1);
      following = false;
      // edit counter
      this.adjustUserCounts(curr.id, 'following', -1);
      this.adjustUserCounts(targetId, 'followers', -1);
    } else {
      const status = targetUser.isPrivate ? 'pending' : 'accepted';
      follows.push({ followerId: curr.id, followingId: targetId, status });
      following = status === 'accepted';
      pending = status === 'pending';

      if (status === 'accepted') {
        this.adjustUserCounts(curr.id, 'following', 1);
        this.adjustUserCounts(targetId, 'followers', 1);

        // Add Notification
        this.addNotification(targetId, 'follow', `بدأ بمتابعتك`);
      }
    }

    setJSON(KEYS.FOLLOWS, follows);
    return { following, pending };
  }

  private static adjustUserCounts(userId: string, type: 'posts' | 'followers' | 'following', amount: number) {
    const users = getJSON<User[]>(KEYS.USERS, []);
    const updated = users.map(u => {
      if (u.id === userId) {
        if (type === 'posts') u.postsCount = Math.max(0, u.postsCount + amount);
        if (type === 'followers') u.followersCount = Math.max(0, u.followersCount + amount);
        if (type === 'following') u.followingCount = Math.max(0, u.followingCount + amount);
      }
      return u;
    });
    setJSON(KEYS.USERS, updated);
  }

  // Posts Feed, Reels
  static getFeed(): Post[] {
    const curr = this.getCurrentUser();
    const posts = getJSON<Post[]>(KEYS.POSTS, []);
    const likes = getJSON<any[]>(KEYS.LIKED_POSTS, []);
    const saves = getJSON<any[]>(KEYS.SAVED_POSTS, []);

    // Filter type = 'post' and sort latest first
    const feed = posts.filter(p => p.type === 'post').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!curr) return feed;

    return feed.map(p => ({
      ...p,
      isLiked: likes.some(l => l.userId === curr.id && l.postId === p.id),
      isSaved: saves.some(s => s.userId === curr.id && s.postId === p.id),
    }));
  }

  static getExplorePosts(): Post[] {
    const curr = this.getCurrentUser();
    const posts = getJSON<Post[]>(KEYS.POSTS, []);
    const likes = getJSON<any[]>(KEYS.LIKED_POSTS, []);

    // Any posts & reels
    const exp = posts.filter(p => p.type !== 'story');
    if (!curr) return exp;

    return exp.map(p => ({
      ...p,
      isLiked: likes.some(l => l.userId === curr.id && l.postId === p.id),
    }));
  }

  static getReels(): Post[] {
    const curr = this.getCurrentUser();
    const posts = getJSON<Post[]>(KEYS.POSTS, []);
    const likes = getJSON<any[]>(KEYS.LIKED_POSTS, []);
    const saves = getJSON<any[]>(KEYS.SAVED_POSTS, []);

    const reels = posts.filter(p => p.type === 'reel').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!curr) return reels;

    return reels.map(p => ({
      ...p,
      isLiked: likes.some(l => l.userId === curr.id && l.postId === p.id),
      isSaved: saves.some(s => s.userId === curr.id && s.postId === p.id),
    }));
  }

  static createPost(type: 'post' | 'reel', caption: string, location: string, mediaUrls: string[]): Post {
    const curr = this.getCurrentUser();
    if (!curr) throw new Error('Not logged in');

    const posts = getJSON<Post[]>(KEYS.POSTS, []);
    const newPost: Post = {
      id: 'post_' + uuid(),
      userId: curr.id,
      username: curr.username,
      fullName: curr.fullName,
      avatarUrl: curr.avatarUrl,
      isVerified: curr.isVerified,
      type,
      caption,
      location,
      mediaUrls,
      likesCount: 0,
      commentsCount: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    setJSON(KEYS.POSTS, posts);

    this.adjustUserCounts(curr.id, 'posts', 1);

    return newPost;
  }

  static deletePost(postId: string) {
    const curr = this.getCurrentUser();
    if (!curr) return;

    const posts = getJSON<Post[]>(KEYS.POSTS, []);
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete || postToDelete.userId !== curr.id) return;

    const filtered = posts.filter(p => p.id !== postId);
    setJSON(KEYS.POSTS, filtered);

    this.adjustUserCounts(curr.id, 'posts', -1);
  }

  static toggleLike(postId: string): boolean {
    const curr = this.getCurrentUser();
    if (!curr) return false;

    const liked = getJSON<any[]>(KEYS.LIKED_POSTS, []);
    const posts = getJSON<Post[]>(KEYS.POSTS, []);

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return false;

    const likeIndex = liked.findIndex(l => l.userId === curr.id && l.postId === postId);
    let isLiked = false;

    if (likeIndex > -1) {
      liked.splice(likeIndex, 1);
      posts[postIndex].likesCount = Math.max(0, posts[postIndex].likesCount - 1);
      isLiked = false;
    } else {
      liked.push({ userId: curr.id, postId });
      posts[postIndex].likesCount += 1;
      isLiked = true;

      // Add Notification
      if (posts[postIndex].userId !== curr.id) {
        this.addNotification(
          posts[postIndex].userId,
          'like',
          `أعجب بمنشورك`,
          postId
        );
      }
    }

    setJSON(KEYS.LIKED_POSTS, liked);
    setJSON(KEYS.POSTS, posts);
    return isLiked;
  }

  static toggleSave(postId: string): boolean {
    const curr = this.getCurrentUser();
    if (!curr) return false;

    const saves = getJSON<any[]>(KEYS.SAVED_POSTS, []);
    const index = saves.findIndex(s => s.userId === curr.id && s.postId === postId);
    let isSaved = false;

    if (index > -1) {
      saves.splice(index, 1);
      isSaved = false;
    } else {
      saves.push({ userId: curr.id, postId });
      isSaved = true;
    }

    setJSON(KEYS.SAVED_POSTS, saves);
    return isSaved;
  }

  static addComment(postId: string, text: string): Comment {
    const curr = this.getCurrentUser();
    if (!curr) throw new Error('Not logged in');

    const posts = getJSON<Post[]>(KEYS.POSTS, []);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error('Post not found');

    const newComment: Comment = {
      id: 'c_' + uuid(),
      postId,
      userId: curr.id,
      username: curr.username,
      avatarUrl: curr.avatarUrl,
      text,
      createdAt: new Date().toISOString()
    };

    posts[postIndex].comments.push(newComment);
    posts[postIndex].commentsCount += 1;
    setJSON(KEYS.POSTS, posts);

    // Notify post owner
    if (posts[postIndex].userId !== curr.id) {
      this.addNotification(
        posts[postIndex].userId,
        'comment',
        `علق على منشورك: "${text.substring(0, 30)}..."`,
        postId
      );
    }

    return newComment;
  }

  // Stories
  static getStoriesFeed(): UserStories[] {
    const curr = this.getCurrentUser();
    const stories = getJSON<Story[]>(KEYS.STORIES, []);
    const users = getJSON<User[]>(KEYS.USERS, []);

    // Group stories by userId
    const groupedMap = new Map<string, Story[]>();
    stories.forEach(s => {
      const list = groupedMap.get(s.userId) || [];
      list.push(s);
      groupedMap.set(s.userId, list);
    });

    const list: UserStories[] = [];
    groupedMap.forEach((userStories, uId) => {
      const user = users.find(u => u.id === uId);
      list.push({
        userId: uId,
        username: user?.username || 'user',
        avatarUrl: user?.avatarUrl,
        stories: userStories
      });
    });

    return list;
  }

  static addStory(mediaUrl: string, mediaType: 'image' | 'video'): Story {
    const curr = this.getCurrentUser();
    if (!curr) throw new Error('Not logged in');

    const stories = getJSON<Story[]>(KEYS.STORIES, []);
    const newStory: Story = {
      id: 'story_' + uuid(),
      userId: curr.id,
      username: curr.username,
      avatarUrl: curr.avatarUrl,
      mediaUrl,
      mediaType,
      viewed: false,
      createdAt: new Date().toISOString()
    };

    stories.unshift(newStory);
    setJSON(KEYS.STORIES, stories);
    return newStory;
  }

  static markStoryViewed(storyId: string) {
    const stories = getJSON<Story[]>(KEYS.STORIES, []);
    const updated = stories.map(s => {
      if (s.id === storyId) s.viewed = true;
      return s;
    });
    setJSON(KEYS.STORIES, updated);
  }

  // Conversations & Direct Messages
  static getConversations(): Conversation[] {
    const curr = this.getCurrentUser();
    if (!curr) return [];

    const messages = getJSON<Message[]>(KEYS.MESSAGES, []);
    const users = getJSON<User[]>(KEYS.USERS, []);

    // Filter conversations that have current user involved
    const convUsersMap = new Map<string, Message[]>();
    messages.forEach(m => {
      // Find direct messages
      // Standard conv format is 'userId1_userId2' sorted or something, let's group by opposite sender
      // If we don't have separate conversations database, let's infer them from messages
      if (m.conversationId.includes(curr.id)) {
        const uId = m.conversationId.replace(curr.id, '').replace('_', '');
        const list = convUsersMap.get(uId) || [];
        list.push(m);
        convUsersMap.set(uId, list);
      }
    });

    // Make sure seed conversations exist if empty to look rich
    if (convUsersMap.size === 0) {
      // Seed some messages between admin and ahmed
      const cId = ['user_admin', 'user_ahmed'].sort().join('_');
      const seedMsgs: Message[] = [
        { id: 'm_1', conversationId: cId, senderId: 'user_admin', text: 'أهلاً بك م. أحمد، شكراً لملاحظاتك القيمة!', createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: true },
        { id: 'm_2', conversationId: cId, senderId: 'user_ahmed', text: 'العفو م. علي، سعيد جداً بما تقدمه المنصة.', createdAt: new Date(Date.now() - 1800000).toISOString(), isRead: true }
      ];
      setJSON(KEYS.MESSAGES, seedMsgs);
      convUsersMap.set('user_admin', seedMsgs);
    }

    const conversations: Conversation[] = [];
    convUsersMap.forEach((msgs, opposingUserId) => {
      const opposingUser = users.find(u => u.id === opposingUserId);
      if (!opposingUser) return;

      const sorted = msgs.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const lastMsg = sorted[sorted.length - 1];
      const unreadCount = msgs.filter(m => m.senderId === opposingUserId && !m.isRead).length;

      conversations.push({
        id: lastMsg.conversationId,
        userId: opposingUserId,
        username: opposingUser.username,
        fullName: opposingUser.fullName,
        avatarUrl: opposingUser.avatarUrl,
        engineeringField: opposingUser.engineeringField,
        lastMessage: lastMsg.text,
        lastMessageAt: lastMsg.createdAt,
        unreadCount,
        isOnline: opposingUserId !== 'user_sara', // seed online statuses
        isLastMessageMine: lastMsg.senderId === curr.id,
        isLastMessageRead: lastMsg.isRead
      });
    });

    return conversations.sort((a,b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
  }

  static getMessages(conversationId: string): Message[] {
    const messages = getJSON<Message[]>(KEYS.MESSAGES, []);
    const filtered = messages.filter(m => m.conversationId === conversationId);

    // Mark as read
    const curr = this.getCurrentUser();
    if (curr) {
      const updated = messages.map(m => {
        if (m.conversationId === conversationId && m.senderId !== curr.id) {
          m.isRead = true;
        }
        return m;
      });
      setJSON(KEYS.MESSAGES, updated);
    }

    return filtered.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static getOrCreateConversationId(opposingUserId: string): string {
    const curr = this.getCurrentUser();
    if (!curr) throw new Error('Not logged in');
    return [curr.id, opposingUserId].sort().join('_');
  }

  static sendMessage(opposingUserId: string, text: string): Message {
    const curr = this.getCurrentUser();
    if (!curr) throw new Error('Not logged in');

    // Check block list restriction
    const users = getJSON<User[]>(KEYS.USERS, []);
    const opponent = users.find(u => u.id === opposingUserId);
    const isBlockedByOpponent = opponent?.blockedUserIds?.includes(curr.id);
    const isBlockingOpponent = curr.blockedUserIds?.includes(opposingUserId);
    if (isBlockedByOpponent || isBlockingOpponent) {
      throw new Error('⚠️ لا يمكن إرسال الرسالة نظراً لظروف قيود الحظر بين الحسابين.');
    }

    const messages = getJSON<Message[]>(KEYS.MESSAGES, []);
    const conversationId = this.getOrCreateConversationId(opposingUserId);

    const newMessage: Message = {
      id: 'msg_' + uuid(),
      conversationId,
      senderId: curr.id,
      text,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    messages.push(newMessage);
    setJSON(KEYS.MESSAGES, messages);
    return newMessage;
  }

  // General Channels (Chat rooms)
  static getChannels(): Channel[] {
    return getJSON<Channel[]>(KEYS.CHANNELS, SEED_CHANNELS);
  }

  static createChannel(name: string, description: string, type: 'general' | 'jobs' | 'projects' | 'news', isPublic: boolean): Channel {
    const curr = this.getCurrentUser();
    if (!curr) throw new Error('Not logged in');

    const channels = getJSON<Channel[]>(KEYS.CHANNELS, SEED_CHANNELS);
    const newChan: Channel = {
      id: 'chan_' + uuid(),
      name,
      description,
      type,
      isPublic,
      membersCount: 1,
      ownerId: curr.id,
      lastMessage: 'تم إنشاء القناة الهندسية الجديدة 🎉'
    };

    channels.unshift(newChan);
    setJSON(KEYS.CHANNELS, channels);
    return newChan;
  }

  static getChannelMessages(channelId: string): ChannelMessage[] {
    const msgs = getJSON<ChannelMessage[]>(KEYS.CHANNEL_MESSAGES, []);
    const filtered = msgs.filter(m => m.channelId === channelId);

    // If completely empty, make a seed welcome message
    if (filtered.length === 0) {
      const channel = this.getChannels().find(c => c.id === channelId);
      const admin = getJSON<User[]>(KEYS.USERS, SEED_USERS).find(u => u.username === 'admin');
      const seedMsg: ChannelMessage = {
        id: 'cm_seed_' + channelId,
        channelId,
        userId: admin?.id || 'admin',
        username: admin?.username || 'admin',
        avatarUrl: admin?.avatarUrl,
        text: `مرحباً بالجميع في قناة "${channel?.name || 'مجموعة'}" الهندسية التخصصية! دامت نقاشاتكم مثمرة.`,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      };
      msgs.push(seedMsg);
      setJSON(KEYS.CHANNEL_MESSAGES, msgs);
      return [seedMsg];
    }

    return filtered.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static sendChannelMessage(channelId: string, text: string): ChannelMessage {
    const curr = this.getCurrentUser();
    if (!curr) throw new Error('Not logged in');

    const msgs = getJSON<ChannelMessage[]>(KEYS.CHANNEL_MESSAGES, []);
    const channels = getJSON<Channel[]>(KEYS.CHANNELS, SEED_CHANNELS);

    const newMsg: ChannelMessage = {
      id: 'cmsg_' + uuid(),
      channelId,
      userId: curr.id,
      username: curr.username,
      avatarUrl: curr.avatarUrl,
      text,
      createdAt: new Date().toISOString()
    };

    msgs.push(newMsg);
    setJSON(KEYS.CHANNEL_MESSAGES, msgs);

    // update lastMessage
    const updatedChannels = channels.map(c => {
      if (c.id === channelId) {
        c.lastMessage = `${curr.username}: ${text}`;
      }
      return c;
    });
    setJSON(KEYS.CHANNELS, updatedChannels);

    return newMsg;
  }

  // General app notifications
  static getNotifications(): AppNotification[] {
    const curr = this.getCurrentUser();
    if (!curr) return [];

    const notifs = getJSON<AppNotification[]>(KEYS.NOTIFICATIONS, []);
    const relevant = notifs.filter(n => n.userId === curr.id);

    // If empty seed some mock ones to look super beautiful!
    if (relevant.length === 0) {
      const ahmedUser = getJSON<User[]>(KEYS.USERS, SEED_USERS).find(u => u.username === 'ahmed_eng');
      const mock: AppNotification[] = [
        {
          id: 'n_mock_1',
          userId: curr.id,
          actorId: 'user_sara',
          actorUsername: 'sara_mech',
          actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          type: 'like',
          postId: 'post_1',
          text: 'أعجب بمنشورك حول "تصاميم البرج السكني الجديد"',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'n_mock_2',
          userId: curr.id,
          actorId: 'user_admin',
          actorUsername: 'admin',
          actorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
          type: 'follow',
          text: 'بدأ بمتابعتك الآن',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      // Save them
      setJSON(KEYS.NOTIFICATIONS, [...notifs, ...mock]);
      return mock.filter(n => n.userId === curr.id);
    }

    return relevant.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addNotification(userId: string, type: 'like' | 'comment' | 'follow' | 'mention', text: string, postId?: string) {
    const curr = this.getCurrentUser();
    if (!curr) return;

    const notifs = getJSON<AppNotification[]>(KEYS.NOTIFICATIONS, []);
    const newNotif: AppNotification = {
      id: 'notif_' + uuid(),
      userId,
      actorId: curr.id,
      actorUsername: curr.username,
      actorAvatar: curr.avatarUrl,
      type,
      postId,
      text,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifs.push(newNotif);
    setJSON(KEYS.NOTIFICATIONS, notifs);
  }

  static markAllNotificationsRead() {
    const curr = this.getCurrentUser();
    if (!curr) return;

    const notifs = getJSON<AppNotification[]>(KEYS.NOTIFICATIONS, []);
    const updated = notifs.map(n => {
      if (n.userId === curr.id) n.isRead = true;
      return n;
    });

    setJSON(KEYS.NOTIFICATIONS, updated);
  }

  // Profile operations
  static getUserProfile(username: string): User | null {
    const users = getJSON<User[]>(KEYS.USERS, []);
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  static getAllUsers(): User[] {
    const users = getJSON<User[]>(KEYS.USERS, []);
    return users;
  }

  static getUserPosts(userId: string, type: 'post' | 'reel' | 'saved' = 'post'): Post[] {
    const posts = getJSON<Post[]>(KEYS.POSTS, []);
    const curr = this.getCurrentUser();

    if (type === 'saved' && curr) {
      const savedAssocs = getJSON<any[]>(KEYS.SAVED_POSTS, []);
      const savedIds = savedAssocs.filter(s => s.userId === curr.id).map(s => s.postId);
      return posts.filter(p => savedIds.includes(p.id));
    }

    return posts.filter(p => p.userId === userId && p.type === type);
  }

  // General search
  static search(query: string): { users: User[]; posts: Post[]; channels: Channel[] } {
    const users = getJSON<User[]>(KEYS.USERS, []);
    const posts = getJSON<Post[]>(KEYS.POSTS, []).filter(p => p.type === 'post');
    const channels = getJSON<Channel[]>(KEYS.CHANNELS, SEED_CHANNELS);

    const q = query.toLowerCase().trim();
    if (!q) return { users: [], posts: [], channels: [] };

    const filteredUsers = users.filter(
      u => u.username.toLowerCase().includes(q) ||
           u.fullName.toLowerCase().includes(q) ||
           u.engineeringField.toLowerCase().includes(q)
    );

    const filteredPosts = posts.filter(
      p => (p.caption || '').toLowerCase().includes(q) ||
           (p.location || '').toLowerCase().includes(q)
    );

    const filteredChannels = channels.filter(
      c => c.name.toLowerCase().includes(q) ||
           (c.description || '').toLowerCase().includes(q)
    );

    return {
      users: filteredUsers,
      posts: filteredPosts,
      channels: filteredChannels
    };
  }

  // Remembered Accounts Helpers for easy logins on the device
  static getRememberedAccounts(): { id: string; username: string; fullName: string; avatarUrl: string; email: string; engineeringField: string; password_hash: string }[] {
    const list = getJSON<any[]>('eh_remembered_accounts', []);
    const demoIds = ['user_super_admin', 'user_ahmed', 'user_sara', 'user_admin'];
    return list.filter(acc => !demoIds.includes(acc.id));
  }

  static addRememberedAccount(user: any, password_hash: string) {
    const accounts = this.getRememberedAccounts();
    const filtered = accounts.filter(a => a.id !== user.id);
    filtered.push({
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
      email: user.email,
      engineeringField: user.engineeringField || 'مهندس عام',
      password_hash: password_hash
    });
    setJSON('eh_remembered_accounts', filtered);
  }

  static removeRememberedAccount(userId: string) {
    const accounts = this.getRememberedAccounts();
    const filtered = accounts.filter(a => a.id !== userId);
    setJSON('eh_remembered_accounts', filtered);
  }
}
