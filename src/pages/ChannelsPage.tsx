import React, { useState, useEffect } from 'react';
import { Channel, ChannelMessage, User } from '../types';
import { MockDB } from '../utils/db';
import { Hash, Users, Send, Plus, Lock, Globe, Sparkles } from 'lucide-react';

interface ChannelsPageProps {
  currentUser: User | null;
}

export default function ChannelsPage({ currentUser }: ChannelsPageProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState('');

  // Create Channel Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDescription] = useState('');
  const [newChanType, setNewChanType] = useState<'general' | 'jobs' | 'projects' | 'news'>('general');
  const [newChanPublic, setNewChanPublic] = useState(true);

  useEffect(() => {
    const list = MockDB.getChannels();
    setChannels(list);
    if (list.length > 0) {
      setActiveChannel(list[0]);
    }
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    const msgs = MockDB.getChannelMessages(activeChannel.id);
    setChannelMessages(msgs);
  }, [activeChannel]);

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeChannel) return;

    // Send through db
    const createdMsg = MockDB.sendChannelMessage(activeChannel.id, newMsgText.trim());
    setChannelMessages((prev) => [...prev, createdMsg]);
    setNewMsgText('');

    // Trigger instant mock community feedback replies to make discussions active
    triggerMockChannelFeedback(activeChannel.id);
  };

  const triggerMockChannelFeedback = (channelId: string) => {
    setTimeout(() => {
      const mockReactions = [
        'أتفق معك تماماً في هذه المسألة الهندسية زميلي. الفروقات تظهر بوضوح تحت الضغط العملي.',
        'لقد واجهنا مشكلة مشابهة في المشروع الماضي وحللناها بهذا المقترح بالضبط!',
        'رائع جداً! هل من مصادر مضافة أو أكواد كود البناء العربي يمكن تحميلها كمرجع؟ 📐📖',
        'مشاركة ممتازة فخور بوجود مثل هذا النقاش المهني الفعال.'
      ];
      const randomText = mockReactions[Math.floor(Math.random() * mockReactions.length)];
      const seedUsers = ['user_ahmed', 'user_sara', 'user_admin'];
      // Choose random seed user except the active editor author
      const randomUserId = seedUsers[Math.floor(Math.random() * seedUsers.length)];

      const originalCurrId = localStorage.getItem('eh_curr_user_id') || 'user_ahmed';

      // Write under the seed user identity
      localStorage.setItem('eh_curr_user_id', randomUserId);
      MockDB.sendChannelMessage(channelId, randomText);

      // Restore identity
      localStorage.setItem('eh_curr_user_id', originalCurrId);

      // Re-fetch messages in active view
      if (activeChannel && activeChannel.id === channelId) {
        setChannelMessages(MockDB.getChannelMessages(channelId));
      }
    }, 1800);
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;

    const createdChan = MockDB.createChannel(
      newChanName.trim(),
      newChanDesc.trim(),
      newChanType,
      newChanPublic
    );

    setChannels(MockDB.getChannels());
    setActiveChannel(createdChan);
    setShowCreateModal(false);

    // Reset fields
    setNewChanName('');
    setNewChanDescription('');
    setNewChanType('general');
    setNewChanPublic(true);
  };

  return (
    <div className="flex h-screen bg-dark-bg text-right select-none">
      
      {/* List section of channels (Right side) */}
      <div className="w-80 md:w-90 border-l border-dark-border bg-dark-card flex flex-col h-full flex-shrink-0 z-10">
        <div className="p-5 border-b border-dark-border flex justify-between items-center">
          <h2 className="font-bold text-lg">نقاشات القنوات</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/95 transition-colors"
            title="إنشاء قناة جديدة"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto divide-y divide-dark-border/40 scrollbar-none">
          {channels.map((chan) => {
            const isActive = activeChannel?.id === chan.id;
            return (
              <div
                key={chan.id}
                onClick={() => setActiveChannel(chan)}
                className={`flex gap-3 p-4 cursor-pointer transition-all ${
                  isActive ? 'bg-brand-primary/10 border-r-4 border-brand-primary' : 'hover:bg-dark-border/30'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                  <Hash className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-dark-text truncate">{chan.name}</span>
                    <span className="text-[9px] text-dark-muted font-mono flex items-center gap-0.5">
                      <Users className="w-3 h-3" />
                      {chan.membersCount}
                    </span>
                  </div>
                  <p className="text-[10px] text-dark-muted truncate leading-relaxed">
                    {chan.lastMessage || chan.description || 'احصل على نقاشات مهنية خلاقة...'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Channel Message Window Chat panel (Left side) */}
      <div className="flex-1 flex flex-col h-full bg-dark-bg relative">
        {activeChannel ? (
          <>
            {/* Header channel bar details */}
            <div className="p-5 border-b border-dark-border bg-dark-card/60 backdrop-blur-md sticky top-0 flex justify-between items-center z-15">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-dark-text">{activeChannel.name}</h3>
                  {activeChannel.isPublic ? (
                    <Globe className="w-3.5 h-3.5 text-green-400" title="قناة عامة" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-yellow-400" title="قناة خاصة" />
                  )}
                </div>
                <p className="text-[10px] text-dark-muted font-medium mt-1 leading-relaxed max-w-xl">
                  {activeChannel.description}
                </p>
              </div>
            </div>

            {/* Scrolling messages container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {channelMessages.map((msg) => {
                const isMine = msg.userId === currentUser?.id;
                return (
                  <div key={msg.id} className="flex gap-3 hover:bg-dark-border/10 p-2.5 rounded-2xl transition-all text-right">
                    <img
                      src={msg.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt={msg.username}
                      className="w-9 h-9 rounded-xl object-cover border border-dark-border flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-xs text-dark-text">{msg.username}</span>
                        <span className="text-[9px] text-dark-muted font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-medium whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form at bottom */}
            <form onSubmit={handleSendMsg} className="p-4 border-t border-dark-border bg-dark-card/60 backdrop-blur-md flex items-center gap-3">
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="أرسل مشاركة تخصصية أو أضف تعليقاً على الموضوع..."
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
              />
              <button
                type="submit"
                disabled={!newMsgText.trim()}
                className="p-3 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4 transform rotate-180" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dark-muted space-y-4">
            <span className="text-xl">اختر غرف القنوات أو نقاشات المهندسين</span>
          </div>
        )}
      </div>

      {/* 3. Create Channel Modal Popup Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-6 shadow-2xl z-10 text-right">
            <h3 className="font-extrabold text-base mb-2 flex items-center gap-2">
              <span>إنشاء قناة هندسية جديدة</span>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </h3>
            <p className="text-dark-muted text-xs mb-5">
              أنشئ قنوات مخصصة للنقاش، عرض المشاريع، تتبع الوظائف، أو التعاون التقني.
            </p>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-text">اسم القناة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: هندسة الطاقة النظيفة العربي"
                  value={newChanName}
                  onChange={(e) => setNewChanName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-text">وصف القناة</label>
                <textarea
                  placeholder="وصف مختصر لموضوعات وقوانين القناة..."
                  rows={3}
                  value={newChanDesc}
                  onChange={(e) => setNewChanDescription(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-text">نوع التخصص</label>
                <select
                  value={newChanType}
                  onChange={(e: any) => setNewChanType(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary"
                >
                  <option value="general">نقاش عام (General)</option>
                  <option value="jobs">فرص عمل وتوظيف (Jobs)</option>
                  <option value="projects">إدارة مشاريع ونماذج (Projects)</option>
                  <option value="news">أخبار ومقالات هندسية (News)</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-dark-border/40">
                <span className="text-xs font-semibold text-dark-text">قناة عامة</span>
                <input
                  type="checkbox"
                  checked={newChanPublic}
                  onChange={(e) => setNewChanPublic(e.target.checked)}
                  className="w-4 h-4 accent-brand-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary text-white font-bold text-xs py-2.5 rounded-xl hover:bg-brand-primary/95"
                >
                  إنشاء القناة
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-dark-border text-dark-muted hover:bg-red-500/15 hover:text-red-400 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  إلغاء الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
