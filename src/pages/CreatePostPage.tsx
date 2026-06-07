import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Image, Video, MapPin, PenTool, Sparkles, Plus, X, Upload } from 'lucide-react';

interface CreatePostPageProps {
  onCreatePost: (type: 'post' | 'reel', caption: string, location: string, mediaUrls: string[]) => void;
}

// Preset Premium Engineering Blueprints/BIM images to make testing incredibly fun and easy!
const PRESET_BG_OPTIONS = [
  { url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80', label: 'مخطط موقع مدني' },
  { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', label: 'صيانة وتكييف' },
  { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', label: 'تشييد وبناء أبراج' },
  { url: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80', label: 'برمجة ذكاء اصطناعي' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screencast-34356-large.mp4', label: 'ريلز: برمجة شاشة', isVideo: true },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-wind-turbines-spinning-under-clouds-32943-large.mp4', label: 'ريلز: طاقة الرياح', isVideo: true }
];

export default function CreatePostPage({ onCreatePost }: CreatePostPageProps) {
  const navigate = useNavigate();
  const routerState = useLocation().state as any;

  const [type, setType] = useState<'post' | 'reel'>(routerState?.type || 'post');
  const [caption, setCaption] = useState(routerState?.initialCaption || '');
  const [locationValue, setLocationValue] = useState('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAddPresetUrl = (url: string, isVideo?: boolean) => {
    if (isVideo) {
      setType('reel');
    } else {
      setType('post');
    }
    setSelectedUrls([url]);
  };

  const handleCustomAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setSelectedUrls([...selectedUrls, customUrlInput.trim()]);
    setCustomUrlInput('');
  };

  const handleRemoveUrl = (index: number) => {
    setSelectedUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Convert selected local device files to Data URL (base64) so it immediately renders
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const filesArray = Array.from(e.target.files) as File[];
    
    let processedCount = 0;
    const newUrls: string[] = [];
    
    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newUrls.push(reader.result);
        }
        processedCount++;
        
        if (processedCount === filesArray.length) {
          setSelectedUrls((prev) => [...prev, ...newUrls]);
          setIsUploading(false);
          // If a file is uploaded, automatically set type based on file type
          if (file.type.startsWith('video/')) {
            setType('reel');
          } else {
            setType('post');
          }
        }
      };
      
      reader.onerror = () => {
        processedCount++;
        if (processedCount === filesArray.length) {
          setIsUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    const mediaList = selectedUrls.length > 0 ? selectedUrls : [
      // default fallback
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ];

    onCreatePost(type, caption, locationValue, mediaList);
    navigate('/');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto scrollbar-none text-right">
      <div className="max-w-xl mx-auto">
        
        {/* Header bar */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span>نشر تخصص هندسي جديد</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </h1>
          <p className="text-xs text-dark-muted mt-1">شارك مخططاتك، وثق تطلعاتك وصنع الفارق مع مجتمع المهندسين العرب.</p>
        </div>

        {/* Tab picker for type */}
        <div className="flex border border-dark-border bg-dark-card rounded-2xl overflow-hidden p-1.5 mb-6">
          <button
            onClick={() => setType('post')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              type === 'post' ? 'bg-brand-primary text-white shadow-md' : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>منشور اعتيادي (صور)</span>
          </button>
          <button
            onClick={() => setType('reel')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              type === 'reel' ? 'bg-brand-primary text-white shadow-md' : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>ريلز هندسي قصيرة (فيديو)</span>
          </button>
        </div>

        <form onSubmit={handlePublish} className="space-y-5">
          {/* Caption text input area */}
          <div className="bg-dark-card border border-dark-border p-4 rounded-2xl text-right">
            <label className="text-xs font-bold text-dark-text block mb-2">التعليق والهاشتاجات</label>
            <textarea
              required
              rows={4}
              placeholder="اكتب تفاصيل الكود، مقياس الرسم، أو نصائح فنية للزملاء... استخدم الهاشتاجات لمزيد من الانتشار."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-dark-bg/60 border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Location Value Picker */}
          <div className="bg-dark-card border border-dark-border p-4 rounded-2xl text-right">
            <label className="text-xs font-bold text-dark-text block mb-2">إضافة الموقع الجغرافي / المشروع</label>
            <div className="relative">
              <input
                type="text"
                placeholder="مثال: موقع العمل، دبي المالي، صنعاء القديمة..."
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                className="w-full bg-dark-bg/60 border border-dark-border rounded-xl py-2.5 pr-9 pl-3 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
              />
              <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted" />
            </div>
          </div>

          {/* Media Attachments Picker */}
          <div className="bg-dark-card border border-dark-border p-4 rounded-2xl text-right">
            <label className="text-xs font-bold text-dark-text block mb-2">ملفات العرض الإبداعية</label>
            
            {/* 📁 Native File Upload Box */}
            <div className="border-2 border-dashed border-dark-border/80 hover:border-brand-primary/80 rounded-2xl p-6 mb-4 text-center cursor-pointer bg-dark-bg/25 hover:bg-dark-bg/40 transition-all relative flex flex-col items-center justify-center space-y-2 group">
              <input
                type="input"
                className="hidden"
                readOnly
              />
              <input
                type="file"
                accept={type === 'post' ? 'image/*' : 'video/*'}
                multiple={type === 'post'}
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                title="تصفح ملفاتك المحلية لرفعها"
              />
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div className="font-sans">
                <span className="text-xs font-black text-dark-text block">اضغط هنا أو اسحب وأفلت لرفع صورة أو فيديو من جهازك</span>
                <span className="text-[10px] text-dark-muted block mt-1 leading-relaxed">
                  {type === 'post' 
                    ? 'يدعم تحميل صور المخططات والرسومات الهندسية (PNG, JPG, SVG, WebP)' 
                    : 'يدعم تحميل مقاطع ريلز المصورة فئة الفيديو (MP4, WebM)'}
                </span>
              </div>
            </div>

            {/* Displaying selected items */}
            {selectedUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {selectedUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-black border border-dark-border flex items-center justify-center shadow-lg">
                    {url.startsWith('data:video/') || url.endsWith('.mp4') || url.includes('mixkit.co/videos') ? (
                      <video src={url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(idx)}
                      className="absolute top-1 left-1 p-1 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors z-20"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-dark-muted py-2 bg-dark-bg/40 border border-dark-border/40 rounded-xl text-center mb-3">
                لم تقم باختيار ملفات بعد. يمكنك رفع ملفاتك المحلية بالأعلى، أو وضع رابط بالأسفل، أو النقر على النماذج الجاهزة!
              </p>
            )}

            {/* Custom URL addition */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="أضف رابط صورة أو فيديو خارجي مباشر..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted font-sans"
              />
              <button
                type="button"
                onClick={handleCustomAddUrl}
                className="bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                إضافة
              </button>
            </div>

            {/* Premium Seed Templates */}
            <div className="mt-4 pt-3 border-t border-dark-border/40 font-sans">
              <span className="text-[10px] text-brand-primary font-bold block mb-2">استيراد مخططات وتصاميم هندسية جاهزة للاختبار السريع:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_BG_OPTIONS.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetUrl(opt.url, opt.isVideo)}
                    className="text-[10px] bg-dark-bg/85 border border-dark-border/60 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl px-2.5 py-1.5 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {opt.isVideo ? <Video className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit panel Buttons */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-brand-primary disabled:opacity-50 text-white font-extrabold text-sm py-3.5 rounded-2xl hover:bg-brand-primary/95 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            <span>{isUploading ? 'جاري معالجة ورفع الملفات...' : 'نشر التقرير / المنشور الآن'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
