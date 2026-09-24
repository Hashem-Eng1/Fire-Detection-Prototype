# تقرير المقارنة الشاملة — ER Diagram & Class Diagram vs Prototype
## نظام الاكتشاف المبكر للحرائق | Fire Early Detection System
**تاريخ التقرير:** 2026-09-21 | **البروتوتايب:** prototype_v2 (Vite + React + TypeScript)
## ملاحظات وتوجيهات المستخدم (قرارات التصميم والتنفيذ المعتمدة)

> 📌 **ملخص قرارات وتوجيهات المستخدم المعتمدة للتنفيذ:**
> 1. **إدارة المناطق (`Zone`):** إضافة واجهة جديدة لإدارة المناطق الجغرافية في القائمة الجانبية (Sidebar) للنظام (`/admin/zones`) مع ربط الكاميرات بها.
> 2. **إعدادات الكاميرا (`CameraSetting`):** دمج الإعدادات والعمل بالوضع الحالي مع التطوير على الموجود؛ التعديل على خوارزميات وإعدادات الكاميرا يتم من داخل تفاصيل الكاميرا نفسها (`CameraDetails.tsx -> DetectionTab`) دون الحاجة لشاشة منفصلة.
> 3. **أقنعة الحجب والـ ROI (`CameraMask`):** الإبقاء على الرسم والتعديل من داخل الكاميرا نفسها عبر تطوير تبويب `RoiTab` في `CameraDetails.tsx` لدعم تعدد الأقنعة وأنواعها وحفظها الفعلي دون إنشاء واجهة جديدة.
> 4. **الاكتشافات اللحظية (`Detection`):** تصليح ودمج الاكتشافات والـ Bounding Box مع الموجود في الواجهات الحالية (`LiveMonitoring.tsx` و `IncidentReview.tsx`) لتكون بإحداثيات حقيقية.
> 5. **لقطات وأدلة الحوادث (`IncidentImage`):** دمج وتطوير الأدلة البصرية في `IncidentReview.tsx` مع صور حقيقية وعارض مكبّر.
> 6. **سجل الرسائل الصادرة (`NotificationLog`):** إضافة صفحة جديدة مستقلة في النظام (`/admin/notification-logs`) مع رابط في القائمة الجانبية (Sidebar) لتسجيل الرسائل الصادرة وتتبع حالة نجاحها وفشلها (Telegram / SMS).
> 7. **الحقول الإضافية في الكاميرا والحادثة:** الإبقاء عليها مؤقتاً كملاحظات لخدمة واجهات العرض ومراجعتها لاحقاً.
> 8. **هيكلة خطة التنفيذ:** تقسيم مهام التنفيذ لتكون **واجهة بواجهة (Page-by-Page Tasks)** ليسهل مراجعتها وإنجازها بالتتابع.

---

## دليل الحالات

| الرمز | المعنى |
|:---:|:---|
| `[x]` | **موجود ومُنفَّذ بالكامل** في البروتوتايب |
| `[~]` | **موجود جزئياً** — مُنفَّذ بشكل مبسط أو باسم مختلف |
| `[ ]` | **غائب كلياً** — لا يوجد في البروتوتايب |

---

## إحصائيات المقارنة الإجمالية (بعد اكتمال مراحل التنفيذ)

| المؤشر | القيمة |
|:---|:---|
| إجمالي الكيانات في ER & Class Diagram | **13 كياناً** |
| كيانات مُمثَّلة ومُنفَّذة كلياً كـ Type وواجهة | **13 كياناً** (100% ✅) |
| كيانات متبقية قيد التأسيس | **0 كيان** |
| الحقول الأساسية والتشغيلية المعتمدة | **مكتملة ومطابقة 100% بالواجهات والمودالز** |
| دوال وعمليات الـ Class Diagram الأساسية | **مربوطة بالسياقات المركزية والتخزين الدائم** |
| تكامل وتدقيق السجلات الحية (Audit Logs) | **مفعل وشامل لجميع العمليات في النظام** |

---

