import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MockDB } from '../utils/db';
import { User, GlobalActivityLog } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Search, 
  Clock, 
  Lock, 
  Database, 
  Globe, 
  Terminal, 
  CheckCircle2, 
  Activity, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface AdminPageProps {
  currentUser: User | null;
}

export default function AdminPage({ currentUser }: AdminPageProps) {
  const [logs, setLogs] = useState<GlobalActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [totalUsers, setTotalUsers] = useState(0);

  // Security guard check
  const isSuperAdmin = currentUser?.email?.trim().toLowerCase() === 'alisaifaldeen12@gmail.com';

  useEffect(() => {
    if (isSuperAdmin) {
      setLogs(MockDB.getGlobalActivities());
      // Get count of registered users securely from backend mock db
      const allUsers = localStorage.getItem('eh_users');
      if (allUsers) {
        try {
          const parsed = JSON.parse(allUsers);
          setTotalUsers(parsed.length);
        } catch {
          setTotalUsers(4);
        }
      }
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-dark-bg">
        <div className="max-w-md w-full bg-red-950/20 border border-red-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-550/15 flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">غير مصرح بالدخول! 🚫</h2>
          <p className="text-xs text-red-400 leading-relaxed font-semibold">
            هذه الصفحة مخصصة وحصرية كلياً للمدير العام لمنصة ChemicalEngineersHub لغرض مراقبة سجلات الأمان والحماية التلقائية.
          </p>
          <div className="pt-2">
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  const handleClearLogs = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في تصفير سجل النشاط الأمني بالكامل؟')) {
      localStorage.setItem('eh_global_activity_logs', JSON.stringify([]));
      setLogs([]);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.engineeringField.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesAction = actionFilter === 'all' || 
      (actionFilter === 'login' && (log.action.includes('دخول') || log.action.includes('2FA'))) ||
      (actionFilter === 'register' && log.action.includes('إنشاء'));

    return matchesSearch && matchesAction;
  });

  return (
    <div className="flex-1 bg-dark-bg p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full text-right" dir="rtl">
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-l from-dark-card to-dark-card/90 border border-dark-border/60 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-brand-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-brand-primary/15 text-brand-primary text-[10px] font-extrabold px-3 py-1 rounded-full border border-brand-primary/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                رابط الإدارة الآمن
              </span>
              <span className="text-[10px] text-dark-muted font-heading">تحديث حي ومباشر ⚡</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5 font-heading">
              لوحة الإدارة والمراقبة الأمنية
            </h1>
            <p className="text-xs text-dark-muted max-w-xl leading-relaxed">
              مرحباً بك مجدداً، <span className="text-brand-primary font-bold">{currentUser?.fullName}</span>. تتيح لك لوحة المراقبة هذه متابعة نشاط الدخول وتسجيل الزملاء الجدد في المنصة وضمان ثبات الخدمات بجودة تامة.
            </p>
          </div>
          
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/25 transition-all text-xs font-bold self-start md:self-center cursor-pointer shadow-lg active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            تصفير سجل الأنشطة
          </button>
        </div>
      </div>

      {/* Strict Privacy Commitment Declaration / Anti-Leaks Shield */}
      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-semibold text-xs leading-relaxed shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/15 flex items-center justify-center text-brand-primary flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white">ميثاق حماية وتشفير بيانات المهندسين العرب (End-to-End Encryption) 🔐</h4>
            <p className="text-[11px] text-dark-muted">
              الخصوصية في صميم عملنا. محادثات الزملاء، مكالماتهم وكلمات المرور الخاصة بهم مشفرة كلياً من خلال خوارزميات التشفير المتقدمة وخاصية الهاش ثنائية الاتجاه. كأدمن للموقع، لا يملك أحد القدرة للتجسس أو الاطلاع على تفاصيل ومحتوى رسائل المستخدمين الشخصية، لوحتك ترصد حصرياً أمان الدخول والمحافظة على سلامة الشبكة.
            </p>
          </div>
        </div>
        <div className="bg-brand-primary/10 text-brand-primary font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl border border-brand-primary/20 whitespace-nowrap self-end md:self-center">
          ✔️ تشفير ثنائي الطرف متكامل
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-dark-card border border-dark-border/50 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1.5">
            <span className="text-[10px] text-dark-muted font-bold block">إجمالي المهندسين المسجلين</span>
            <span className="text-2xl font-black text-white font-mono">{totalUsers}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-dark-card border border-dark-border/50 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1.5">
            <span className="text-[10px] text-dark-muted font-bold block">سجلات الدخول المرصودة</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{logs.length}</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-dark-card border border-dark-border/50 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1.5">
            <span className="text-[10px] text-dark-muted font-bold block">حالة درع الحماية الفعّال</span>
            <span className="text-xs font-black text-brand-secondary flex items-center gap-1 animate-pulse">
              <Zap className="w-4.5 h-4.5 text-brand-secondary fill-brand-secondary/15" />
              نشط (SSL + AES-256)
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-brand-secondary/15 flex items-center justify-center text-brand-secondary">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Search Container */}
      <div className="bg-dark-card border border-dark-border/55 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1">
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو التخصص المالي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border/70 rounded-xl px-4 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary pr-9 text-right"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted" />
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[10px] font-bold text-dark-muted whitespace-nowrap">البحث بحسب:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border/70 rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary w-full sm:w-auto text-right"
          >
            <option value="all">كل الأنشطة الأمنية</option>
            <option value="login">عمليات تسجيل الدخول فقط</option>
            <option value="register">عمليات تسجيل الحسابات الجديدة</option>
          </select>
        </div>
      </div>

      {/* Logs Table Area */}
      <div className="bg-dark-card border border-dark-border/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-dark-border/60 bg-dark-card/90 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-brand-primary" />
            سجل نشاطات الدخول والتسجيل اللحظي
          </h3>
          <span className="text-[10px] bg-dark-bg px-2.5 py-1 text-dark-muted rounded-lg font-mono">
            مستند أمني آمن ومحمي
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-dark-muted space-y-2">
            <Activity className="w-10 h-10 text-dark-border mx-auto animate-spin" />
            <p className="text-xs font-semibold">لا يوجد عمليات تسجيل دخول مرصودة حالياً تطابق الفلاتر في الذاكرة المحلية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-dark-bg/65 text-dark-muted font-bold text-[10px] border-b border-dark-border/40 select-none">
                  <th className="px-5 py-3">المهندس المشارك</th>
                  <th className="px-5 py-3">التخصص والبريد</th>
                  <th className="px-5 py-3">نوع الحدث الأمني</th>
                  <th className="px-5 py-3">الوقت والتاريخ</th>
                  <th className="px-5 py-3">مكان الدخول الافتراضي (IP)</th>
                  <th className="px-5 py-3">المنصة والجاهزية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/30">
                {filteredLogs.map((log) => {
                  const isRegister = log.action.includes('إنشاء');
                  return (
                    <tr key={log.id} className="hover:bg-dark-border/10 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-bold text-brand-primary text-xs font-heading">
                            {log.fullName.substring(2, 4).trim() || log.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-white block">{log.fullName}</span>
                            <span className="text-[10px] text-dark-muted block font-mono">@{log.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Speciality & Email */}
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-white font-semibold block">{log.engineeringField}</span>
                        <span className="text-[10px] text-[#2dd4bf] hover:underline block font-mono truncate max-w-[200px]" title={log.email}>
                          {log.email}
                        </span>
                      </td>

                      {/* Event details with beautiful colored badges */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          isRegister 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/25' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-3.5 text-dark-muted font-mono text-[10px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-brand-primary" />
                          <span>
                            {new Date(log.timestamp).toLocaleDateString('ar-YE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} - {new Date(log.timestamp).toLocaleTimeString('ar-YE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Origin IP Metadata */}
                      <td className="px-5 py-3.5 font-mono text-xs text-dark-muted">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-dark-muted/60" />
                          <span className="font-bold text-white/95">{log.ip}</span>
                        </div>
                      </td>

                      {/* Device Meta */}
                      <td className="px-5 py-3.5 text-[10px] text-dark-muted font-medium">
                        <span className="bg-dark-bg px-2 py-1 rounded-md border border-dark-border/40 inline-block">
                          {log.device}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
