const sast_warnings = {
  parsing_error: "حدث خطأ أثناء تحليل كود JavaScript باستخدام meriyah. هذا يعني أن عملية تحويل النص إلى شجرة بناء الجملة المجردة (AST) قد فشلت. إذا واجهت هذا الخطأ، يرجى فتح بلاغ (issue) هنا.",
  unsafe_import: "تعذر تتبع عبارة استيراد (require, require.resolve).",
  unsafe_regex: "تم اكتشاف تعبير نمطي (RegEx) غير آمن، مما قد يؤدي إلى هجوم ReDoS.",
  unsafe_stmt: "استخدام عبارات خطيرة مثل eval() أو Function(\"\").",
  unsafe_assign: "إسناد قيمة لمتغير عالمي محمي مثل process أو require.",
  encoded_literal: "تم اكتشاف قيمة نصية مشفرة (قد تكون قيمة سداسية عشرية، أو تسلسل يونيكود، أو نص Base64، إلخ).",
  suspicious_file: "ملف مشبوه يحتوي على أكثر من عشر قيم نصية مشفرة.",
  short_identifiers: "هذا يعني أن متوسط طول المعرفات أقل من 1.5 حرف. يظهر هذا التنبيه فقط إذا كان الملف يحتوي على أكثر من 5 معرفات.",
  suspicious_literal: "هذا يعني أن مجموع نقاط الاشتباه لجميع القيم نصية أكبر من 3.",
  obfuscated_code: "هناك احتمالية عالية جداً بأن الكود مخفي أو معقد (obfuscated)...",
  weak_crypto: "يحتوي الكود على خوارزمية تشفير ضعيفة (md5, sha1...).",
  shady_link: "تحتوي القيمة النصية على رابط (URL) لنطاق بامتداد مشبوه.",
  zero_semver: "نسخة (Semantic Version) تبدأ بـ 0.x (مشروع غير مستقر أو بدون إصدارات رسمية).",
  empty_package: "حزمة tarball تحتوي فقط على ملف package.json.",
  unsafe_command: "استخدام أوامر مشبوهة في child_process مثل spawn() أو exec().",
  serialize_environment: "يحاول الكود إجراء عملية تسلسل (serialize) لـ process.env، مما قد يؤدي إلى تسريب متغيرات البيئة.",
  synchronous_io: "يحتوي الكود على عمليات إدخال/إخراج متزامنة (Synchronous I/O)، مما قد يؤدي إلى حظر (block) حلقة الأحداث (event loop) وتدهور الأداء.",
  data_exfiltration: "يكتشف عمليات تسلسل لمعلومات النظام الحساسة (os.userInfo, os.networkInterfaces, os.cpus, dns.getServers)، مما قد يشير إلى جمع بيانات غير مصرح به للنقل الخارجي.",
  log_usage: "استخدام طرق تسجيل console (log, info, warn, error, debug) التي قد تكشف عن معلومات حساسة في بيئات الإنتاج.",
  sql_injection: "قالب نصي (Template literal) يحتوي على تعبيرات مدرجة في استعلامات SQL (SELECT, INSERT, UPDATE, DELETE) بدون معالجة صحيحة، مما يخلق ثغرات حقن SQL محتملة.",
  monkey_patch: "تعديل النماذج الأصلية (native prototypes) أو الكائنات العالمية في وقت التشغيل، مما يؤدي إلى مخاطر أمنية تشمل اختطاف التدفق، والآثار الجانبية العالمية، والإخفاء المحتمل للأنشطة الضارة.",
  insecure_random: "استخدام توليد أرقام عشوائية غير آمن باستخدام Math.random(). إن Math.random() ليس آمناً من الناحية التشفيرية ولا ينبغي استخدامه للعمليات الحساسة أمنياً."
};

export default {
  sast_warnings
}