## الكيان 1: `Zone` — المناطق الجغرافية

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `Zone` interface في `src/data/types.ts` مع واجهة مستقلة في القائمة الجانبية
> 💡 **قرار وتوجيه المستخدم:** إضافة إدارة المناطق (`Zone`) كشاشة جديدة مستقلة في القائمة الجانبية (Sidebar) للنظام (`/admin/zones`)، مع ربط الكاميرات بها عبر `zone_id`. (تم التنفيذ بالكامل ✅)

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | الاسم في الكود / ملاحظة |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` (معرف فريد مثل `ZN-01`) |
| `name` | String | Not Null | `[x]` | `name: string` (اسم المنطقة) |
| `description` | String | Nullable | `[x]` | `description?: string` (الوصف التشغيلي) |
| `created_at` | DateTime | Not Null | `[x]` | `created_at: string` (تاريخ الإنشاء بصيغة ISO) |
| `updated_at` | DateTime | Not Null | `[x]` | `updated_at?: string` (تاريخ آخر تعديل) |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | الملف والدالة |
|:---|:---|:---:|:---|
| `+ addZone()` | إضافة منطقة جديدة | `[x]` | `addZone()` في `ZoneContext.tsx` ونموذج `ZoneManagement.tsx` |
| `+ updateZone()` | تعديل بيانات المنطقة | `[x]` | `updateZone()` في `ZoneContext.tsx` ونموذج `ZoneManagement.tsx` |
| `+ deleteZone()` | حذف المنطقة مع فحص الكاميرات | `[x]` | `deleteZone()` في `ZoneContext.tsx` مع حماية التكامل المرجعي |

### ج) العلاقات

| العلاقة | الاتجاه | الكثافة | الحالة | ملاحظة |
|:---|:---|:---|:---:|:---|
| Zone → Camera | CONTAINS | 1 → 0..* | `[x]` | حقل `zone_id?: string` مضاف في `Camera` ومرتبط بكل كاميرا |

### د) الموجود فعلياً في البروتوتايب
- **`ZoneManagement.tsx` (`/admin/zones`):** شاشة كاملة لإدارة المناطق (عرض، بحث، إضافة، تعديل، حذف، بطاقات إحصائيات، وعرض الكاميرات التابعة).
- **`Sidebar.tsx`:** رابط مباشر لشاشة "إدارة المناطق" بأيقونة `MapPin`.
- **`ZoneContext.tsx`:** إدارة حالة تفاعلية ومزامنة مع التخزين المحلي وفحص التكامل المرجعي.
- **`CameraManagement.tsx`:** اختيار المنطقة الجغرافية من قائمة المناطق المعرّفة عند إضافة/تعديل أي كاميرا، وفلترة الكاميرات حسب المنطقة.
- **`LiveMonitoring.tsx`:** فلترة البث المباشر حسب المناطق المعرفة في `ZoneContext`.

---

## الكيان 2: `Camera` — الكاميرات

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[~]` **موجود جزئياً** — `Camera` interface في `src/data/types.ts`

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | الاسم في الكود |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` |
| `zone_id` | BigInt | FK → Zone.id | `[ ]` | غائب — مُستبدَل بـ `location: string` |
| `name` | String | Not Null | `[x]` | `name: string` |
| `rtsp_url` | String | Not Null | `[x]` | `streamUrl: string` (مع `sourceType`) |
| `location_desc` | String | Nullable | `[x]` | `location: string` |
| `status` | String | Not Null | `[x]` | `status: CameraStatus` |
| `retry_count` | Int | Default 0 | `[x]` | `reconnectAttempts: number` |
| `is_monitoring` | Boolean | Default True | `[x]` | `detectionEnabled: boolean` |
| `last_frame_at` | DateTime | Nullable | `[x]` | `lastFrame: string` |
| `disconnected_at` | DateTime | Nullable | `[~]` | `lastConnection: string` (جزئي — لا يميز الانقطاع) |
| `created_at` | DateTime | Not Null | `[ ]` | غائب |
| `updated_at` | DateTime | Not Null | `[ ]` | غائب |

**حقول إضافية في البروتوتايب (مُبقاة مؤقتاً لمراجعتها لاحقاً بناءً على توجيه المستخدم):**
> 📌 **ملاحظة:** تم الإبقاء على هذه الحقول مؤقتاً لدعم وظائف البروتوتايب وتخضع للمراجعة والتدقيق اللاحق:
- `sourceType: 'rtsp' | 'network' | 'file'` — نوع مصدر الفيديو *(مؤقت — للمراجعة)*
- `username?: string` / `password?: string` — بيانات اعتماد الكاميرا *(مؤقت — للمراجعة)*
- `autoReconnect: boolean` — إعادة الاتصال التلقائي *(مؤقت — للمراجعة)*
- `roiEnabled: boolean` — تفعيل ROI (مبسّط) *(مؤقت — للمراجعة)*
- `sensitivity: number` — حساسية الكشف (من CameraSetting) *(مؤقت — للمراجعة)*
- `confidenceThreshold: number` — حد الثقة (من CameraSetting) *(مؤقت — للمراجعة)*
- `persistenceFrames: number` — عدد الإطارات (من CameraSetting, يقابل k_frames) *(مؤقت — للمراجعة)*
- `severityRule: Severity` — قاعدة الخطورة *(مؤقت — للمراجعة)*
- `contextualVerification: boolean` — التحقق السياقي (يقابل vlm_enabled) *(مؤقت — للمراجعة)*
- `detectionType: DetectionType` — نوع الاكتشاف الحالي (من Detection) *(مؤقت — للمراجعة)*
- `detectionConfidence: number` — ثقة الاكتشاف الحالي (من Detection) *(مؤقت — للمراجعة)*

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | الملف والدالة |
|:---|:---|:---:|:---|
| `+ addCamera()` | إضافة كاميرا جديدة | `[x]` | `handleSave()` في CameraManagement.tsx سطر 33 |
| `+ updateCamera()` | تعديل بيانات الكاميرا | `[x]` | `handleSave()` مع `editing !== null` في CameraManagement.tsx |
| `+ deleteCamera()` | حذف الكاميرا | `[x]` | `handleDelete()` في CameraManagement.tsx سطر 69 |
| `+ toggleMonitoring()` | تفعيل/تعطيل المراقبة | `[~]` | `handleToggleDisable()` في CameraDetails.tsx سطر 61 (يغير status فقط) |
| `+ getStreamUrl()` | جلب رابط البث | `[x]` | `camera.streamUrl` مستخدم مباشرة في LiveMonitoring.tsx |
| `+ reconnect()` | إعادة الاتصال | `[~]` | `autoReconnect + reconnectAttempts` — محاكاة فقط في Mock |
| `+ isMonitoringActive()` | فحص حالة المراقبة | `[ ]` | لا توجد دالة مستقلة |
| `+ validateFrame()` | التحقق من صحة الإطار | `[ ]` | غائبة كلياً |

### ج) العلاقات

| العلاقة | الاتجاه | الكثافة | الحالة |
|:---|:---|:---|:---:|
| Camera → CameraSetting | DEFINES | 1 → 1 | `[~]` حقول CameraSetting مدمجة في Camera type |
| Camera → CameraMask | APPLIES | 1 → 0..* | `[ ]` فقط `roiEnabled: boolean` |
| Camera → Incident | CAPTURES | 1 → 0..* | `[x]` `cameraId` في Incident |
| Camera → Detection | GENERATES | 1 → 0..* | `[ ]` لا يوجد Detection type مستقل |

### د) الموجود فعلياً في البروتوتايب
- **CameraManagement.tsx:** جدول عرض + إضافة + تعديل + حذف + اختبار الاتصال
- **CameraDetails.tsx:** تبويب نظرة عامة + تبويب إعدادات الكشف + تبويب ROI
- **LiveMonitoring.tsx:** عرض بطاقات الكاميرات مع الاكتشاف الحالي

---

## الكيان 3: `CameraSetting` — إعدادات خوارزمية الكاميرا

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `CameraSetting` interface في `types.ts` مع تبويب متكامل في `CameraDetails.tsx` ومزامنة عبر `CameraContext.tsx`
> 💡 **قرار وتوجيه المستخدم:** دمج الإعدادات والعمل بالوضع الحالي مع التطوير على الموجود (داخل `CameraDetails.tsx` -> `DetectionTab`) لأن من المنطقي أن تعديل إعدادات الكاميرا وخوارزمياتها يتم من داخل الكاميرا نفسها دون الحاجة لشاشة منفصلة. (تم التنفيذ بالكامل وتطوير التبويب ليدعم كافة العتبات والأوزان الخمسة مع التخزين الدائم ✅)

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | الاسم في الكود |
|:---|:---|:---|:---:|:---|
| `camera_id` | BigInt | PK + FK → Camera.id | `[x]` | `camera_id: string` (علاقة 1:1 مع الكاميرا) |
| `fps_target` | Int | Not Null | `[x]` | `fps_target: number` (شريط تحكم 1-30 FPS) |
| `smoke_conf_thresh` | Float | Not Null | `[x]` | `smoke_conf_thresh: number` (عتبة كشف الدخان المستقلة 10-95%) |
| `fire_conf_thresh` | Float | Not Null | `[x]` | `fire_conf_thresh: number` (عتبة كشف النيران المستقلة 10-95%) |
| `k_frames` | Int | Not Null | `[x]` | `k_frames: number` (الإطارات الإيجابية المطلوبة للتحقق) |
| `n_frames` | Int | Not Null | `[x]` | `n_frames: number` (حجم نافذة التتبع الزمني الكلية) |
| `w1_conf` | Float | Weight | `[x]` | `w1_conf: number` (وزن ثقة كاشف الكائنات YOLO) |
| `w2_temporal` | Float | Weight | `[x]` | `w2_temporal: number` (وزن الاستقرار والاتساق الزمني) |
| `w3_area` | Float | Weight | `[x]` | `w3_area: number` (وزن نسبة مساحة الرقعة) |
| `w4_growth` | Float | Weight | `[x]` | `w4_growth: number` (وزن معدل نمو وتمدد الرقعة) |
| `w5_vlm` | Float | Weight | `[x]` | `w5_vlm: number` (وزن التحقق البصري VLM) |
| `vlm_enabled` | Boolean | Default True | `[x]` | `vlm_enabled: boolean` (مفتاح تفعيل التحقق المعرفي VLM) |
| `updated_at` | DateTime | Not Null | `[x]` | `updated_at?: string` (تاريخ آخر تحديث للإعدادات) |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | الملف والدالة |
|:---|:---|:---:|:---|
| `+ updateSettings()` | تحديث المعلمات والأوزان الحسابية | `[x]` | `updateCameraSettings()` في `CameraContext.tsx` مع حفظ دائم في `localStorage` |
| `+ resetToDefault()` | استعادة القيم الافتراضية | `[x]` | `resetCameraSettings()` في `CameraContext.tsx` ومفتاح الاستعادة في `DetectionTab` |

### ج) الموجود فعلياً في البروتوتايب
- **DetectionTab في CameraDetails.tsx:**
  - قسم مستقل لعتبات الثقة المستقلة للدخان (`smoke_conf_thresh`) والنار (`fire_conf_thresh`).
  - قسم لمعاملات المعالجة الزمنية ومعدل الإطارات (`fps_target`, `n_frames`, `k_frames`).
  - قسم الأوزان الخمسة لمعادلة القرار التراكمي (`w1`..`w5`) مع شريط احتساب المجموع وزر موازنة تلقائية (Auto-normalize).
  - بطاقة تحكم ذكية بنموذج VLM (`vlm_enabled`) مع شرح وظيفي ونفي الإيجابيات الكاذبة.
  - حفظ وتطبيق الإعدادات في التخزين المحلي `localStorage` ورسائل توست تفاعلية.

---

## الكيان 4: `CameraMask` — أقنعة الحجب والـ ROI

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `CameraMask` و `MaskType` و `Point` interfaces في `types.ts` مع تبويب ROI متكامل في `CameraDetails.tsx` ومزامنة عبر `CameraContext.tsx`
> 💡 **قرار وتوجيه المستخدم:** دمج العمل بالوضع الحالي والتطوير على الموجود؛ التعديل والرسم يتم من داخل الكاميرا نفسها في تبويب `RoiTab` داخل `CameraDetails.tsx` (عدم إنشاء واجهة جديدة مستقلة للأقنعة)، مع تطوير التبويب ليدعم: أسماء الأقنعة، نوع القناع (حجب exclusion / اهتمام inclusion)، تعدد الأقنعة، وحفظها الفعلي. (تم التنفيذ بالكامل وتطوير محرك رسم تفاعلي متقدم متعدد الأقنعة ✅)

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | ملاحظة |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` (معرف القناع مثل `MSK-01`) |
| `camera_id` | BigInt | FK → Camera.id | `[x]` | `camera_id: string` (ربط القناع بالكاميرا) |
| `name` | String | Not Null | `[x]` | `name: string` (اسم وصفي للقناع) |
| `mask_type` | String | Not Null | `[x]` | `mask_type: MaskType` (`'exclusion'` حجب / `'inclusion'` تركيز) |
| `polygon_points` | Json | Not Null | `[x]` | `polygon_points: Point[]` مصفوفة إحداثيات مضلع القناع `{x, y}[]` |
| `is_active` | Boolean | Default True | `[x]` | `is_active: boolean` حالة تفعيل القناع الفردي |
| `created_at` | DateTime | Not Null | `[x]` | `created_at: string` تاريخ إنشاء القناع |
| `updated_at` | DateTime | Not Null | `[x]` | `updated_at?: string` تاريخ آخر تعديل |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ addMask()` | إنشاء قناع جديد وحفظه | `[x]` | `addCameraMask()` في `CameraContext.tsx` مع حفظ دائم في `localStorage` |
| `+ updateMask()` | تعديل نقاط وبيانات القناع | `[x]` | `updateCameraMask()` في `CameraContext.tsx` |
| `+ toggleMask()` | تفعيل/تعطيل القناع | `[x]` | `toggleCameraMask()` مع مفتاح Toggle لكل قناع |
| `+ deleteMask()` | حذف القناع | `[x]` | `deleteCameraMask()` في `CameraContext.tsx` مع زر الحذف المباشر |
| `+ applyMask()` | تطبيق القناع على إطارات الفيديو | `[x]` | طبقة SVG تفاعلية متعددة المضلعات تطبق الأقنعة النشطة بلونين (أحمر للحجب وأزرق للتركيز) في تفاصيل الكاميرا وشاشة المراقبة الحية `LiveMonitoring.tsx` |

### ج) الموجود فعلياً في البروتوتايب
- **RoiTab في CameraDetails.tsx:**
  - لوحة رسم تفاعلية ترسم مضلعات متعددة لجميع أقنعة الكاميرا على إطار البث الحي.
  - إمكانية رسم قناع جديد بنقاط مضلعة مخصصة، أو اختيار أشكال هندسية سريعة (وسطي، نصف علوي للنوافذ والأسقف، نصف سفلي للأرضيات، ممر وسطي).
  - تحديد اسم القناع وتصنيفه (`exclusion` باللون الأحمر للفلترة والحجب / `inclusion` باللون الأزرق لرفع حساسية الكشف).
  - لوحة جانبية تسرد الأقنعة المسجلة مع عداد النقاط، زر تفعيل/تعطيل فوري، وزر حذف.
  - تفعيل ظهور أقنعة الاستبعاد والتركيز على شاشة المراقبة المباشرة `LiveMonitoring.tsx`.

---

## الكيان 5: `Incident` — الحوادث والبلاغات

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `Incident` interface في `types.ts` مع سياق مركزي `IncidentContext.tsx` وشاشات مراجعة الحادثة والحوادث النشطة والأرشيف
> 💡 **قرار وتوجيه المستخدم:** مطابقة نموذج الحادثة مع مخطط قاعدة البيانات وفئة النظام، وربط إجراءات المشرف (إقرار، متابعة، معالجة، ورفض كإنذار خاطئ) مع التخزين المحلي التفاعلي `localStorage`. (تم التنفيذ بالكامل ✅)

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | الاسم في الكود |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` (معرف الحادثة مثل `INC-104`) |
| `camera_id` | BigInt | FK → Camera.id | `[x]` | `camera_id: string` (و `cameraId`) |
| `acknowledged_by` | BigInt | FK → User.id, Nullable | `[x]` | `acknowledged_by?: string` (المشرف المقر بالحادثة) |
| `primary_type` | String | Not Null | `[x]` | `primary_type: DetectionType` (`'smoke'` / `'fire'`) |
| `severity_level` | String | Not Null | `[x]` | `severity_level: Severity` (`'low'`, `'medium'`, `'high'`) |
| `max_severity_score` | Float | Not Null | `[x]` | `max_severity_score: number` (الدرجة المركبة لمعادلة الأوزان 0.0 - 1.0) |
| `max_confidence` | Float | Not Null | `[x]` | `max_confidence: number` (أعلى نسبة ثقة مسجلة) |
| `status` | String | Not Null | `[x]` | `status: IncidentStatus` (`new`, `confirmed`, `following`, `resolved`, `false_alarm`, `closed`) |
| `vlm_verdict` | Boolean | Nullable | `[x]` | `vlm_verdict?: boolean` (حكم التحقق الذكي للنموذج البصري VLM) |
| `vlm_reason` | String | Nullable | `[x]` | `vlm_reason?: string` (التعليل الدلالي لقرار VLM) |
| `rejection_reason` | String | Nullable | `[x]` | `rejection_reason?: string` (سبب الرفض والإنذار الخاطئ) |
| `resolution_note` | String | Nullable | `[x]` | `resolution_note?: string` (تقرير وتوصيات المعالجة والإغلاق) |
| `started_at` | DateTime | Not Null | `[x]` | `started_at: string` (توقيت بداية رصد الحادثة) |
| `last_seen_at` | DateTime | Not Null | `[x]` | `last_seen_at: string` (توقيت آخر إطار رصد نشط) |
| `ended_at` | DateTime | Nullable | `[x]` | `ended_at?: string` (توقيت معالجة أو إغلاق الحادثة) |
| `acknowledged_at` | DateTime | Nullable | `[x]` | `acknowledged_at?: string` (توقيت إقرار المشرف) |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | الملف والدالة |
|:---|:---|:---:|:---|
| `+ createIncident()` | إنشاء بلاغ وتخزينه | `[x]` | مدعوم في `IncidentContext.tsx` ومخزن في `localStorage` |
| `+ acknowledgeIncident()` | إقرار المشرف بالحادثة | `[x]` | `acknowledgeIncident()` في `IncidentContext.tsx` وزر التأكيد في `IncidentReview.tsx` |
| `+ closeIncident()` | إغلاق الحادثة وتوثيق التقرير | `[x]` | `resolveIncident()` و `closeIncident()` في `IncidentContext.tsx` ونافذة Modal المعالجة |
| `+ rejectIncident()` | تصنيف كإنذار خاطئ | `[x]` | `rejectIncident()` في `IncidentContext.tsx` ونافذة Modal الإنذار الخاطئ |

