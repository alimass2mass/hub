import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageType = 'ar' | 'en';

interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Substantial translation dictionary for the entire ChemicalEngineersHub application
const translations: Record<LanguageType, Record<string, string>> = {
  ar: {
    // Nav & Layout
    'nav.home': 'الرئيسية',
    'nav.explore': 'استكشاف',
    'nav.reels': 'ريلز الهندسية',
    'nav.search': 'بحث',
    'nav.notifications': 'الإشعارات',
    'nav.messages': 'الرسائل',
    'nav.channels': 'القنوات الهندسية',
    'nav.create': 'نشر جديد',
    'nav.profile': 'الملف الشخصي',
    'nav.admin': 'لوحة الإدارة الأمنية',
    'nav.logout': 'تسجيل الخروج',
    'nav.subheading': 'مجتمع المهندسين العرب',
    'nav.platform_eng': 'هندسة المنصة',
    'nav.developed_by': 'تطوير المهندس علي سيف الدين هيدر النوفل 2023',

    // Authentication Page
    'auth.welcome': 'مرحباً بك في ChemicalEngineersHub',
    'auth.description': 'أكبر منصة وشبكة تواصل اجتماعية مخصصة للمهندسين العرب في مختلف التخصصات. شارك مشاريعك الفنية والبرمجية ونقاشاتك الآن!',
    'auth.feature1_title': 'تواصل احترافي آمن',
    'auth.feature1_desc': 'شبكة اجتماعية تفاعلية مخصصة كلياً لمشاريع وعنقود الأفكار الهندسية العربية.',
    'auth.feature2_title': 'حلول ومخططات هندسية',
    'auth.feature2_desc': 'استكشف وشارك التصاميم الإنشائية والميكانيكية والمشاريع التكنولوجية بسهولة.',
    'auth.feature3_title': 'محادثات وحلقات مرئية',
    'auth.feature3_desc': 'تواصل مباشرة مع الزملاء عبر غرف للمناقشات الصوتية والريلز اليومية والمراسلات المشفرة.',
    'auth.login_title': 'تسجيل الدخول للمجتمع الهندسي الآمن',
    'auth.username_or_email': 'اسم المستخدم أو البريد الإلكتروني',
    'auth.password': 'كلمة المرور الشخصية',
    'auth.security_notice': '✔️ المحادثات والاتصالات وكلمات المرور مشفرة ومؤمنة بالكامل كلياً (End-to-End Encrypted) لخصوصية مطلقة ولا يمكن لأي مستخدم آخر كشفها.',
    'auth.login_btn': 'دخول للمجتمع الهندسي الآمن',
    'auth.or_register': 'أو تسجيل حساب جديد',
    'auth.fullname': 'الاسم الكامل',
    'auth.username': 'اسم المستخدم',
    'auth.email': 'البريد الإلكتروني',
    'auth.engineering_field': 'التخصص العلمي الهندسي',
    'auth.register_notice': '* سجل حسب القسم الأقرب لك لتسهيل الاختيار على المهندسين الجدد وأثناء تعديل الملفات الشخصية.',
    'auth.register_btn': 'إنشاء التسجيل فوراً',
    'auth.2fa_title': '📲 التحقق المحمي بخطوتين (2FA OTP)',
    'auth.2fa_desc': 'تم رصد تشفير المصادقة الثنائية على حسابك. يرجى إدخال الرمز السري الإضافي المسترد من جهازك المعتمد أو تطبيق الهوية.',
    'auth.simulated_otp': 'رمز الدخول المحاكى (OTP Code):',
    'auth.enter_otp': 'أدخل الرمز السري (6 أرقام)',
    'auth.confirm_2fa': 'تأكيد وتسجيل الدخول',
    'auth.cancel': 'إلغاء',

    // Stories, Feed & Post items
    'feed.stories_title': 'القصص اليومية',
    'feed.add_story': 'قصتك',
    'feed.suggestions_title': 'مهندسون قد تعرفهم',
    'feed.follow': 'متابعة',
    'feed.following': 'متابع',
    'feed.no_posts': 'لا توجد منشورات هندسية حالياً.',
    'feed.likes': 'إعجاب',
    'feed.comments': 'تعليق',
    'feed.saves': 'حفظ',
    'feed.delete_post': 'حذف المنشور',
    'feed.write_comment': 'اكتب تعليقاً فنياً...',
    'feed.send': 'إرسال',
    'feed.view_more_comments': 'عرض كل التعليقات',

    // Create Post Page
    'create.title': 'نشر مشروع أو تحديث هندسي',
    'create.caption_placeholder': 'اكتب تفاصيل مشروعك أو المخطط الهندسي هنا مع ذكر التخصص والتقنيات المستخدمة...',
    'create.location': 'الموقع الجغرافي للمشروع',
    'create.media_urls': 'روابط الصور أو المخططات الفنية (افصل بفاصلة)',
    'create.post_type': 'نوع المنشور',
    'create.type_post': 'منشور في التغذية (Feed)',
    'create.type_reel': 'ريل مرئي (Reel)',
    'create.publish_btn': 'تأمين ونشر في المنصة',
    'create.desc': 'انشر مشاريعك، تصاميمك، نقاشاتك أو حتى دوراتك لتصل لآلاف المهندسين العرب في وقت قياسي وبطرق عرض حديثة.',

    // Explore / Reels Pages
    'explore.title': 'استكشاف المشاريع والتصاميم الهندسية',
    'explore.subtitle': 'تصفح آخر ما نشره زملاء المهنة في جميع الأقسام والابتكارات الهندسية.',
    'reels.title': 'ريلز الهندسية وفيديوهات البناء والتحكم',
    'reels.subtitle': 'مقاطع فيديو هندسية تشرح التصاميم، الدوائر الإلكترونية، ومواقع العمل وعمليات التشغيل.',

    // Search Page
    'search.title': 'البحث الموسع والمتقدم',
    'search.subtitle': 'ابحث عن زملاء المهنة والمهندسين حسب الأقسام العلمية، المهارات البرمجية الدقيقة وحالة العمل.',
    'search.input_placeholder': 'ابحث بالاسم، التخصص أو الكلمات المفتاحية...',
    'search.hide_filters': '⚙️ إخفاء الفلاتر المتقدمة ▲',
    'search.show_filters': '⚙️ إظهار الفلاتر المتقدمة ▼',
    'search.reset_btn': 'إعادة تعيين البحث والفلاتر ✕',
    'search.label_field': 'القسم العلمي / التخصص',
    'search.label_status': 'الحالة المهنية وتوفر المهندس',
    'search.label_skill': 'البحث بمهارة معينة / برنامج متخصص',
    'search.skill_placeholder': 'اكتب المهارة مثل: Revit، React، AutoCAD، SolidWorks...',
    'search.popular_skills': 'مهارات هندسية شائعة للبحث السريع:',
    'search.all_fields': 'كل الأقسام العلمية',
    'search.all_statuses': 'كل الحالات المهنية',
    'search.tab_engineers': 'المهندسون',
    'search.tab_posts': 'المنشورات',
    'search.tab_channels': 'القنوات',
    'search.no_results_users': 'لا يوجد مهندسون يطابقون خيارات الفلترة والبحث الحالية.',
    'search.no_results_posts': 'لا يوجد نتائج منشورة تطابق بحثك.',
    'search.no_results_channels': 'لا توجد قنوات توافق كلمة بحثك.',
    'search.members': 'مهندس',
    'search.prompt_filters': 'حدد فلاتر البحث أو ابدأ الكتابة',
    'search.prompt_desc': 'يمكنك الفلترة حسب تخصص المهندس العلمي، حالته المهنية للعمل، أو استكشاف أصحاب المهارات مباشرة.',

    // Messages Page
    'messages.title': 'غرف صندوق المحادثات المشفرة',
    'messages.select_dialog': 'اختر محادثة زميل لبدء نقاش هندسي آمن ومعزول وتلقي ملفات التصاميم والتعاون الفني المباشر.',
    'messages.search_users': 'ابحث بالاسم لبدء محادثة...',
    'messages.online': 'متصل حالياً',
    'messages.offline': 'نشط مؤخراً',
    'messages.msg_placeholder': 'اكتب نقاشاً هندسياً مشفراً بـ SHA-256...',
    'messages.security_disclaimer': '🔒 محادثاتك محمية بآليات الأمن السيبراني وعزل البيانات ولا تظهر على السيرفر المركزي.',

    // Channels Page
    'channels.title': 'القنوات ومجالس النقاشات التخصصية',
    'channels.subtitle': 'انضم لقنوات تخصصك الهندسي لتبادل الخبرات، مشاريع التخرج، الكتب العلمية ومخططات العمل.',
    'channels.joined': 'أنت عضو بالقناة',
    'channels.join': 'الانضمام للقناة',
    'channels.not_member': 'يجب عليك الانضمام للقناة حتى تتمكن من إرسال وقراءة الرسائل مع زملائك.',
    'channels.members_suffix': 'مهندس في التخصص',

    // Profile Page
    'profile.edit_btn': 'تعديل الملف وخصوصية الأمان',
    'profile.follow_requested': 'تم إرسال طلب المتابعة ⏳',
    'profile.follow_accept': 'قبول الطلب ✅',
    'profile.follow_decline': 'رفض ✕',
    'profile.followers': 'متابع',
    'profile.following_label': 'يتابع',
    'profile.posts_label': 'منشور',
    'profile.posts_tab': 'المنشورات الهندسية',
    'profile.saved_tab': 'العناصر المحفوظة',
    'profile.private_title': '🔒 هذا الحساب ذو طابع شخصي مغلق',
    'profile.private_desc': 'يجب عليك إرسال طلب متابعة والموافقة عليه لتصفح منشورات ومشاريع ومهارات الزميل.',
    'profile.unfollow_dialog': 'إلغاء المتابعة',
    'profile.block_user': 'حظر المستخدم',
    'profile.unblock_user': 'إلغاء الحظر',

    // Edit Profile Page / Settings
    'settings.title_banner': 'CONTROL CENTER & SECURITY COCKPIT',
    'settings.title': 'إعدادات الحساب وخصوصية المهندس',
    'settings.subtitle': 'تحليل أمان الأجهزة، التحقق بخطوتين (2FA)، قوائم الحجب وحماية هجمات الهوية وجنسية الواجهة.',
    'settings.back_btn': 'رجوع للملف الشخصي',
    'settings.success_save': '✓ تم تحديث بياناتك الشخصية وحفظها بشكل آمن ومحمي في ذاكرة التشغيل.',
    'settings.tab_profile': 'الملف الشخصي والمظهر',
    'settings.tab_security': 'الأمان ومكافحة الاختراق',
    'settings.tab_privacy': 'الخصوصية وتعديل الوصول',
    'settings.avatar_label': 'الصورة الشخصية للبروفايل',
    'settings.avatar_placeholder': 'أدخل رابط صورة مباشر للبروفايل...',
    'settings.avatar_upload': 'رفع صورة',
    'settings.avatar_help': 'الصق رابط صورة مباشرة للمهندس أو اضغط على زر التحميل المباشر لرفع صورة حقيقية من هاتفك أو كومبيوترك.',
    'settings.fullname_label': 'الاسم الكامل واللقب العلمي',
    'settings.field_label': 'التخصص الهندسي الرسمي',
    'settings.status_label': 'الحالة المهنية (لتظهر بجانب اسمك للشركات والباحثين عن مهاراتك)',
    'settings.skills_label': 'المهارات التقنية والبرمجية (افصل بينها بفاصلة ,)',
    'settings.skills_placeholder': 'مثال: React, AutoCAD, Python, Revit, SolidWorks',
    'settings.skills_help': 'تساعد هذه الكلمات المفتاحية الزملاء والشركات في العثور عليك عبر البحث المتقدم.',
    'settings.bio_label': 'السيرة المهنية والخبرات (Bio/Slogan)',
    'settings.bio_placeholder': 'اكتب نبذة مهنية عن مشاريعك الهندسية السابقة والشركات التي تديرها حالياً...',
    'settings.website_label': 'الموقع الإلكتروني / معرض الأعمال المهنية',
    'settings.location_label': 'مكان الإقامة الحالي والعمل',
    'settings.save_btn': 'حفظ البيانات المهنية الأساسية',
    'settings.lang_heading': 'لغة واجهة المستخدم وعرض المنصة',
    'settings.lang_label': 'اختر لغة النظام المفضلة (تبديل اللغة فوري مع حفظ الإعدادات)',
    'settings.lang_ar': '🇸🇦 العربية (Arabic - RTL)',
    'settings.lang_en': '🇺🇸 الإنجليزية (English - LTR)',
    'settings.lang_notice': 'سيقوم تغيير اللغة بتعديل اتجاهات النصوص وهيكلة العناصر لتناسب المعايير المهنية لتصميم الفضاءات الرقمية.',

    // Edit Profile Page / Security Tab
    'settings.sec_2fa_status_active': 'نشط وقوي SECURED',
    'settings.sec_2fa_status_inactive': 'حماية متوسطة RECOMMENDED',
    'settings.sec_2fa_title': 'التحقق بخطوتين (Two-Factor Authentication 2FA)',
    'settings.sec_2fa_desc': 'تعد هذه الميزة أقوى جدار حماية لحسابك المهني. عند تفعيلها، في حال حصل أي شخص غريب على كلمة مرورك، لن يتمكن من فتح الجلسة إلا بعد إدخال كود التحقق الإضافي (كود OTP مرسل للأجهزة المعتمدة لديك).',
    'settings.sec_2fa_toggle': 'تفعيل الحماية الثنائية:',
    'settings.sec_2fa_active_notice': '📢 المصادقة الثنائية نشطة الآن! عند محاولة الدخول وتغيير الأجهزة مستقبلاً، سنستعرض لك الرمز السري لمحاكاة التوثيق في واجهة الدخول بشكل آمن.',
    'settings.sec_pw_title': 'تعديل كلمة المرور الدورية',
    'settings.sec_pw_success': 'تم تحديث الرقم السري للحساب بنجاح وتأمينه بتشفير SHA-256!',
    'settings.sec_pw_error_required': 'يرجى إدخال كلمة المرور الحالية والجديدة',
    'settings.sec_pw_current': 'كلمة المرور الحالية',
    'settings.sec_pw_new': 'كلمة المرور الجديدة',
    'settings.sec_pw_help': 'تنصح المنظومة باختيار (حروف + أرقام + رموز).',
    'settings.sec_pw_update_btn': 'تحديث كلمة المرور',
    'settings.sec_rate_title': 'مكافحة الهجمات ومعدل الطلبات API',
    'settings.sec_rate_active': 'Rate Limiter active',
    'settings.sec_rate_limit': 'الحد الأقصى للمحاولات:',
    'settings.sec_rate_limit_value': '3 محاولات خاطئة / 30 ثانية',
    'settings.sec_rate_registered': 'المحاولات الخاطئة المسجلة:',
    'settings.sec_rate_status': 'حالة الاتصال ومصادقة الـ IP:',
    'settings.sec_rate_status_locked': 'مغلق ومحظور لـ {time} ثانية 🚫',
    'settings.sec_rate_status_active': 'مؤمن ونشط (Active) ✓',
    'settings.sec_rate_help': 'يقوم سيرفر الشبكة بصد وحظر عناوين الـ IP التي ترسل كلمات مرور خاطئة تلو الأخرى لمنع تخمين الحسابات بالبرمجيات الخبيثة (Brute-Force Attack Defender).',
    'settings.sec_brute_test_btn': 'محاكاة محاولة تسلل برمجية (Brute-Force Test)',
    'settings.sec_sessions_title': 'نشاط تسجيل الدخول والأجهزة النشطة',
    'settings.sec_sessions_desc': 'يعرض جميع المواقع والجلسات التي فتحت حسابك الهندسي مؤخراً.',
    'settings.sec_sessions_terminate_all': 'إنهاء جميع الجلسات النشطة الأخرى',
    'settings.sec_sessions_current': 'الجهاز الحالي',
    'settings.sec_sessions_terminate': 'إنهاء الجلسة',
    'settings.sec_sessions_none': 'لا توجد جلسات أخرى مسجلة حالياً.',
    'settings.sec_logs_title': 'سجل الأمان الشامل ومراقبة التهديدات (Security Audit Trail)',
    'settings.sec_logs_desc': 'يتم تدوين جميع تفاعلات ووصول الحساب والعمليات الأمنية الحساسة لضمان الشفافية ومراقبة التطفل.',
    'settings.sec_logs_action': 'العملية والحدث الأمني',
    'settings.sec_logs_device': 'الجهاز والمصدر',
    'settings.sec_logs_ip': 'بوابة IP',
    'settings.sec_logs_time': 'التوقيت UTC',
    'settings.sec_logs_status': 'رمز الحالة',
    'settings.sec_logs_none': 'لم يتم تدوين أي عمليات أمان بعد.',
    
    // Edit Profile Page / Privacy Tab
    'settings.priv_account_label': 'تحديد ظهور الملف الشخصي (حساب خاص)',
    'settings.priv_account_desc': 'عند تفعيل الميزة، لن يتمكن سوى المهندسين الذين وافقت على متابعتهم من تصفح رييلز ومشاريع وعقود حسابك الشخصي.',
    'settings.priv_status_label': 'إخفاء نشاط الاتصال والتصفح الخفي (Invisible)',
    'settings.priv_status_desc': 'يتيح لك التواجد بالمنصة دون تفعيل النقطة الخضراء المتصلة، وتصفح غرف النقاش والقنوات بأمان دون كشف تواجدك للآخرين.',
    'settings.priv_msg_label': 'تحديد من يمكنه إرسال الرسائل المباشرة لك في صندوق الوارد',
    'settings.priv_msg_desc': 'حماية حسابك من الإزعاج والرسائل العشوائية والروابط المزيفة.',
    'settings.priv_msg_all': 'الجميع (أقصى مرونة)',
    'settings.priv_msg_followers': 'المتابعين الذين أتابعهم فقط',
    'settings.priv_msg_none': 'لا أحد (إلغاء صندوق الوارد)',
    'settings.priv_users_panel_title': 'إدارة المستخدمين وحماية الخصوصية الشخصية',
    'settings.priv_users_panel_desc': 'تحكم بخصوصية مجتمعك. يمكنك حظر أو كتم منشورات أو تقييد حسابات زملائك في المنصة للحد من وصولهم إليك.',
    'settings.priv_status_blocked': 'محظور',
    'settings.priv_status_muted': 'مكتوم',
    'settings.priv_status_restricted': 'مقيد',
    'settings.priv_action_unblock': 'إلغاء الحظر',
    'settings.priv_action_block': 'حظر (Block)',
    'settings.priv_action_unmute': 'إلغاء الكتم',
    'settings.priv_action_mute': 'كتم (Mute)',
    'settings.priv_action_unrestrict': 'إلغاء التقييد',
    'settings.priv_action_restrict': 'تقييد الحساب',

    // Feed sidebar sugestions
    'feed.switch_identity': 'التبديل لحساب آخر للتحقق والاختبار السريع 🔄:',
    'feed.active_badge': 'نشط',
    'feed.inactive_badge': 'متصل خفيّاً',
    'feed.about': 'نبذة',
    'feed.skills_match': 'الكفاءات التقنية المتطابقة:',
    
    // Notifications page
    'notif.title': 'مركز الإشعارات والتنبيهات والطلبات',
    'notif.empty': 'بريدك الإلكتروني ومركز الإشعارات خالٍ من الأحداث الهندسيّة الجديدة حالياً.',
    'notif.read_all_btn': 'تعليم الكل كمقروء ✓',
    'notif.request_title': 'طلبات المتابعة المعلقة للتواصل',
    'notif.type_like': 'أعجب بمشروعك أو المخطط الهندسي الخاص بك',
    'notif.type_comment': 'علق على منشورك قائلًا:',
    'notif.type_mention': 'ذكرك في دراسة فنية',
    'notif.type_follow': 'بدأ بمتابعة حسابك كمهندس زميل',
    'notif.type_request': 'يرغب بمتابعة حسابك المغلق (خاص)',
    'notif.type_joined': 'انضم لأحد مشاريعك التقنية أو قنواتك',
    
    // Story form Inside feed modal
    'story.form_title': 'إنشاء قصة هندسية جديدة',
    'story.form_desc': 'انشر قصصاً بشكل غير محدود وبكامل الخصوصية والأمان مع زملائك.',
    'story.sec_title': 'حماية وعزل كامل للبيانات',
    'story.sec_desc': 'يتم تشفير القصة محلياً داخل جهازك وآمنة 100% ضد أي اختراقات خارجية.',
    'story.option1_label': 'الخيار الأول: تحميل صورة من جهازك',
    'story.option1_placeholder': 'أو الصق رابط صورة مباشر...',
    'story.option1_btn': 'اختر صورة',
    'story.option2_label': 'الخيار الثاني: قصة نصية بتصاميم هندسية',
    'story.option2_placeholder': 'اكتب فكرة هندسية، تحذير تخصصي، أو مقولة تلهم زملائك...',
    'story.option2_theme': 'اختر نمط الخلفية الهندسية:',
    'story.theme_teal': 'تيل مهندسين',
    'story.theme_blue': 'أزرق سيبراني',
    'story.theme_orange': 'برتقالي تحكم',
    'story.theme_green': 'بيئة مستدامة',
    'story.preview': 'معاينة القصة المباشرة:',
    'story.btn_cancel': 'إلغاء ليفي',
    'story.btn_publish': 'تأمين ونشر القصة'
  },
  en: {
    // Nav & Layout
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.reels': 'Engineering Reels',
    'nav.search': 'Search',
    'nav.notifications': 'Notifications',
    'nav.messages': 'Messages',
    'nav.channels': 'Engineering Channels',
    'nav.create': 'New Post',
    'nav.profile': 'Profile',
    'nav.admin': 'Security Admin Dashboard',
    'nav.logout': 'Logout',
    'nav.subheading': 'Arab Engineers Community',
    'nav.platform_eng': 'Platform Engineering',
    'nav.developed_by': 'Developed by Eng. Ali Saifuddin Haider Al-Nawfal 2023',

    // Authentication Page
    'auth.welcome': 'Welcome to ChemicalEngineersHub',
    'auth.description': 'The largest social network and communications ecosystem tailored for Arab engineers across all disciplines. Share engineering updates & code projects now!',
    'auth.feature1_title': 'Secure Professional Workspace',
    'auth.feature1_desc': 'An interactive network entirely dedicated to Arab engineers, technical schemas, and structural proposals.',
    'auth.feature2_title': 'Blueprints & Practical Solutions',
    'auth.feature2_desc': 'Explore and publish CAD layouts, mechanical models, chemical formulas, and technology projects.',
    'auth.feature3_title': 'Audio rooms & Video Reels',
    'auth.feature3_desc': 'Connect in real-time with colleagues via localized audio sessions, daily reels, and end-to-end encrypted chats.',
    'auth.login_title': 'Sign in to Secure Engineering Workspace',
    'auth.username_or_email': 'Username or Email Address',
    'auth.password': 'Personal Account Password',
    'auth.security_notice': '✔️ Direct messages, login details, and passwords are fully end-to-end encrypted for absolute metadata privacy.',
    'auth.login_btn': 'Access Secure Network',
    'auth.or_register': 'Or register a new engineer account',
    'auth.fullname': 'Full Name',
    'auth.username': 'Username',
    'auth.email': 'Email Address',
    'auth.engineering_field': 'Engineering Specialization',
    'auth.register_notice': '* Select your primary scientific field to ease searchability for junior colleagues and recruiters.',
    'auth.register_btn': 'Submit Registration Now',
    'auth.2fa_title': '📲 2-Factor Authentication Verifier (2FA OTP)',
    'auth.2fa_desc': '2-Factor MFA protection detected on this account. Enter the extra passcode retrieved from your authorized device or validator app.',
    'auth.simulated_otp': 'Simulated OTP Token Code:',
    'auth.enter_otp': 'Enter 6-digit Security Pin',
    'auth.confirm_2fa': 'Confirm & Unlock Account',
    'auth.cancel': 'Cancel',

    // Stories, Feed & Post items
    'feed.stories_title': 'Daily Stories',
    'feed.add_story': 'Your Story',
    'feed.suggestions_title': 'Recommended Engineers',
    'feed.follow': 'Follow',
    'feed.following': 'Following',
    'feed.no_posts': 'No engineering posts published yet.',
    'feed.likes': 'Like',
    'feed.comments': 'Comment',
    'feed.saves': 'Save',
    'feed.delete_post': 'Delete Post',
    'feed.write_comment': 'Add a technical comment...',
    'feed.send': 'Send',
    'feed.view_more_comments': 'View all comments',

    // Create Post Page
    'create.title': 'Publish New Project or Blueprint Update',
    'create.caption_placeholder': 'Describe your design, code repository, CAD blueprints, or pipeline logs. Detail the specialized software used...',
    'create.location': 'Project Geographical Location',
    'create.media_urls': 'Media Image or Schema link URLs (separated by comma)',
    'create.post_type': 'Publishing Format',
    'create.type_post': 'Social Feed Post',
    'create.type_reel': 'Video/Image Reel Component',
    'create.publish_btn': 'Authorize & Deploy Post',
    'create.desc': 'Share structural diagrams, control logic, or educational seminars. Your ideas reach thousands of Arab engineers simultaneously.',

    // Explore / Reels Pages
    'explore.title': 'Explore Technological & Engineering Artifacts',
    'explore.subtitle': 'Browse recent blueprints, software codebases, and physical structures uploaded by members.',
    'reels.title': 'Engineering Reels & Worksite Loops',
    'reels.subtitle': 'Brief tech lectures, microcontroller circuits, site operations, and process control simulations.',

    // Search Page
    'search.title': 'Comprehensive Advanced Search Engine',
    'search.subtitle': 'Locate engineers and tech experts by major specialization, software skills list, or professional availability.',
    'search.input_placeholder': 'Search by full name, major, skills, keywords...',
    'search.hide_filters': '⚙️ Hide Advanced Filters ▲',
    'search.show_filters': '⚙️ Show Advanced Filters ▼',
    'search.reset_btn': 'Reset Search & Filters ✕',
    'search.label_field': 'Scientific Major / Department',
    'search.label_status': 'Professional Availability & Status',
    'search.label_skill': 'Filter by Technical Skill or Software Name',
    'search.skill_placeholder': 'Type a software skill, e.g., Revit, React, AutoCAD, SolidWorks...',
    'search.popular_skills': 'Trending Engineering Skills Quick Filter:',
    'search.all_fields': 'All Majors & Specializations',
    'search.all_statuses': 'All Professional Statuses',
    'search.tab_engineers': 'Engineers',
    'search.tab_posts': 'Posts',
    'search.tab_channels': 'Channels',
    'search.no_results_users': 'No engineers match the current search filters.',
    'search.no_results_posts': 'No published posts fit your query criteria.',
    'search.no_results_channels': 'No channels correspond to these search terms.',
    'search.members': 'engineers',
    'search.prompt_filters': 'Define Search Parameters or Start Typing',
    'search.prompt_desc': 'Filter by major scientific department, hiring availability status, or browse technical competencies instantly.',

    // Messages Page
    'messages.title': 'Private Encrypted Chat Ecosystem',
    'messages.select_dialog': 'Select a colleague to start a secure, isolated conversation. Share schematics, PDF bills, and coordinate directly.',
    'messages.search_users': 'Find engineers by username...',
    'messages.online': 'Connected Now',
    'messages.offline': 'Active Recently',
    'messages.msg_placeholder': 'Write an SHA-256 encrypted direct message...',
    'messages.security_disclaimer': '🔒 Messages are protected by client-side browser isolation and won\'t be logged directly on our central database nodes.',

    // Channels Page
    'channels.title': 'Thematic Guilds & Specialization Forums',
    'channels.subtitle': 'Join your department\'s channel to exchange graduation project ideas, e-books, code clips, and schematics.',
    'channels.joined': 'Member of Channel',
    'channels.join': 'Join Guild Channel',
    'channels.not_member': 'You must join this guild before you are authorized to send or read history feeds with your colleagues.',
    'channels.members_suffix': 'engineers in depth',

    // Profile Page
    'profile.edit_btn': 'Edit Profile & Privacy Settings',
    'profile.follow_requested': 'Follow Requested ⏳',
    'profile.follow_accept': 'Accept Request ✅',
    'profile.follow_decline': 'Decline ✕',
    'profile.followers': 'followers',
    'profile.following_label': 'following',
    'profile.posts_label': 'posts',
    'profile.posts_tab': 'Engineering Artifacts',
    'profile.saved_tab': 'Bookmarked Items',
    'profile.private_title': '🔒 This is a closed private account',
    'profile.private_desc': 'You must send a peer following request and be approved to review this engineer\'s schematics, posts, and details.',
    'profile.unfollow_dialog': 'Unfollow User',
    'profile.block_user': 'Block User Profile',
    'profile.unblock_user': 'Unblock Profile',

    // Edit Profile Page / Settings
    'settings.title_banner': 'CONTROL CENTER & SECURITY COCKPIT',
    'settings.title': 'Account Settings & Privacy Control',
    'settings.subtitle': 'Analyze device telemetry, toggle 2-Factor auth (2FA), govern blocks lists, protect from brute force, and configure UI language.',
    'settings.back_btn': 'Back to Profile',
    'settings.success_save': '✓ Your professional telemetry details have been updated and saved securely to active memory.',
    'settings.tab_profile': 'Profile & Appearance',
    'settings.tab_security': 'Security & Intrusion Defender',
    'settings.tab_privacy': 'Privacy & Access Authorization',
    'settings.avatar_label': 'Profile Avatar Picture',
    'settings.avatar_placeholder': 'Enter avatar image raw link URL...',
    'settings.avatar_upload': 'Upload File',
    'settings.avatar_help': 'Provide a direct image URL or upload a photo directly from your smartphone or workstation disk.',
    'settings.fullname_label': 'Full Name & Scientific Prefix',
    'settings.field_label': 'Official Engineering Specialization',
    'settings.status_label': 'Hiring Availability Status (visible next to your comments and profile card)',
    'settings.skills_label': 'Technical and Software Skills (comma-separated)',
    'settings.skills_placeholder': 'e.g., React, AutoCAD, Python, Revit, SolidWorks',
    'settings.skills_help': 'These keywords enable colleagues, PMs, and recruiters to discover your skills in advanced lookup searches.',
    'settings.bio_label': 'Professional Bio & Slogan',
    'settings.bio_placeholder': 'Briefly write about your projects, current role, previous building sites, or coding competencies...',
    'settings.website_label': 'Website Link / Digital Portfolio',
    'settings.location_label': 'Residency Country & Work City',
    'settings.save_btn': 'Save Core Telemetry Details',
    'settings.lang_heading': 'User Interface Language & Direction',
    'settings.lang_label': 'Choose system language (applies immediately and persists to local client storage):',
    'settings.lang_ar': '🇸🇦 العربية (Arabic - RTL)',
    'settings.lang_en': '🇺🇸 English (English - LTR)',
    'settings.lang_notice': 'Modifying the lang choice automatically adapts page layouts, text direction alignments (rtl/ltr), and navigation structures to match pristine design disciplines.',

    // Edit Profile Page / Security Tab
    'settings.sec_2fa_status_active': 'SECURED & SHIELDED',
    'settings.sec_2fa_status_inactive': 'MEDIUM SHIELD - RECOMMENDED',
    'settings.sec_2fa_title': 'Two-Factor Authentication (MFA 2FA)',
    'settings.sec_2fa_desc': 'The strongest firewall for your digital profile. Once key is active, should someone compromise your password, they are blocked without entering the dynamic passcode sent to your authorized client app.',
    'settings.sec_2fa_toggle': 'Enable 2-Factor Authentication:',
    'settings.sec_2fa_active_notice': '📢 Two-factor authentication is now active. When connecting from new instances, we will simulate your OTP token on the login view for secure testing.',
    'settings.sec_pw_title': 'Periodic Password Modification',
    'settings.sec_pw_success': 'Password compiled and changed successfully under SHA-256 salt hashes!',
    'settings.sec_pw_error_required': 'Current and new password entries are required.',
    'settings.sec_pw_current': 'Current Account Password',
    'settings.sec_pw_new': 'New Proposed Password',
    'settings.sec_pw_help': 'The platform suggests a complex combination of symbols, numbers, and capital characters.',
    'settings.sec_pw_update_btn': 'Update Login Password Token',
    'settings.sec_rate_title': 'Brute Force Prevention & API Controls',
    'settings.sec_rate_active': 'Rate Limiter active',
    'settings.sec_rate_limit': 'Maximum Login Limit:',
    'settings.sec_rate_limit_value': '3 failed keys / 30 seconds',
    'settings.sec_rate_registered': 'Failed Keys Counted:',
    'settings.sec_rate_status': 'IP Gateway Protection status:',
    'settings.sec_rate_status_locked': 'LOCKED AND BLACKLISTED FOR {time} SECS 🚫',
    'settings.sec_rate_status_active': 'Secure, Active & Monitoring ID ✓',
    'settings.sec_rate_help': 'Network servers monitor and disconnect clients trying multiple sequence keys to breach user profiles via automated scrapers (Brute-Force Attack Defender).',
    'settings.sec_brute_test_btn': 'Simulate Brute-force Intrusion Telemetry',
    'settings.sec_sessions_title': 'Login Footprint & Active Client Sessions',
    'settings.sec_sessions_desc': 'Review and audit every machine terminal accessing your engineering identity database.',
    'settings.sec_sessions_terminate_all': 'Revoke All Alternate Devices Sessions',
    'settings.sec_sessions_current': 'Active Instance',
    'settings.sec_sessions_terminate': 'Revoke Authorization',
    'settings.sec_sessions_none': 'No other sessions registered currently.',
    'settings.sec_logs_title': 'Security Audit Trail & Telemetry Monitor',
    'settings.sec_logs_desc': 'Audit log entries capturing state mutations, private key logins, and authorization steps to prevent digital espionage.',
    'settings.sec_logs_action': 'Action Block / Telemetry Event',
    'settings.sec_logs_device': 'Client Machine',
    'settings.sec_logs_ip': 'Gateway IP Address',
    'settings.sec_logs_time': 'Time Logging (UTC)',
    'settings.sec_logs_status': 'Status ID Code',
    'settings.sec_logs_none': 'No active logs compiled in current session.',

    // Edit Profile Page / Privacy Tab
    'settings.priv_account_label': 'Visibility Boundaries (Private Profile)',
    'settings.priv_account_desc': 'When checked, only colleagues whose follow requests you explicitly approve can track your project plans or reels updates.',
    'settings.priv_status_label': 'Invisible Browsing status (Stealth Mode)',
    'settings.priv_status_desc': 'Traverse chatrooms, check schemas, and participate in thematic channels without flashing a green "Connected" presence indicator.',
    'settings.priv_msg_label': 'Designate who is Authorized to Direct-Message You',
    'settings.priv_msg_desc': 'Block unwanted solicitations, bot campaigns, or unrecognized telemetry requests.',
    'settings.priv_msg_all': 'Everyone (unbounded capability)',
    'settings.priv_msg_followers': 'Engineers I follow back only',
    'settings.priv_msg_none': 'Revoke direct mailbox functions entirely',
    'settings.priv_users_panel_title': 'Colleague Restrictions & Access Control',
    'settings.priv_users_panel_desc': 'Configure peer communication boundaries. Block, mute feed updates, or restrict access for individual members.',
    'settings.priv_status_blocked': 'Blocked',
    'settings.priv_status_muted': 'Muted',
    'settings.priv_status_restricted': 'Restricted',
    'settings.priv_action_unblock': 'Unblock Profile',
    'settings.priv_action_block': 'Block User (Restrict TCP)',
    'settings.priv_action_unmute': 'Unmute Feed',
    'settings.priv_action_mute': 'Mute updates',
    'settings.priv_action_unrestrict': 'Unrestrict Profile',
    'settings.priv_action_restrict': 'Restrict Connection',

    // Feed sidebar sugestions
    'feed.switch_identity': 'Quick account switcher for sandbox testing 🔄:',
    'feed.active_badge': 'Active Now',
    'feed.inactive_badge': 'Stealth',
    'feed.about': 'About',
    'feed.skills_match': 'Aligned technical credentials:',
    
    // Notifications page
    'notif.title': 'Events, Request Inboxes, & Alerts Center',
    'notif.empty': 'Your newsfeed inbox is silent. No recent engineering requests recorded.',
    'notif.read_all_btn': 'Mark All as Read ✓',
    'notif.request_title': 'Pending Peer Follow Requests',
    'notif.type_like': 'liked your structural project or blueprint',
    'notif.type_comment': 'commented on your project updates:',
    'notif.type_mention': 'referenced your study model in a layout',
    'notif.type_follow': 'started following your engineers updates feed',
    'notif.type_request': 'submitted a private profile clearance request',
    'notif.type_joined': 'joined your specialized project channel',
    
    // Story form Inside feed modal
    'story.form_title': 'Publish New Engineering Story',
    'story.form_desc': 'Share short blueprints, technical quotes, or advice anonymously or directly.',
    'story.sec_title': 'Isolated Device Encryption',
    'story.sec_desc': 'Your stories are encrypted first at client nodes, ensuring robust protection against server leaks.',
    'story.option1_label': 'Method 1: Upload visual photo from disk',
    'story.option1_placeholder': 'Or paste a direct image URL link...',
    'story.option1_btn': 'Choose File',
    'story.option2_label': 'Method 2: Typographic Blueprint Canvas slide',
    'story.option2_placeholder': 'Share a CAD technique, coding tip, or calculation quote...',
    'story.option2_theme': 'Select Canvas Grid style:',
    'story.theme_teal': 'Teal Blueprint',
    'story.theme_blue': 'Cybernetic Blue',
    'story.theme_orange': 'Industrial Orange',
    'story.theme_green': 'Sustainable Green',
    'story.preview': 'Canvas Real-time Preview:',
    'story.btn_cancel': 'Discard Slide',
    'story.btn_publish': 'Deploy Stories Slide'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const saved = localStorage.getItem('engineerhub_language');
    return (saved === 'en' || saved === 'ar') ? saved as LanguageType : 'ar';
  });

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem('engineerhub_language', lang);
  };

  useEffect(() => {
    // Sync browser html tag attributes and direction
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const section = translations[language];
    if (section && section[key]) {
      return section[key];
    }
    // Fallback search to Arabic, then fallback string
    const fallbackSection = translations['ar'];
    if (fallbackSection && fallbackSection[key]) {
      return fallbackSection[key];
    }
    return key;
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      <div className={isRtl ? 'rtl text-right font-sans' : 'ltr text-left font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
