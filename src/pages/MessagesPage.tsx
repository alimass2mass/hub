import React, { useState, useEffect } from 'react';
import { Conversation, Message, User } from '../types';
import { MockDB } from '../utils/db';
import { 
  Send, CheckCircle2, Search, MessageSquare, AlertCircle, 
  Phone, Video, Mic, MicOff, VideoOff, Volume2, VolumeX, X, ArrowRight, PhoneOff,
  Check, CheckCheck
} from 'lucide-react';

interface MessagesPageProps {
  currentUser: User | null;
}

export default function MessagesPage({ currentUser }: MessagesPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const opponentProfile = activeConversation ? MockDB.getAllUsers().find(u => u.id === activeConversation.userId) : null;
  const isBlockedByOpposing = opponentProfile?.blockedUserIds?.includes(currentUser?.id || '') || false;
  const isMyBlockedUser = currentUser?.blockedUserIds?.includes(activeConversation?.userId || '') || false;
  const isMessagingBlocked = isBlockedByOpposing || isMyBlockedUser;

  // Calling States
  const [activeCall, setActiveCall] = useState<{
    type: 'voice' | 'video';
    user: User;
    status: 'connecting' | 'connected' | 'ended';
    duration: number;
    isMuted: boolean;
    isVideoOff: boolean;
    isSpeakerOn: boolean;
  } | null>(null);

  // Initial load of conversations
  useEffect(() => {
    refreshConvs();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    const msgs = MockDB.getMessages(activeConversation.id);
    setMessages(msgs);

    // Refresh conversations lists to update unread counters
    refreshConvs();
  }, [activeConversation?.id]);

  // Calling Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCall && activeCall.status === 'connected') {
      timer = setInterval(() => {
        setActiveCall((prev) => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  const refreshConvs = () => {
    const list = MockDB.getConversations();
    setConversations(list);
    
    // Also update current active conversation counters
    if (activeConversation) {
      const updatedMatch = list.find(c => c.id === activeConversation.id);
      if (updatedMatch) {
         setActiveConversation({ ...updatedMatch, unreadCount: 0 });
      }
    }
  };

  const simulateOpponentReading = (convId: string, opposingUserId: string) => {
    // Simulating the remote user noticing our message, opening it and viewing the conversation
    setTimeout(() => {
      const stored = localStorage.getItem('eh_messages');
      if (stored) {
        try {
          const allMsgs = JSON.parse(stored) as Message[];
          let changed = false;
          const updated = allMsgs.map(m => {
            if (m.conversationId === convId && m.senderId === currentUser?.id && !m.isRead) {
              m.isRead = true;
              changed = true;
            }
            return m;
          });
          
          if (changed) {
            localStorage.setItem('eh_messages', JSON.stringify(updated));
            // If the user's active conversation is still this conversation, fetch the updated messages logs
            setMessages(prev => {
              return MockDB.getMessages(convId);
            });
            refreshConvs();
          }
        } catch (err) {
          console.error('Error in read receipts simulation:', err);
        }
      }
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    // Send DM through storage engine
    const newMsg = MockDB.sendMessage(activeConversation.userId, inputText.trim());
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate opponent opening and reading our message
    simulateOpponentReading(activeConversation.id, activeConversation.userId);

    // Trigger instant replies from mock users to make details highly interactive!
    triggerMockReply(activeConversation.userId);
    refreshConvs();
  };

  const triggerMockReply = (opposingUserId: string) => {
    setTimeout(() => {
      const replies = [
        'أهلاً بك زميلي العزيز م. أحمد، كلامك دقيق جداً وجاري العمل بالتصميم.',
        'سأقوم بجدولة موعد مناقشة التفاصيل غداً إن شاء الله 🗓️⚒️',
        'مخططات الكتروميكانيكال جاهزة للتأكيد والتحقق. تفضل بسؤالك!',
        'شكراً جزيلاً لك على هذه الإفادة القيمة والمتابعة المستمرة!'
      ];
      const randomText = replies[Math.floor(Math.random() * replies.length)];
      
      // Force write opposing reply directly to MockDB
      const prevId = localStorage.getItem('eh_curr_user_id') || 'user_ahmed';
      // Temporarily write under opposing user identity
      localStorage.setItem('eh_curr_user_id', opposingUserId);
      MockDB.sendMessage(prevId, randomText);
      
      // Shift back to current user
      localStorage.setItem('eh_curr_user_id', prevId);

      // Refresh messaging logs if still viewing
      if (activeConversation && activeConversation.userId === opposingUserId) {
        setMessages(MockDB.getMessages(activeConversation.id));
      }
      refreshConvs();

      // Push custom Notification alert about reply
      const opponent = MockDB.getUserProfile(activeConversation?.username || '');
      if (opponent) {
        // Simple internal mock notifier trigger
        MockDB.addNotification(prevId, 'mention', `أرسل لك رسالة جديدة: "${randomText.substring(0, 20)}..."`);
      }
    }, 1500);
  };

  // Calling flow initialization
  const startCall = (callType: 'voice' | 'video') => {
    if (!activeConversation) return;
    const opponent = MockDB.getUserProfile(activeConversation.username);
    if (!opponent) return;

    setActiveCall({
      type: callType,
      user: opponent,
      status: 'connecting',
      duration: 0,
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: true
    });

    // Ring timeout to simulate realistic call answered
    setTimeout(() => {
      setActiveCall((prev) => prev ? { ...prev, status: 'connected' } : null);
    }, 2500);
  };

  const endCall = () => {
    if (!activeCall) return;

    // Calculate call duration
    const minutes = Math.floor(activeCall.duration / 60);
    const seconds = activeCall.duration % 60;
    const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const systemText = activeCall.type === 'voice' 
      ? `📞 مكالمة هاتفية صادرة (${activeCall.duration > 0 ? `المدة: ${durationStr}` : 'لم يتم الرد'})`
      : `🎥 مكالمة فيديو مرئية (${activeCall.duration > 0 ? `المدة: ${durationStr}` : 'لم يتم الرد'})`;

    // Persist call ended message into MockDB
    const newMsg = MockDB.sendMessage(activeCall.user.id, systemText);
    if (activeConversation && activeConversation.userId === activeCall.user.id) {
      setMessages((prev) => [...prev, newMsg]);
    }

    setActiveCall(null);
    refreshConvs();
  };

  // Filter conversations matching search query
  const filteredConvs = conversations.filter(c =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem-5rem)] md:h-screen bg-dark-bg text-right select-none overflow-hidden relative">
      
      {/* 1. Conversations List Panel (Right side in Arabic RTL layout) */}
      <div className={`w-full md:w-96 border-l border-dark-border bg-dark-card flex flex-col h-full flex-shrink-0 z-10 transition-all ${
        activeConversation ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-5 border-b border-dark-border">
          <h2 className="font-bold text-lg mb-3">الرسائل المباشرة</h2>
          
          {/* Quick Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن زميل لمراسلته..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pr-9 pl-3 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
            />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted" />
          </div>
        </div>

        {/* List of contacts */}
        <div className="flex-1 overflow-y-auto divide-y divide-dark-border/40 scrollbar-none">
          {filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-dark-muted text-xs">لا توجد محادثات متطابقة لمدخلات البحث.</div>
          ) : (
            filteredConvs.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-all ${
                    isActive ? 'bg-brand-primary/10 border-r-4 border-brand-primary' : 'hover:bg-dark-border/30'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conv.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt={conv.fullName}
                      className="w-11 h-11 rounded-xl object-cover border border-dark-border flex-shrink-0"
                    />
                    {conv.isOnline && (
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-card" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-bold text-xs text-dark-text truncate">{conv.fullName}</span>
                      </div>
                      <span className="text-[9px] text-dark-muted">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-1.5">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {conv.isLastMessageMine && (
                          <span className="flex-shrink-0">
                            {conv.isLastMessageRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </span>
                        )}
                        <p className="text-[11px] text-dark-muted truncate flex-1 block">
                          {conv.lastMessage || 'ابدأ محادثة مهنية جديدة...'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-brand-primary text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full min-w-4 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Messages Chat Box Pane (Left side) */}
      <div className={`flex-grow flex-1 flex-col h-full bg-dark-bg relative overflow-hidden ${
        activeConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {activeConversation ? (
          <>
            {/* Header profile details of selected recipient */}
            <div className="p-4 border-b border-dark-border bg-dark-card/60 backdrop-blur-md flex justify-between items-center z-15">
              <div className="flex items-center gap-3">
                {/* Back button for mobile navigation */}
                <button
                  type="button"
                  onClick={() => setActiveConversation(null)}
                  className="p-2 rounded-xl bg-dark-bg/60 border border-dark-border text-dark-muted hover:text-dark-text md:hidden transition-colors"
                  title="رجوع للقائمة"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <img
                  src={activeConversation.avatarUrl}
                  alt={activeConversation.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-dark-border"
                />
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs md:text-sm text-dark-text">{activeConversation.fullName}</span>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-dark-muted font-medium block mt-0.5">
                    {activeConversation.engineeringField} • {activeConversation.isOnline ? 'نشط الآن' : 'غير متصل'}
                  </span>
                </div>
              </div>

              {/* Call Buttons */}
              {!isMessagingBlocked && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startCall('voice')}
                    className="p-2.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 transition-all"
                    title="بدء مكالمة صوتية آمنة"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startCall('video')}
                    className="p-2.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 transition-all"
                    title="بدء مكالمة مرئية عالية الدقة"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bubble logs scrolling container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none bg-dark-bg/40">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-dark-muted text-xs">
                  لا توجد رسائل سابقة. أرسل كلمة ترحيبية مهنية لبدء النقاش!
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === currentUser?.id;
                  const isSystem = m.text.startsWith('📞') || m.text.startsWith('🎥');
                  
                  if (isSystem) {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <div className="bg-dark-card/80 border border-dark-border/80 px-4 py-2 rounded-2xl flex items-center gap-2 text-center shadow-sm">
                          <span className="text-[10px] font-bold text-brand-primary leading-none font-sans">{m.text}</span>
                          <span className="text-[8px] text-dark-muted font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[75%] md:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-brand-primary text-white rounded-br-none shadow-md shadow-brand-primary/10'
                            : 'bg-dark-card border border-dark-border text-dark-text rounded-bl-none'
                        }`}
                      >
                        <p className="font-medium whitespace-pre-wrap">{m.text}</p>
                        <div className="flex items-center justify-between gap-1.5 mt-1.5">
                          <span
                            className={`text-[8px] ${
                              isMine ? 'text-white/70' : 'text-dark-muted'
                            } font-mono`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <div className="flex items-center" title={m.isRead ? "تمت القراءة" : "تم الإرسال"}>
                              {m.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-white/50" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Form input panel */}
            {isMessagingBlocked ? (
              <div className="p-4 border-t border-dark-border bg-dark-card/60 backdrop-blur-md flex items-center justify-center gap-2 text-red-400 text-xs font-bold font-sans">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>مراسلة هذا الحساب غير متاحة حالياً بسبب قيود الحظر.</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-border bg-dark-card/60 backdrop-blur-md flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب رسالتك الهندسية أو اسأل الزميل هنا..."
                  className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl shadow-lg shadow-brand-primary/15 hover:shadow-brand-primary/25 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center h-10 w-10 flex-shrink-0"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dark-muted space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-border/40 flex items-center justify-center text-dark-muted border border-dark-border">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1 font-sans">
              <h3 className="font-bold text-sm text-dark-text">اختر زميلاً لبدء المحادثة</h3>
              <p className="text-xs max-w-xs text-dark-muted/80">
                يمكنك التنسيق المالي والفني والبرمجي مع زملائك بشكل منفصل وخاص ومحمي تماماً.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Simulated Full-screen Call Overlay Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl flex flex-col justify-between p-6 md:p-10 text-center text-white select-none antialiased">
          
          {/* Top segment: call encryption metadata & indicator */}
          <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-2 mt-4 font-sans">
            <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-full px-4 py-1.5 flex items-center gap-2 text-brand-primary text-xs font-bold shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              اتصال آمن ومُشفر بالكامل (Peer-to-Peer 256-bit)
            </div>
            <span className="text-[10px] text-slate-400 font-medium">ChemicalEngineersHub Secure Voice & Video Call Engine</span>
          </div>

          {/* Central segment: Avatar display or webcam video simulation */}
          <div className="my-auto flex flex-col items-center space-y-6">
            
            {activeCall.type === 'video' && !activeCall.isVideoOff ? (
              // Video Camera Feed Simulation
              <div className="relative w-72 h-96 md:w-96 md:h-[480px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                
                {/* Remote Video Stream (Main screen) */}
                <img 
                  src={activeCall.user.avatarUrl} 
                  alt={activeCall.user.fullName} 
                  className="w-full h-full object-cover opacity-80 filter saturate-125 select-none" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Technical architectural line layout overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent p-4 flex flex-col items-start text-right">
                  <span className="text-xs font-mono font-black text-brand-primary bg-slate-950/60 px-2 py-0.5 rounded border border-brand-primary/20">LIVE STREAM</span>
                  <p className="text-sm font-bold text-white mt-1">{activeCall.user.fullName}</p>
                  <p className="text-[10px] text-slate-300 leading-none">{activeCall.user.engineeringField}</p>
                </div>

                {/* Self camera feed preview picture-in-picture inside bottom left corner */}
                <div className="absolute bottom-4 left-4 w-20 h-28 md:w-28 md:h-36 bg-slate-950 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all">
                  <img 
                    src={currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
                    alt="Self" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[7px] font-mono">أنت</div>
                </div>

                {/* Grid Overlay indicators */}
                <div className="absolute inset-0 pointer-events-none border border-brand-primary/10 m-3 rounded-2xl flex items-center justify-center">
                  <div className="w-full h-[1px] bg-brand-primary/5 absolute" />
                  <div className="h-full w-[1px] bg-brand-primary/5 absolute" />
                </div>
              </div>
            ) : (
              // Audio Call layout (With beautifully pulsed circles)
              <div className="relative flex flex-col items-center">
                <div className="absolute -inset-10 flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full border border-brand-primary/20 animate-pulse" />
                </div>
                <div className="absolute -inset-20 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full border border-teal-500/10 animate-ping duration-1000" />
                </div>

                <div className="relative">
                  <img
                    src={activeCall.user.avatarUrl}
                    alt={activeCall.user.fullName}
                    className="w-32 h-32 rounded-3xl object-cover border-4 border-brand-primary shadow-2xl relative z-10 select-none animate-bounce"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white border-2 border-slate-950 z-20">
                    <Phone className="w-4 h-4 fill-white animate-wiggle" />
                  </div>
                </div>

                <div className="mt-8 text-center space-y-1.5 font-sans">
                  <h3 className="font-extrabold text-xl tracking-tight text-white">{activeCall.user.fullName}</h3>
                  <p className="text-xs text-brand-primary font-bold">{activeCall.user.engineeringField}</p>
                </div>
              </div>
            )}

            {/* Calling Status label info */}
            <div className="space-y-1 font-sans">
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold block">
                {activeCall.status === 'connecting' ? 'جاري محاولة الاتصال والربط الفني...' : 'المكالمة متصلة بثبات'}
              </span>
              <p className="text-2xl font-mono font-black text-white">
                {activeCall.status === 'connecting' ? 'رنين وثيق...' : formatTime(activeCall.duration)}
              </p>
            </div>
          </div>

          {/* Bottom segment: Custom control bar and Red Hang-up */}
          <div className="w-full max-w-md mx-auto mb-6 flex flex-col items-center space-y-5">
            <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl w-full justify-around">
              {/* Mic Control toggle */}
              <button
                type="button"
                onClick={() => setActiveCall(p => p ? { ...p, isMuted: !p.isMuted } : null)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  activeCall.isMuted 
                    ? 'bg-red-500/20 text-red-500 border-red-500/35 hover:bg-red-500/30' 
                    : 'bg-slate-850 text-slate-300 border-slate-700/55 hover:bg-slate-800'
                }`}
                title={activeCall.isMuted ? 'تفعيل الميكروفون' : 'كتم الميكروفون'}
              >
                {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Speaker Control toggle */}
              <button
                type="button"
                onClick={() => setActiveCall(p => p ? { ...p, isSpeakerOn: !p.isSpeakerOn } : null)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  !activeCall.isSpeakerOn 
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/35 hover:bg-amber-500/30' 
                    : 'bg-slate-850 text-slate-300 border-slate-700/55 hover:bg-slate-800'
                }`}
                title={activeCall.isSpeakerOn ? 'إطفاء مكبر الصوت' : 'تشغيل مكبر الصوت'}
              >
                {activeCall.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Video Camera Control toggle (only active for video calls) */}
              <button
                type="button"
                disabled={activeCall.type !== 'video'}
                onClick={() => setActiveCall(p => p ? { ...p, isVideoOff: !p.isVideoOff } : null)}
                className={`p-3.5 rounded-2xl border transition-all disabled:opacity-30 ${
                  activeCall.isVideoOff && activeCall.type === 'video'
                    ? 'bg-red-500/20 text-red-500 border-red-500/35 hover:bg-red-500/30' 
                    : 'bg-slate-850 text-slate-300 border-slate-700/55 hover:bg-slate-800'
                }`}
                title={activeCall.isVideoOff ? 'تفعيل الكاميرا' : 'تعطيل الكاميرا'}
              >
                {activeCall.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>

            {/* Hangup Red button */}
            <button
              type="button"
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:shadow-red-750/50 hover:scale-105 transition-all text-xs border-4 border-slate-950 flex-shrink-0"
              title="إنهاء المكالمة"
            >
              <PhoneOff className="w-7 h-7 transform rotate-135" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