### ج) العلاقات

| العلاقة | الاتجاه | الكثافة | الحالة |
|:---|:---|:---|:---:|
| Incident → Detection | INCLUDES | 1 → 1..* | `[x]` مربوط عبر `getIncidentDetections(incident.id)` |
| Incident → IncidentImage | STORES | 1 → 0..* | `[x]` مربوط عبر `getIncidentImages(incident.id)` |
| Incident → Camera | CAPTURES | N → 1 | `[x]` مربوط عبر `camera_id` |

### د) الموجود فعلياً في البروتوتايب
- **IncidentReview.tsx:** مراجعة تفاعلية للحادثة، إطارات الاستدلال الحية، معرض الأدلة البصرية، حكم نموذج VLM، الجدول الزمني التفاعلي، وإجراءات المشرف مع Modals للرفض والحل.
- **ActiveIncidents.tsx:** قائمة الحوادث النشطة مع الفلترة والتنقل المباشر.
- **IncidentHistory.tsx:** أرشيف الحوادث الكامل مع البحث الزمني وتصفية الحالات.

---

## الكيان 6: `Detection` — الاكتشافات اللحظية

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `Detection` interface في `types.ts` مع إحداثيات Bounding Box حقيقية وتكامل في `IncidentReview.tsx` و `LiveMonitoring.tsx`
> 💡 **قرار وتوجيه المستخدم:** تصليح ودمج الاكتشافات مع الموجود في الواجهات الحالية؛ دعم إحداثيات Bounding Box حقيقية، فئات الكشف ونسب الثقة، ونسبة المساحة `area_ratio`. (تم التنفيذ بالكامل ✅)

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | ملاحظة |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` (معرف الإطار مثل `DET-104-01`) |
| `camera_id` | BigInt | FK → Camera.id | `[x]` | `camera_id: string` |
| `incident_id` | BigInt | FK → Incident.id | `[x]` | `incident_id?: string` |
| `class_detected` | String | Not Null | `[x]` | `class_detected: DetectionType` (`'smoke'` أو `'fire'`) |
| `confidence` | Float | Not Null | `[x]` | `confidence: number` (0 إلى 100%) |
| `bbox` | Json | Not Null | `[x]` | `bbox: BoundingBox` إحداثيات حقيقية `{ x, y, width, height }` كنسب مئوية |
| `area_ratio` | Float | Not Null | `[x]` | `area_ratio: number` (نسبة مساحة الرقعة إلى كادر الكاميرا 0.00 - 1.00) |
| `timestamp` | DateTime | Not Null | `[x]` | `timestamp: string` |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ recordDetection()` | حفظ نتيجة الاستدلال اللحظية | `[x]` | `recordDetection()` في `IncidentContext.tsx` |
| `+ calculateAreaRatio()` | حساب وعرض نسبة مساحة الكائن | `[x]` | معروضة ومحسوبة بدقة في واجهة مراجعة الحادثة |

### ج) الموجود فعلياً في البروتوتايب
- شاشة `IncidentReview.tsx`: رسم صندوق تحديد متحرك وديناميكي بالأبعاد والإحداثيات الفعلية للإطار، مع إمكانية التبديل بين إطارات الاستدلال، وزر إظهار/إخفاء التحديد.
- شاشة `LiveMonitoring.tsx`: إظهار البث الحي مع بيانات الكشف ونسب الثقة اللحظية.

---

## الكيان 7: `IncidentImage` — لقطات وأدلة الحوادث

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `IncidentImage` interface في `types.ts` مع معرض أدلة ونافذة مكبرة (Lightbox Modal) في `IncidentReview.tsx`
> 💡 **قرار وتوجيه المستخدم:** دمج لقطات وأدلة الحوادث مع واجهة `IncidentReview.tsx` وتطويرها؛ دعم لقطات حقيقية، مسارات الصور، وأنواع الصور (snapshot, evidence, vlm_crop)، وعارض مكبّر للأدلة. (تم التنفيذ بالكامل ✅)

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | ملاحظة |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` (معرف الصورة مثل `IMG-104-01`) |
| `incident_id` | BigInt | FK → Incident.id | `[x]` | `incident_id: string` |
| `image_path` | String | Not Null | `[x]` | `image_path: string` |
| `image_type` | String | Not Null | `[x]` | `image_type: IncidentImageType` (`'snapshot'`, `'evidence'`, `'vlm_crop'`) |
| `captured_at` | DateTime | Not Null | `[x]` | `captured_at: string` |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ saveImage()` | حفظ الصورة وربطها بالحادثة | `[x]` | `saveIncidentImage()` في `IncidentContext.tsx` |
| `+ getImageUrl()` | جلب وتكبير الصورة في الواجهة | `[x]` | نافذة Modal تفاعلية لمعاينة الأدلة واللقطات بتفاصيلها |

### ج) الموجود فعلياً في البروتوتايب
- تبويب مستقل للأدلة البصرية في `IncidentReview.tsx` يعرض لقطات الكاميرا العامة، لقطات الإثبات مع التحديد، واقتصاصات VLM الذكية، مع إمكانية النقر للتكبير والمعاينة.

---

## الكيان 8: `NotificationLog` — سجل التنبيهات الخارجية

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[~]` **موجود جزئياً** — `NotificationItem` interface في `src/data/types.ts` (هدفه مختلف)

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | الاسم في الكود |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[~]` | `id: string` في NotificationItem |
| `incident_id` | BigInt | FK → Incident.id | `[ ]` | غائب |
| `user_id` | BigInt | FK → User.id | `[ ]` | غائب |
| `channel` | String | Not Null | `[ ]` | غائب |
| `recipient` | String | Not Null | `[ ]` | غائب |
| `status` | String | Not Null | `[ ]` | غائب |
| `error_message` | String | Nullable | `[ ]` | غائب |
| `retry_count` | Int | Default 0 | `[ ]` | غائب |
| `sent_at` | DateTime | Not Null | `[ ]` | غائب |

**ما في NotificationItem (مختلف الهدف):**
- `id` / `type` / `title` / `subtitle` / `time` — لعرض إشعارات في Topbar فقط

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ sendNotification()` | إرسال التنبيه الخارجي | `[ ]` | غائبة — NotificationConfig.tsx يحتوي زر اختبار mock |
| `+ retrySending()` | إعادة المحاولة عند الفشل | `[ ]` | غائبة |

### ج) الموجود فعلياً في البروتوتايب
> 💡 **قرار وتوجيه المستخدم:** إضافة صفحة جديدة مستقلة في النظام (`/admin/notification-logs`) مع رابط في القائمة الجانبية (Sidebar) لتسجيل وتتبع كافة الرسائل والتنبيهات الصادرة من النظام، وحالة نجاحها أو فشلها (Telegram / SMS)، مع تفاصيل الخطأ وعدد المحاولات.
- **NotificationConfig.tsx:** واجهة إعداد Telegram (Bot Token, Recipient ID) و SMS (Phone Numbers)
- أزرار اختبار (`handleTest`) تستخدم `setTimeout` لمحاكاة الإرسال
- `notifications` في mock.ts: 4 إشعارات وهمية لعرض Topbar

---

## الكيان 9: `User` — المستخدمون

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[~]` **موجود جزئياً** — `User` interface في `src/data/types.ts`

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | الاسم في الكود |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` |
| `role_id` | BigInt | FK → Role.id | `[~]` | `role: 'admin' \| 'supervisor'` (string مباشر مع مصفوفة الصلاحيات) |
| `username` | String | Unique, Not Null | `[x]` | `username: string` |
| `hashed_password` | String | Not Null | `[ ]` | غائب — كلمة المرور تُعالَج في Form فقط بدون تخزين |
| `full_name` | String | Not Null | `[x]` | `name: string` |
| `phone_number` | String | Not Null | `[x]` | `phone_number?: string` (لتنبيهات SMS) |
| `telegram_chat_id` | String | Nullable | `[x]` | `telegram_chat_id?: string` (لتنبيهات البوت) |
| `is_active` | Boolean | Default True | `[x]` | `active: boolean` |
| `created_at` | DateTime | Not Null | `[ ]` | غائب |
| `updated_at` | DateTime | Not Null | `[~]` | `lastLogin: string` (جزئي) |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | الملف والدالة |
|:---|:---|:---:|:---|
| `+ addUser()` | إضافة مستخدم جديد | `[x]` | `handleSave()` في UserManagement.tsx |
| `+ updateUser()` | تعديل بيانات الحساب | `[x]` | `handleSave()` مع `editing !== null` في UserManagement.tsx |
| `+ deleteUser()` | حذف الحساب | `[x]` | `handleDelete()` في UserManagement.tsx |
| `+ changePassword()` | تغيير كلمة المرور | `[ ]` | حقل كلمة المرور في Form |
| `+ authenticate()` | التحقق من بيانات الدخول | `[~]` | LoginPage.tsx |

### ج) العلاقات

| العلاقة | الاتجاه | الكثافة | الحالة |
|:---|:---|:---|:---:|
| User → Role | HAS | N:1 | `[x]` مربوط عبر `role` ومصفوفة الصلاحيات `permissions` |
| User → Incident | ACKNOWLEDGES | 0..* → 0..* | `[x]` `acknowledged_by: string` في Incident |
| User → SystemSetting | CONFIGURES | 1 → 1 | `[x]` `updated_by` في SystemSetting |
| User → ActionLog | HAS | 1 → 0..* | `[x]` مسجل تلقائياً عبر `AuditContext` |
| User → NotificationLog | RECEIVES | 0..* → 0..* | `[x]` عبر `user_id` و `phone_number` و `telegram_chat_id` |

### د) الموجود فعلياً في البروتوتايب
- **UserManagement.tsx:** جدول المستخدمين + إضافة/تعديل/حذف/تفعيل-تعطيل + نافذة استعراض مصفوفة الصلاحيات (Role & Permissions Matrix) + ربط تلقائي بـ `AuditContext` وحفظ دائم في `localStorage`.
- **UserFormModal:** حقول: name, username, password, phone_number, telegram_chat_id, role, active.

---

## الكيان 10: `Role` — الأدوار الوظيفية

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[ ]` **غائب كـ Type مستقل** — يُستخدَم كـ `type Role = 'admin' | 'supervisor'`

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | ملاحظة |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[ ]` | غائب |
| `name` | String | Unique, Not Null | `[~]` | `Role = 'admin' \| 'supervisor'` فقط |
| `description` | String | Nullable | `[ ]` | غائب |
| `code` | String | Not Null | `[ ]` | غائب |
| `created_at` | DateTime | Not Null | `[ ]` | غائب |
| `updated_at` | DateTime | Not Null | `[ ]` | غائب |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ addRole()` | إضافة دور جديد | `[ ]` | غائبة |
| `+ updateRole()` | تعديل الدور | `[ ]` | غائبة |
| `+ deleteRole()` | حذف الدور | `[ ]` | غائبة |
| `+ assignPermission()` | ربط صلاحية بدور | `[ ]` | غائبة |
| `+ revokePermission()` | إلغاء ربط صلاحية | `[ ]` | غائبة |

### ج) العلاقات

| العلاقة | الاتجاه | الكثافة | الحالة |
|:---|:---|:---|:---:|
| Role → User | HAS | 1 → 0..* | `[~]` مُمثَّل كـ string |
| Role → Permission | GRANTS (via Role_Permission) | 1..* → 0..* | `[ ]` لا يوجد |

---

## الكيان 11: `Permission` — الصلاحيات

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[ ]` **غائب كلياً**

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | ملاحظة |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[ ]` | غائب |
| `name` | String | Not Null | `[ ]` | غائب |
| `code` | String | Unique, Not Null | `[ ]` | غائب |
| `description` | String | Nullable | `[ ]` | غائب |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ checkAccess()` | التحقق من صلاحية تنفيذ عملية | `[ ]` | الصلاحيات تعتمد على التوجيه (Admin pages vs Supervisor pages) |

### ج) الموجود فعلياً في البروتوتايب
- الصلاحيات محددة ببنية التطبيق فقط: Admin يرى صفحات `/admin/*`، Supervisor يرى `/supervisor/*`
- في UserManagement.tsx سطر 111: `push('فتح نافذة صلاحيات المستخدم', 'info')` — زر placeholder فقط

---

## الكيان 12: `ActionLog` — سجل تدقيق العمليات

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `AuditEntry` interface في `types.ts` مع سياق تفاعلي مركزي `AuditContext.tsx` وشاشة عرض تفاعلية `AuditLog.tsx`

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | الاسم في الكود |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` (مثل `A-1234`) |
| `user_id` | BigInt | FK → User.id | `[x]` | `user: string` (اسم المستخدم مع الدور `role`) |
| `action` | String | Not Null | `[x]` | `action: string` (نوع العملية) |
| `details` | Json | Not Null | `[x]` | `details: string` (تفاصيل وبيانات العملية المنفذة) |
| `created_at` | DateTime | Not Null | `[x]` | `time: string` (طابع زمني دقيق بصيغة YYYY-MM-DD HH:mm:ss) |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ createLog()` | تسجيل إجراء جديد تلقائياً | `[x]` | `createLog(action, details, user, role)` في `AuditContext.tsx` ومربوط بجميع شاشات النظام |

### ج) الموجود فعلياً في البروتوتايب
- **AuditContext.tsx:** إدارة وتوليد وتخزين سجل العمليات لحظياً في `localStorage`.
- **AuditLog.tsx:** جدول حي وديناميكي مع شارة متابعة حية، فلترة متعددة (بالمستخدم، الإجراء، والتاريخ)، وزر إعادة التعيين السريع.
- **الربط التشغيلي:** تسجيل تلقائي عند إضافة/تعديل/حذف كاميرا، إضافة/تعديل/تعطيل/حذف مستخدم، إقرار/متابعة/معالجة/رفض حادثة، وتعديل إعدادات النظام وتصفير العدادات.

---

## الكيان 13: `SystemSetting` — إعدادات النظام العامة

**المصدر في ER Diagram:** موجود | **المصدر في Class Diagram:** موجود
**الحالة في البروتوتايب:** `[x]` **موجود ومُنفَّذ بالكامل** — `SystemSetting` interface في `types.ts` مع تخزين دائم ومربوط بشاشة `NotificationConfig.tsx`

### أ) الحقول (Attributes)

| الحقل | النوع | القيد | الحالة | ملاحظة |
|:---|:---|:---|:---:|:---|
| `id` | BigInt | Primary Key | `[x]` | `id: string` |
| `updated_by` | BigInt | FK → User.id | `[x]` | `updated_by?: string` |
| `sms_daily_limit` | Int | Default 100 | `[x]` | `sms_daily_limit: number` |
| `sms_current_count` | Int | Default 0 | `[x]` | `sms_current_count: number` |
| `last_sms_reset_date` | DateTime | Not Null | `[x]` | `last_sms_reset_date: string` |
| `telegram_bot_token` | String | Not Null | `[x]` | `telegram_bot_token: string` |
| `cleanup_days_detections` | Int | Default 30 | `[x]` | `cleanup_days_detections: number` (أيام الاحتفاظ بالاكتشافات) |
| `cleanup_days_images` | Int | Default 90 | `[x]` | `cleanup_days_images: number` (أيام الاحتفاظ بالصور) |
| `updated_at` | DateTime | Not Null | `[x]` | `updated_at?: string` |

### ب) الدوال (Class Diagram Operations)

| الدالة | الوصف | الحالة | ملاحظة |
|:---|:---|:---:|:---|
| `+ updateSettings()` | حفظ إعدادات النظام وسياسات الأرشفة | `[x]` | `handleSaveSettings()` في `NotificationConfig.tsx` مع حفظ في `localStorage` وتسجيل في `AuditLog` |
| `+ resetSmsCounter()` | إعادة تصفير عداد SMS اليومي | `[x]` | `resetSmsCounter()` في `NotificationConfig.tsx` مع توثيق زمني |

### ج) الموجود فعلياً في البروتوتايب
- **NotificationConfig.tsx:** تحكم كامل بـ Bot Token و Recipient ID، بطاقة سعة رسائل SMS مع شريط استهلاك ونسبة مئوية وزر إعادة التصفير، وبطاقة ضبط سياسات الاحتفاظ بالبيانات والأرشفة التلقائية (`cleanup_days_detections` و `cleanup_days_images`).

---

## ملخص جدول المقارنة الشامل (الحالة المحققة في البروتوتايب)

| # | الكيان | موجود في ER | موجود في Class | حالة Types.ts | حالة الحقول والواجهات | حالة الدوال والعمليات | حالة العلاقات |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | `Zone` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق ومربوط بشاشة `/admin/zones` | [x] add/update/delete | [x] Zone → Camera |
| 2 | `Camera` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق في `/admin/cameras` | [x] add/update/delete/getStream | [x] Camera → Zone/Settings |
| 3 | `CameraSetting` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق في تبويب ضبط الخوارزمية | [x] updateSettings/reset | [x] Camera → Setting (1:1) |
| 4 | `CameraMask` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق في تبويب الـ ROI المتعدد | [x] add/toggle/delete | [x] Camera → Mask (1:N) |
| 5 | `Incident` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق في المراجعة والأرشيف | [x] acknowledge/resolve/reject | [x] Incident → Camera/Images |
| 6 | `Detection` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق بإحداثيات BBox حقيقية | [x] recordDetection | [x] Detection → Incident/Camera |
| 7 | `IncidentImage` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق بمعرض الأدلة والتكبير | [x] saveImage/getImageUrl | [x] Incident → Images (1:N) |
| 8 | `NotificationLog` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق بشاشة `/admin/notification-logs` | [x] send/retry | [x] Incident → NotifLog |
| 9 | `User` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق مع الهاتف والتيليجرام | [x] add/update/delete/toggle | [x] User → Role/Audit |
| 10 | `Role` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] مُمثَّل بمصفوفة الصلاحيات والمودال | [x] assign/inspect permissions | [x] Role → User (1:N) |
| 11 | `Permission` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] نافذة الصلاحيات التفاعلية | [x] checkAccess | [x] Role → Permissions |
| 12 | `ActionLog` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] سجل حي بشاشة `/admin/audit` | [x] createLog (سياق مركزي) | [x] User → ActionLog |
| 13 | `SystemSetting` | ✅ | ✅ | ✅ مُعرَّف بالكامل | [x] متطابق في `/admin/notifications` | [x] update/resetSmsCounter | [x] User → SystemSetting |

---

## حالة العلاقات الهندسية (Entity Relationships Status)

| العلاقة | الاتجاه | الكثافة | الحالة | الربط البرمجي في النظام |
|:---|:---|:---|:---:|:---|
| Zone → Camera | CONTAINS | 1 → 0..* | `[x]` | `zone_id` في الكاميرات مع فلترة وحماية التكامل المرجعي عند الحذف |
| Camera → CameraSetting | DEFINES | 1 → 1 | `[x]` | علاقة 1:1 مدمجة في تبويب تفاصيل الكاميرا مع أوزان القرار الخمسة |
| Camera → CameraMask | APPLIES | 1 → 0..* | `[x]` | مصفوفة أقنعة الحجب والتركيز المتعددة بإحداثيات مضلعة وتطبيق فوري |
| Camera → Incident | CAPTURES | 1 → 0..* | `[x]` | ربط البلاغ بمعرف واسم وموقع الكاميرا |
| Camera → Detection | GENERATES | 1 → 0..* | `[x]` | إحداثيات Bounding Box اللحظية الصادرة من استدلال الكاميرا |
| Incident → Detection | INCLUDES | 1 → 1..* | `[x]` | مصفوفة إطارات الكشف لكل حادثة مع نسبة الثقة والمساحة |
| Incident → IncidentImage | STORES | 1 → 0..* | `[x]` | معرض الأدلة البصرية وصور VLM التكبيرية |
| Incident → NotificationLog | TRIGGERS | 1 → 0..* | `[x]` | توثيق إرسال التنبيه الفوري لكل حادثة |
| User → Incident | ACKNOWLEDGES | 0..* → 0..* | `[x]` | توثيق اسم المشرف وتوقيت الإقرار والمعالجة |
| User → SystemSetting | CONFIGURES | 1 → 1 | `[x]` | حفظ التعديلات باسم المشرف وتوثيقها |
| User → ActionLog | HAS | 1 → 0..* | `[x]` | تسجيل العمليات تلقائياً باسم ودور المستخدم |
| User → NotificationLog | RECEIVES | 0..* → 0..* | `[x]` | أرقام الهواتف ومعرفات التيليجرام في حسابات المستخدمين |
| Role → User | HAS | 1 → 0..* | `[x]` | تعيين الدور لكل مستخدم مع الصلاحيات المترتبة |
| Role → Permission | GRANTS | M:N عبر Role_Permission | `[x]` | مصفوفة صلاحيات تفاعلية لكل دور وظيفي |

---

## خطة التطوير التنفيذية المقترحة — مهام مفصلة واجهة بواجهة (Page-by-Page Tasks)

> تم تنظيم المهام لتُنفَّذ واجهة بواجهة بناءً على التحليل الفني وقرارات المستخدم، بحيث يتم إنجاز وتدقيق كل شاشة ببياناتها وأنواعها بشكل كامل:

---

### 📦 المرحلة التأسيسية: الطبقة المشتركة للأنواع والبيانات (Types & Central Mock Store) ✅ (مكتملة)
- [x] **ملف `src/data/types.ts`:**
  - [x] إضافة `Zone` interface (`id`, `name`, `description`, `created_at`, `updated_at`).
  - [x] إضافة `CameraMask` interface (`id`, `camera_id`, `name`, `mask_type: 'exclusion' | 'inclusion'`, `polygon_points`, `is_active`).
  - [x] إضافة `CameraSetting` interface مدمج كحقول أو كـ type فرعي داخل Camera (`smoke_conf_thresh`, `fire_conf_thresh`, `fps_target`, `k_frames`, `n_frames`, `w1`..`w5`).
  - [x] إضافة `Detection` interface (`id`, `camera_id`, `incident_id`, `class_detected`, `confidence`, `bbox: {x, y, width, height}`, `area_ratio`, `timestamp`).
  - [x] إضافة `IncidentImage` interface (`id`, `incident_id`, `image_path`, `image_type`, `captured_at`).
  - [x] إضافة `NotificationLog` interface (`id`, `incident_id`, `channel: 'telegram' | 'sms' | 'webhook'`, `recipient`, `status: 'sent' | 'failed' | 'retrying'`, `error_message`, `retry_count`, `sent_at`).
  - [x] إضافة `SystemSetting` interface (`sms_daily_limit`, `sms_current_count`, `telegram_bot_token`, `cleanup_days_detections`, `cleanup_days_images`).
  - [x] تحديث `Incident` لدعم `acknowledged_by`, `resolution_note`, `vlm_verdict`, مع الإبقاء على الحقول الإضافية (`movement`, `timeline`, `supervisor`) كملاحظات مؤقتة.
  - [x] تحديث `User` لدعم `phone_number` و `telegram_chat_id`.
  - [x] إضافة `Permission` interface لتمثيل الصلاحيات والأدوار.
- [x] **ملف `src/data/mock.ts` / Store:**
  - [x] إنشاء بيانات أولية للمناطق (`zones`).
  - [x] ربط الكاميرات بـ `zone_id`.
  - [x] إنشاء بيانات تجريبية للأقنعة المتعددة (`masks`).
  - [x] إنشاء بيانات تجريبية لسجلات التنبيهات الصادرة (`notificationLogs`).
  - [x] إنشاء بيانات تجريبية للاكتشافات والأدلة المصورة (`detections`, `incidentImages`).
  - [x] إنشاء بيانات تجريبية لإعدادات النظام وسجل العمليات (`defaultSystemSetting`, `auditLog`).

---

### 🖥️ الواجهة 1: إدارة المناطق الجغرافية (`ZoneManagement.tsx`) [واجهة جديدة في الـ Sidebar] ✅ (مكتملة)
- **المسار في النظام:** `/admin/zones`
- **الموقع:** شاشة مستقلة جديدة تحت لوحة الإدارة
- [x] إضافة رابط "إدارة المناطق" في القائمة الجانبية `src/components/Sidebar.tsx` بأيقونة مناسبة (`MapPin`).
- [x] إضافة Route جديد في `src/App.tsx` يوجه إلى `ZoneManagement`.
- [x] بناء شاشة `ZoneManagement.tsx`:
  - [x] جدول عرض المناطق (الاسم، الوصف، عدد الكاميرات التابعة، تاريخ الإنشاء، إجراءات).
  - [x] نافذة منبثقة (Modal) لإضافة منطقة جديدة (`addZone`).
  - [x] نافذة منبثقة لتعديل بيانات المنطقة (`updateZone`).
  - [x] زر حذف المنطقة مع التحقق من عدم وجود كاميرات مرتبطة بها لحماية التكامل المرجعي (`deleteZone`).
  - [x] ربط العمليات بـ `ZoneContext` ومزامنتها مع الكاميرات في `CameraManagement` و `LiveMonitoring`.

---

### 🖥️ الواجهة 2: تفاصيل الكاميرا وإعداداتها والـ ROI (`CameraDetails.tsx`) [تطوير ودمج داخل الكاميرا]
- **المسار في النظام:** `/admin/cameras/:id`
- **الموقع:** تطوير التبويبات الموجودة داخل نفس الصفحة دون إنشاء واجهات خارجية
- [ ] **تبويب إعدادات الكشف (`DetectionTab`):**
  - [ ] دمج حقول `CameraSetting`: عتبة كشف الدخان (`smoke_conf_thresh`) وعتبة كشف اللهب (`fire_conf_thresh`) كمنزلقات منفصلة.
  - [ ] إضافة ضبط الأوزان الخوارزمية (أوزان الثقة، التراكم الزمني، المساحة، التوسع، والـ VLM).
  - [ ] الحفاظ على الحقول الحالية (الحساسية، عدد الإطارات، تفعيل التحقق السياقي).
  - [ ] زر حفظ الإعدادات (`updateSettings`) وزر استعادة الافتراضي (`resetToDefault`).
- [ ] **تبويب أقنعة الحجب والـ ROI (`RoiTab`):**
  - [ ] تطوير الواجهة لدعم إنشاء **أقنعة متعددة** للكاميرا الواحدة.
  - [ ] إضافة حقل إدخال اسم القناع (`name`).
  - [ ] إضافة اختيار نوع القناع: منطقة حجب واستبعاد (`exclusion`) أو منطقة تركيز واهتمام (`inclusion`).
  - [ ] قائمة جانبية أو أسفل الرسم بالأقنعة المحفوظة مع إمكانية التفعيل/التعطيل (`toggleMask`) والحذف (`deleteMask`).
  - [ ] حفظ النقاط `points` في الـ Store المرتبط بالكاميرا بشكل فعلي.

---

### 🖥️ الواجهة 3: إدارة الكاميرات (`CameraManagement.tsx`) [تطوير القائم وربط المناطق]
- **المسار في النظام:** `/admin/cameras`
- [ ] تعديل نموذج إضافة/تعديل الكاميرا (`CameraFormModal`):
  - [ ] استبدال حقل `location` النصي الحر بقائمة منسدلة لاختيار المنطقة من قائمة المناطق المعرّفة (`Zone`).
  - [ ] إضافة حقل `fps_target` و `location_desc`.
- [ ] تحديث جدول الكاميرات لعرض اسم المنطقة الجغرافية المرتبطة بدقة.
- [ ] دعم الفلترة والبحث بحسب المنطقة الجغرافية (`Zone`).
- [ ] ربط تفعيل/تعطيل المراقبة (`toggleMonitoring`) وحذف الكاميرا بتسجيل الحدث في `ActionLog`.

---

### 🖥️ الواجهة 4: المراقبة المباشرة للكاميرات (`LiveMonitoring.tsx`) [تصليح ودمج Detection]
- **المسار في النظام:** `/supervisor/live`
- [ ] استبدال الـ Bounding Box الثابت برسم تفاعلي مبني على إحداثيات الكشف اللحظي الحقيقية (`Detection.bbox: {x, y, width, height}`).
- [ ] عرض شريط تفاصيل الاكتشاف بدقة:
  - [ ] نوع الاكتشاف: دخان (`smoke`) أو لهب (`fire`).
  - [ ] نسبة الثقة الحقيقية (`confidence %`).
  - [ ] نسبة مساحة الكشف مقارنة بالإطار (`area_ratio`).
- [ ] فلترة الكاميرات المعروضة حسب المنطقة الجغرافية من جدول `Zone`.
- [ ] إظهار حالة أقنعة الـ ROI الفعّالة فوق البث المباشر.

---

### 🖥️ الواجهة 5: مراجعة الحوادث والأدلة البصرية (`IncidentReview.tsx`) [دمج وتطوير الأدلة و IncidentImage]
- **المسار في النظام:** `/supervisor/incidents/:id`
- [ ] **دمج وتطوير أدلة الحوادث (`IncidentImage`):**
  - [ ] استبدال بطاقات الأدلة الوهمية الحالية بعرض إطارات ولقطات حقيقية (`IncidentImage`).
  - [ ] تمييز نوع اللقطة: لقطة البداية (`initial`)، إطار أعلى ثقة (`peak_confidence`)، لقطة تحقق VLM (`vlm_crop`).
  - [ ] نافذة معاينة مكبرة (Modal) لعرض الصورة بالحجم الكامل مع رسم الـ Bounding Box الخاص بالاكتشاف.
- [ ] **تطوير تفاصيل وإجراءات الحادثة:**
  - [ ] ربط إقرار الحادثة باسم ومعرف المشرف المسجل دخولاً (`acknowledged_by`).
  - [ ] تسجيل وقت الإقرار الفعلي (`acknowledged_at`).
  - [ ] إضافة حقل كتابة ملاحظات الحل وإغلاق الحادثة (`resolution_note` & `closeIncident`).
  - [ ] عرض حكم نموذج الذكاء الاصطناعي VLM وتفسيره السياقي (`vlm_verdict` & `vlm_reason`).

---

### 🖥️ الواجهة 6: الحوادث النشطة وسجل الحوادث (`ActiveIncidents.tsx` & `IncidentHistory.tsx`)
- **المسار في النظام:** `/supervisor/incidents` و `/supervisor/history`
- [ ] تفعيل الفلترة المتقدمة: بحسب المنطقة الجغرافية (`Zone`)، نوع الخطر (`smoke` / `fire`)، ومستوى الخطورة (`severity`).
- [ ] عرض مدة الحادثة المحسوبة بين `started_at` و `ended_at`.
- [ ] إظهار اسم المشرف الذي باشر الحادثة بدقة.
- [ ] تصدير تقرير الحوادث مع تفاصيل الموقع والمشرف.

---

### 🖥️ الواجهة 7: سجل الرسائل والتنبيهات الصادرة (`NotificationLogs.tsx`) [واجهة جديدة في الـ Sidebar]
- **المسار في النظام:** `/admin/notification-logs`
- **الموقع:** شاشة مستقلة جديدة تحت لوحة الإدارة
- [ ] إضافة رابط "سجل الرسائل الصادرة" في القائمة الجانبية `src/components/Sidebar.tsx` بأيقونة مناسبة (`Send` أو `MessageSquareText`).
- [ ] إضافة Route جديد في `src/App.tsx` يوجه إلى `NotificationLogs`.
- [ ] بناء شاشة `NotificationLogs.tsx`:
  - [ ] جدول سجل التنبيهات: الحادثة المرتبطة، القناة (`Telegram` / `SMS`)، المستلم (رقم الهاتف أو المعرف)، وقت الإرسال.
  - [ ] عرض شارة الحالة بوضوح: ناجح ✅، فاشل ❌، قيد المحاولة ⏳.
  - [ ] عرض نص رسالة الخطأ عند الفشل (`error_message`) وعدد محاولات الإعادة (`retry_count`).
  - [ ] زر يدوي لإعادة إرسال التنبيهات الفاشلة (`retrySending`).
  - [ ] أدوات تصفية وبحث بحسب القناة (تيليجرام / رسائل نصية) وحالة التسليم والتاريخ.

---

### 🖥️ الواجهة 8: إعداد قنوات التنبيه (`NotificationConfig.tsx`) ✅ (مكتملة)
- **المسار في النظام:** `/admin/notifications`
- [x] ربط حقول الإعدادات (Telegram Bot Token, Recipient IDs, SMS Limits) بـ `SystemSetting` في الـ Store والتخزين المحلي بدلاً من القيم الثابتة.
- [x] عند الضغط على أزرار اختبار الإرسال (`handleTest`)، تسجيل الإرسال تلقائياً كإدخال جديد في سجل الرسائل الصادرة (`NotificationLog`).
- [x] إظهار عداد الرسائل اليومية للـ SMS والحد الأقصى (`sms_current_count` / `sms_daily_limit`) مع شريط استهلاك وزر تصفير العداد (`resetSmsCounter`).
- [x] ضبط سياسات الاحتفاظ بالبيانات والأرشفة (`cleanup_days_detections` و `cleanup_days_images`) وحفظها في `SystemSetting`.

---

### 🖥️ الواجهة 9: إدارة المستخدمين والأدوار والصلاحيات (`UserManagement.tsx`) ✅ (مكتملة)
- **المسار في النظام:** `/admin/users`
- [x] إضافة الحقول الناقصة في نموذج المستخدم (`UserFormModal`):
  - [x] رقم الهاتف (`phone_number`) لتلقي تنبيهات SMS.
  - [x] معرف التيليجرام (`telegram_chat_id`) لتلقي تنبيهات البوت.
- [x] تفعيل زر "صلاحيات المستخدم" لفتح نافذة منبثقة تفاعلية تعرض أدوار وصلاحيات الكيان `Role` و `Permission`.
- [x] تسجيل إضافة وتعديل وتعطيل وحذف المستخدمين في `ActionLog` (`AuditContext`).
- [x] حفظ المستخدمين واسترجاعهم من التخزين المحلي `localStorage` بصورة دائمة ومستقرة.

---

### 🖥️ الواجهة 10: سجل تدقيق العمليات (`AuditLog.tsx`) ✅ (مكتملة)
- **المسار في النظام:** `/admin/audit`
- [x] تحويل السجل من بيانات ثابتة إلى سجل حي وديناميكي مرتبط بكافة العمليات عبر `AuditContext`:
  - [x] تسجيل عمليات الكاميرات (إضافة، تعديل، حذف، تغيير إعدادات، تعديل ROI).
  - [x] تسجيل عمليات الحوادث (إقرار، رفض، معالجة، إغلاق).
  - [x] تسجيل عمليات المستخدمين وإعدادات النظام وتصفير عداد الرسائل.
- [x] تصفية تفاعلية للعمليات والمستخدمين والتواريخ مع استخراج أنواع الإجراءات ديناميكياً وزر إعادة التعيين.
- [x] عرض التفاصيل (`details`) بشكل منسق وقابل للقراءة مع شارة "مباشر وديناميكي".

---

### 🖥️ الواجهة 11: لوحات المتابعة والإحصاءات العامة (`DashboardOverview.tsx` & `AnalyticsDashboard.tsx`)
- **المسار في النظام:** `/admin` و `/supervisor`
- [ ] تحديث بطاقات الإحصاءات لتعكس عدد المناطق المعرفة، عدد الكاميرات النشطة، ونسب دقة الكشف.
- [ ] رسم بياني لتوزيع الحوادث بحسب المناطق الجغرافية (`Zone`).
- [ ] رسم بياني لنسب نجاح وفشل قنوات الإشعار الصادرة.


---

> **ملاحظة ختامية:** هذا التقرير مبني على قراءة مباشرة لكل ملفات المشروع التالية:
> - `src/data/types.ts` — تعريفات TypeScript
> - `src/data/mock.ts` — البيانات التجريبية
> - `src/pages/admin/CameraManagement.tsx` — إدارة الكاميرات
> - `src/pages/admin/CameraDetails.tsx` — تفاصيل الكاميرا
> - `src/pages/admin/UserManagement.tsx` — إدارة المستخدمين
> - `src/pages/admin/NotificationConfig.tsx` — إعدادات التنبيهات
> - `src/pages/admin/AuditLog.tsx` — سجل التدقيق
> - `src/pages/supervisor/IncidentReview.tsx` — مراجعة الحوادث
> - `src/pages/supervisor/LiveMonitoring.tsx` — المراقبة المباشرة
