# AgencyOS — Content Studio
**Annex to MasterSpec | Module 17 | Version 1.0**

> هذا المستند مكمّل للمواصفة الرئيسية (AgencyOS_MasterSpec.md) ويحل محل القسم القديم "Module 10 - Content Calendar". هو منظومة متكاملة لإنتاج المحتوى الإبداعي تربط كل أقسام النظام ببعضها بذكاء.

---

## 0. الفلسفة والنموذج الذهني

### 0.1 المشكلة التي يحلها هذا المستند

في وكالات الإنتاج الفني، إعداد خطة محتوى شهرية لعميل واحد يتضمن أحياناً:
- 8 ريلز فيديو
- 12 منشور تصميم
- 30 ستوري
- 4 كاروسيل
- حملة إعلانية واحدة بنسختين

كل قطعة محتوى لها:
- فكرة (Big Idea)
- قصة (Story / Narrative)
- هدف (Objective)
- إطار عمل (Framework)
- هوك (Hook)
- نص أو سكريبت
- توجيه بصري
- كابشن وهاشتاغات
- نداء فعل (CTA)

النظام التقليدي يضع كل هذا في جدول إكسل أو تقويم بسيط. هذا يفقد الكاتب التركيز ويعزل المحتوى عن السياق (الجمهور، البراند، الحملة، الأهداف).

**Content Studio يحل هذا** عبر هرمية واضحة + أدوات ذكية + ربط تلقائي بكل أقسام النظام.

### 0.2 النموذج الذهني (Mental Model)

```
┌─────────────────────────────────────────────────────┐
│              CLIENT (العميل)                         │
│                  ↓                                   │
│              BRAND BRIEF (هوية وجمهور)               │
│                  ↓                                   │
│              CONTENT PLAN (خطة شهرية)                 │
│                  ↓                                   │
│              CONTENT PILLARS (محاور المحتوى)          │
│                  ↓                                   │
│              CONTENT PIECE (قطعة محتوى)              │
│                  ↓                                   │
│           ┌──────┼──────┬──────┬──────┐              │
│           ↓      ↓      ↓      ↓      ↓             │
│        VIDEO  DESIGN  STORY  REEL  CAROUSEL          │
│           ↓      ↓      ↓      ↓      ↓             │
│         (لكل نوع تدفق إنتاج مختلف)                    │
│                  ↓                                   │
│              COMPONENTS (المكونات)                    │
│        Big Idea / Hook / Script / Visual /           │
│        Caption / Hashtags / CTA / Music              │
│                  ↓                                   │
│              PRODUCTION (الإنتاج)                     │
│                  ↓                                   │
│              CLIENT APPROVAL (موافقة العميل)         │
│                  ↓                                   │
│              SCHEDULE & PUBLISH (نشر)                │
│                  ↓                                   │
│              ANALYTICS (تحليل الأداء)                 │
└─────────────────────────────────────────────────────┘
```

### 0.3 المبادئ التصميمية

| المبدأ | التطبيق |
|---|---|
| **سياق دائم** | كاتب المحتوى يرى دائماً Brand Brief أثناء العمل |
| **توليد ذكي بإطار واضح** | كل ناتج AI مبني على فريم ورك معروف، ليس عشوائياً |
| **الفيديو ≠ التصميم** | لكل نوع محتوى تدفق إنتاج خاص ومناسب |
| **تكرار قابل للحفظ** | كل عمل ناجح يتحول إلى قالب لإعادة الاستخدام |
| **ربط تلقائي** | إنشاء محتوى يولّد مهاماً ومواعيد ومراجعات تلقائياً |
| **عمق اختياري** | المبتدئ يستخدم القوالب، الخبير يدخل في الفريم وركس |

---

## 1. الهرمية الكاملة (Data Hierarchy)

### 1.1 Brand Brief (الهوية المرجعية)

ملف يولَّد مرة واحدة لكل عميل ويبقى مرجعاً لكل محتوى.

```
brand_briefs:
  id, company_id, client_id
  
  # الهوية
  brand_name_ar, brand_name_en
  brand_story (سرد قصير)
  mission, vision
  
  # نبرة الصوت
  tone_of_voice: [formal, friendly, witty, professional, ...]
  voice_dos: [string]      # "نتحدث بضمير الجماعة"
  voice_donts: [string]    # "لا نستخدم الإيموجي في النصوص الرسمية"
  brand_keywords: [string] # كلمات نستخدمها دائماً
  banned_words: [string]   # كلمات نتجنبها
  
  # الجمهور (Personas)
  target_personas: [{
    name, age_range, gender, location,
    interests, pain_points, goals,
    where_they_hang_out: [platform],
    objections, motivations
  }]
  
  # الهوية البصرية
  primary_colors: [hex]
  secondary_colors: [hex]
  fonts: { heading, body, accent }
  logo_urls: [url]
  visual_style: [string]   # "minimalist", "ornate", "futuristic"
  mood_keywords: [string]  # "warm", "luxurious", "playful"
  
  # المرجعية الثقافية
  cultural_context: text   # مهم للسوق العراقي/العربي
  religious_considerations: text
  
  # المنافسون
  competitors: [{ name, social_handles, what_we_do_better }]
  
  # محاور المحتوى الافتراضية
  default_content_pillars: [pillar_id]
  
  # المنصات
  active_platforms: [instagram, tiktok, ...]
  posting_frequency_per_platform: { instagram: 3, tiktok: 5, ... }
  
  + standard columns
```

> **مثال لرؤية:** "معسل أحمد" Brand Brief يحوي تموضع Premium، الهوية السومرية/البابلية، نبرة فاخرة، جمهور هدف 25-45، ألوان ذهبية + بنفسجية...

### 1.2 Content Pillars (محاور المحتوى)

الموضوعات الكبرى التي يدور حولها كل محتوى البراند. عادة 3-5 محاور لكل عميل.

```
content_pillars:
  id, company_id, client_id
  name_ar, name_en
  description
  color (للتمييز البصري في التقويم)
  icon
  percentage_target  # مثلاً: التعليم 40%، الترفيه 30%، البيع 30%
  example_topics: [string]
  recommended_formats: [video, design, story, reel, carousel]
  + standard columns
```

> **مثال لمعسل أحمد:**
> - **التراث الحضاري** (35%) → فيديو تاريخي
> - **تجربة المنتج** (30%) → كاروسيل، صور
> - **مقاهي الشركاء** (20%) → ستوريز
> - **العروض والمناسبات** (15%) → ريلز قصيرة

### 1.3 Content Plan (الخطة الشهرية)

الحاوية الزمنية لمحتوى شهر معيّن لعميل معيّن.

```
content_plans:
  id, company_id, client_id, campaign_id (nullable)
  title, month, year
  status: draft | in_review | approved | active | completed
  
  # الأهداف الشهرية
  monthly_objectives: [{ metric, target, current }]
  # مثلاً: زيادة المتابعين بـ 10%، 50 ألف مشاهدة، 100 رسالة
  
  # توزيع البيلرز
  pillar_distribution: [{ pillar_id, target_count }]
  
  # توزيع الأنواع
  content_type_distribution: {
    videos: 8,
    designs: 12,
    stories: 30,
    reels: 6,
    carousels: 4
  }
  
  # موافقة العميل
  client_approval_status, client_approved_at, client_approved_by
  client_revision_count, client_revision_limit
  
  # التحليلات
  total_pieces_planned, total_pieces_published
  total_reach, total_engagement
  
  + standard columns
```

### 1.4 Content Piece (قطعة محتوى)

الوحدة الأساسية. كل ريلز، كل تصميم، كل ستوري = قطعة محتوى.

```
content_pieces:
  id, company_id, content_plan_id, pillar_id, client_id
  
  # التعريف
  title (داخلي للفريق)
  type: video_long | reel | story | static_design | carousel | gif | podcast | blog_post
  platform: [instagram, tiktok, youtube, facebook, ...]  # متعدد المنصات ممكن
  
  # المحتوى المركزي
  big_idea text (الفكرة الكبرى بجملة واحدة)
  framework_used: aida | pas | bab | sb7 | hook_story_offer | ...
  framework_data (JSON: حقول الفريم ورك)
  
  # المكونات (يختلف حسب النوع)
  components (JSON):
    # للفيديو/الريل:
    - hook_text
    - script
    - storyboard_id
    - shot_list
    - voiceover_script
    - music_track_url
    - sfx_notes
    - b_roll_notes
    - thumbnail_concept
    
    # للتصميم الثابت:
    - headline
    - subheadline
    - body_copy
    - visual_direction
    - color_palette
    - typography
    - layout_type  # F-pattern, Z-pattern, centered
    - imagery_brief
    
    # للستوري:
    - frame_sequence: [{ frame_number, visual, text, sticker }]
    - duration_per_frame
    - interactive_elements: [poll, quiz, slider, question]
    
    # للكاروسيل:
    - slides: [{ slide_number, headline, body, visual }]
    - hook_slide
    - cta_slide
    
  # المنشور النهائي
  caption_ar, caption_en
  hashtags: [string]
  cta_text, cta_link
  
  # العلاقات
  linked_assets: [asset_id]
  linked_tasks: [task_id]
  inspiration_refs: [{ url, source, notes }]
  
  # الحالة
  stage: idea | in_writing | in_design | in_production | internal_review |
         client_review | revision | approved | scheduled | published | failed
  scheduled_at
  published_at
  
  # الموافقات
  internal_approver_id, internal_approved_at
  client_approval_status, client_approved_at
  revision_history: [{ round, requested_by, feedback, resolved_at }]
  
  # الأداء (بعد النشر)
  metrics: { reach, impressions, likes, comments, shares, saves, watch_time, ctr }
  
  + standard columns
```

### 1.5 العلاقة الكاملة

```
Client (1) ─── (1) Brand Brief
   │
   ├── (n) Content Pillars
   ├── (n) Campaigns
   │       └── (n) Content Plans
   │               └── (n) Content Pieces
   │                       │
   │                       ├── linked → Pillar
   │                       ├── linked → Assets
   │                       ├── linked → Tasks
   │                       └── linked → Project (إذا كان ضمن مشروع كبير)
   │
   └── (n) Audience Personas (ضمن Brand Brief)
```

---

## 2. الواجهة وتدفق المستخدم (UX Flow)

### 2.1 الصفحة الرئيسية: Content Studio Hub

عند دخول كاتب المحتوى لقسم Content Studio يرى:

```
┌──────────────────────────────────────────────────────────────────┐
│  Content Studio                    [+ خطة جديدة] [↗ القوالب]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📌 خططي النشطة                                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │ معسل أحمد       │ │ بوث المعرض     │ │ السلامي        │       │
│  │ ديسمبر 2025    │ │ يناير 2026     │ │ ديسمبر 2025    │       │
│  │ ▓▓▓▓▓░░ 70%    │ │ ▓▓░░░░░ 30%    │ │ ▓▓▓▓▓▓░ 90%   │       │
│  │ 18/26 منشور    │ │ 6/20 منشور     │ │ 27/30 منشور    │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
│                                                                   │
│  ⚡ تحتاج اهتمامك                                                 │
│  • 3 محتويات تنتظر مراجعتك (السلامي)                            │
│  • العميل طلب تعديل على ريلز "تاريخ النرجيلة"                   │
│  • موعد نشر بعد 4 ساعات بدون موافقة العميل                      │
│                                                                   │
│  🛠 الأدوات السريعة                                              │
│  [مولد الأفكار] [مختبر الهوكس] [كاتب السكريبت] [مولد الكابشن]  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 إنشاء خطة شهرية: Plan Builder Wizard

يبدأ من زر **"+ خطة جديدة"**. يمر بالمراحل التالية:

#### المرحلة 1: السياق (Context)
```
┌──────────────────────────────────────────────┐
│  خطة محتوى جديدة - الخطوة 1 من 4            │
├──────────────────────────────────────────────┤
│                                              │
│  العميل:        [معسل أحمد ▼]               │
│  الشهر:         [يناير 2026 ▼]              │
│  الحملة:        [إطلاق الخط الذهبي ▼]      │
│                 (اختياري)                    │
│                                              │
│  📋 يتم تلقائياً تحميل:                      │
│  ✓ Brand Brief للعميل                       │
│  ✓ نبرة الصوت                               │
│  ✓ المحاور الافتراضية (3 محاور)              │
│  ✓ تفضيلات النشر للمنصات                    │
│                                              │
│                          [التالي →]          │
└──────────────────────────────────────────────┘
```

#### المرحلة 2: الأهداف والتوزيع
```
┌──────────────────────────────────────────────┐
│  الأهداف الشهرية - الخطوة 2 من 4            │
├──────────────────────────────────────────────┤
│                                              │
│  ما الهدف الأساسي لهذا الشهر؟                │
│  ⚪ زيادة الوعي (Awareness)                  │
│  🔵 زيادة التفاعل (Engagement)               │
│  ⚪ زيادة المتابعين                           │
│  ⚪ زيادة المبيعات                            │
│  ⚪ زيادة الزيارات                            │
│                                              │
│  📊 توزيع الأنواع المقترح:                    │
│  ┌────────────────────────────────────────┐  │
│  │ ريلز:        ████████░░  8 (ينصح بـ 8) │  │
│  │ تصاميم:      ██████████ 12 (ينصح بـ10)│  │
│  │ ستوريز:      ████████░░ 25            │  │
│  │ كاروسيل:     ███░░░░░░░  4            │  │
│  │ فيديو طويل:  █░░░░░░░░░  1            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  📐 توزيع المحاور:                           │
│  ┌────────────────────────────────────────┐  │
│  │ التراث الحضاري:  ████ 35% (10 منشور)  │  │
│  │ تجربة المنتج:    ███░ 30% (9 منشور)   │  │
│  │ مقاهي الشركاء:   ██░░ 20% (6 منشور)   │  │
│  │ العروض:          █░░░ 15% (5 منشور)   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [اسأل AI للاقتراح]    [← السابق] [التالي →]│
└──────────────────────────────────────────────┘
```

#### المرحلة 3: توليد الأفكار (Idea Generation)
```
┌────────────────────────────────────────────────────────────┐
│  مكتبة الأفكار - الخطوة 3 من 4                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  لديك 30 منشور مطلوب. AI سيقترح 50 فكرة، اختر 30.        │
│                                                            │
│  🎯 توجيه (اختياري):                                       │
│  [أركز على إطلاق المنتج الجديد + الترند الحالي على تيكتوك]│
│                                                            │
│  [✨ توليد الأفكار]                                        │
│                                                            │
│  ─────────────────────────────────────────────             │
│                                                            │
│  محور: التراث الحضاري (10 مطلوب)                          │
│                                                            │
│  ☑ 1. ريلز: "كيف كان السومريون يستمتعون؟" - فكرة تربط    │
│       الحضارة القديمة بطقوس الاسترخاء الحديثة            │
│       [📝 إطار: السرد التاريخي] [⏱ 30s] [🎬 Reel]         │
│                                                            │
│  ☑ 2. كاروسيل: "5 رموز بابلية على علبتنا"                │
│       تفسير الرموز الفنية في تصميم العبوة                │
│       [📝 إطار: PAS] [📐 Carousel 8 شرائح]                │
│                                                            │
│  ☐ 3. تصميم ثابت: نقش لوحة سومرية + شعار                │
│       [📝 إطار: تصميم رمزي] [🖼 Static]                   │
│                                                            │
│  ... 47 فكرة أخرى ...                                     │
│                                                            │
│  محدد: 28 / 30                       [إعادة التوليد] [→]  │
└────────────────────────────────────────────────────────────┘
```

#### المرحلة 4: التقويم والجدولة
```
┌─────────────────────────────────────────────────────────────────┐
│  تقويم الشهر - الخطوة 4 من 4                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AI رتّب الأفكار في تقويم متوازن. حرّك السحب والإفلات لتعديل. │
│                                                                 │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐           │
│  │ الأحد│الاثنين│الثلاثاء│الأربعاء│الخميس│الجمعة│السبت│           │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤           │
│  │  1   │  2   │  3   │  4   │  5   │  6   │  7   │           │
│  │ 🎬9pm│ 🖼12 │ 🎬9pm│ 📐3pm│ 🎬9pm│ ─    │ 🖼7pm│           │
│  │ ست×3 │ ست×2 │ ست×3 │ ست×3 │ ست×4 │      │ ست×2 │           │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤           │
│  │  8   │  9   │  10  │  ...                                   │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘           │
│                                                                 │
│  Legend: 🎬 ريل  🖼 تصميم  📐 كاروسيل  ست = ستوري              │
│                                                                 │
│  ✅ توازن جيد عبر الأسبوع                                      │
│  ⚠ يوم الجمعة فارغ (مناسب للسوق العراقي)                       │
│                                                                 │
│  [← السابق]  [💾 حفظ كمسودة]  [🚀 إنشاء الخطة]                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 محرر القطعة الواحدة (Content Piece Editor)

عند فتح أي قطعة، الواجهة **تتكيّف حسب النوع**.

#### للريل / فيديو قصير:
```
┌──────────────────────────────────────────────────────────────────┐
│  ← خطة معسل أحمد - يناير      [💾 حفظ] [✓ مراجعة] [📤 إرسال]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ [الجانب الأيمن - السياق الدائم]    [الجانب الأيسر - المحرر]    │
│                                                                   │
│  📋 السياق                          🎬 ريل: "كيف كان السومريون"  │
│  العميل: معسل أحمد                  ─────────────────────         │
│  المحور: التراث الحضاري              [Tab: 💡 الفكرة | 🪝 الهوك   │
│  المنصة: Instagram + TikTok               | 📝 السكريبت | 🎞 ستوري│
│  المدة: 30 ثانية                          | 🎵 الموسيقى | ✏ كابشن]│
│                                                                   │
│  🎨 نبرة الصوت                       💡 الفكرة الكبرى             │
│  - فاخرة                            ┌─────────────────────────┐  │
│  - تاريخية                          │ ربط طقوس الاسترخاء       │  │
│  - دافئة                            │ السومرية بتجربة المعسل   │  │
│                                     │ الحديثة                  │  │
│  🎭 الجمهور                         └─────────────────────────┘  │
│  رجال 25-45                        [✨ ولّد بـ AI]                │
│  محبو التراث                                                     │
│                                     📐 الإطار: Hook-Story-Payoff │
│  🖼 المرجع البصري                   ┌─────────────────────────┐  │
│  [مزاج بورد البراند]                │ Hook: لقطة قريبة لنقش   │  │
│  ألوان: ذهبي + بنفسجي               │ سومري ثم انتقال درامي  │  │
│                                     │ Story: "قبل 5000 سنة..." │  │
│                                     │ Payoff: المنتج ظاهراً    │  │
│                                     │ بإضاءة ذهبية             │  │
│                                     └─────────────────────────┘  │
│                                                                   │
│  💡 اقتراحات AI ذات صلة:           [🛠 افتح في مختبر الإطارات]   │
│  - 5 ريلز سابقة ناجحة في نفس                                     │
│    المحور (انقر للاطلاع)                                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

عند الانتقال لتاب **🪝 الهوك**:
```
🪝 الهوك (Hook) - أول 3 ثواني

النوع المختار: Visual Pattern Interrupt
[Tabs: Visual | Verbal | Question | Bold Statement | Curiosity Gap]

┌─────────────────────────────────────────┐
│ "ماذا لو قلت لك أن السومريين كانوا       │
│ يجلسون مع أصدقائهم بنفس طريقتنا؟"        │
└─────────────────────────────────────────┘

[✨ ولّد 10 بدائل]    [📚 من مكتبة الهوكس الناجحة]

البدائل المولدة:
1. "هذا النقش عمره 5000 سنة... وهو يرسم لحظتنا الآن"
2. "السومريون يعرفون شيئاً لا تعرفه أنت"
3. "ابتعد عن الشاشة 3 ثواني واسمع هذه القصة"
[+ 7 المزيد]

✓ هذا الهوك يستخدم: Curiosity Gap + Historical Tease
✓ مناسب للجمهور المستهدف
⚠ تأكد من الإيقاع الصوتي في أول ثانيتين
```

عند **📝 السكريبت**:
```
📝 السكريبت

الإطار المختار: 3-Act Mini Story

┌─ Act 1: Setup (0-7s) ───────────────────┐
│ Visual: لقطة قريبة لنقش سومري           │
│ VO: "قبل 5000 سنة، في أرض الرافدين..."  │
│ SFX: صدى قديم                            │
└──────────────────────────────────────────┘

┌─ Act 2: Build (7-22s) ───────────────────┐
│ Visual: أيد تنقش + انتقال لمقهى حديث    │
│ VO: "كان لهم طقس... اجتماع، حديث، دخان" │
│ Music: تصاعد تدريجي                      │
└──────────────────────────────────────────┘

┌─ Act 3: Payoff (22-30s) ─────────────────┐
│ Visual: المنتج ظاهراً بإضاءة ذهبية       │
│ VO: "الطقس باقي. الأسماء تغيرت."         │
│ Logo + CTA: "معسل أحمد - تراث يُعاش"     │
└──────────────────────────────────────────┘

[✨ تحسين] [🔁 إعادة] [📚 قوالب]
```

عند **🎞 ستوري بورد**:
```
🎞 ستوري بورد - 8 لقطات

┌──[1]─┐ ┌──[2]─┐ ┌──[3]─┐ ┌──[4]─┐
│ 🎨   │ │ 🎨   │ │ 🎨   │ │ 🎨   │
│ نقش  │ │ يد    │ │ انتقال│ │ مقهى │
│ ECU  │ │ MCU  │ │ Match │ │ MS   │
│ 0-3s │ │ 3-7s │ │ 7-9s │ │ 9-15s│
└──────┘ └──────┘ └──────┘ └──────┘

ECU = Extreme Close Up | MCU = Medium Close Up | MS = Medium Shot

[✨ ولّد صور مرجعية لكل لقطة بـ AI]
[📤 صدّر كملف PDF لفريق الإنتاج]
```

#### للتصميم الثابت:
```
🖼 محرر التصميم: "5 رموز بابلية على علبتنا"

[Tabs: 💡 الفكرة | ✍ النصوص | 🎨 التوجيه البصري | ✏ الكابشن]

✍ النصوص

العنوان الرئيسي (Headline):
┌────────────────────────────────────┐
│ "5 رموز خفية في علبتك"             │
└────────────────────────────────────┘
[✨ 10 بدائل] [اختبار قوة العنوان: 8/10]

العنوان الفرعي (Subheadline):
┌────────────────────────────────────┐
│ "كل رمز يحكي قصة عمرها آلاف السنين"│
└────────────────────────────────────┘

النص الأساسي (Body):
┌────────────────────────────────────┐
│ "رمز 'غيش' للحياة، 'إنانا' للجمال، │
│ 'شمش' للنور... لكل تفصيلة معنى"    │
└────────────────────────────────────┘

نداء الفعل (CTA):
[اعرف القصة كاملة على ▼]

🎨 التوجيه البصري

التخطيط (Layout): [F-Pattern ▼]
- العنوان أعلى يسار
- الصورة على اليمين
- النص الأساسي أسفل العنوان
- CTA أسفل يمين

نظام الألوان: [60-30-10]
- 60% بنفسجي ملكي (#2D1B69)
- 30% ذهبي (#D4AF37)
- 10% أبيض ناصع (#FAFAFA)

التايبوغرافي:
- Headline: GE Dinar One Bold 48pt
- Body: GE Dinar One Regular 18pt

نمط التصوير:
- لقطة فوقية للمنتج
- إضاءة جانبية درامية
- رموز سومرية بإطار خفيف

[📤 إرسال للمصمم] [📎 إرفاق مرجع]
```

#### للستوري:
```
📱 محرر الستوري: تسلسل 5 فريمات

[Frame 1] [Frame 2] [Frame 3] [Frame 4] [Frame 5]

Frame 1: Hook (3 ثواني)
┌──────────────┐  Text: "تعرف معاني الرموز
│              │         على علبتك؟"
│   صورة العلبة │  
│              │  Sticker: ❓ (Question)
└──────────────┘

Frame 2: Build 1 (4 ثواني)
┌──────────────┐  Text: "رمز 'غيش' = الحياة"
│   Zoom in    │  
│   على الرمز  │  Sticker: 👀 Reveal
└──────────────┘

[+ Frame] [↺] [✨ ولّد بقية الفريمات]

عناصر تفاعلية مقترحة:
☑ Frame 1: Question Sticker
☑ Frame 5: Link Sticker (للمنتج)
☐ Frame 3: Poll
```

---

## 3. مكتبة الفريم وركس (Frameworks Library)

كل فريم ورك عالمي محوّل لأداة تفاعلية.

### 3.1 إطار AIDA (للإعلانات والتصاميم البيعية)

```
🎯 AIDA Framework Builder

A - Attention (الانتباه)
ما الذي سيوقف الإصبع عن التمرير؟
┌───────────────────────────────┐
│ صورة منتج بإضاءة درامية على   │
│ خلفية سومرية                  │
└───────────────────────────────┘
[💡 اقتراحات] [📚 أمثلة ناجحة]

I - Interest (الاهتمام)
لماذا يهتم الجمهور؟
┌───────────────────────────────┐
│ "5 آلاف سنة من الحضارة في كل  │
│ نفس"                          │
└───────────────────────────────┘

D - Desire (الرغبة)
كيف نحرّك الرغبة؟
┌───────────────────────────────┐
│ تجربة رفقاء + جودة + تراث     │
│ يعيش                          │
└───────────────────────────────┘

A - Action (الفعل)
ما الإجراء المطلوب؟
┌───────────────────────────────┐
│ "اطلب الآن من مقاهينا الشريكة"│
└───────────────────────────────┘

[🚀 توليد كل المكونات بناءً على هذا]
```

### 3.2 إطار PAS (Problem-Agitate-Solution)

```
🎯 PAS Framework

Problem (المشكلة)
ما الألم الذي يعيشه جمهورك؟
[المعسل العادي يفقد طعمه بسرعة]

Agitate (تضخيم الألم)
لماذا هذا الألم خطير؟ كيف نضخّمه؟
[تخسر متعة الجلسة، تخسر تجربة الأصدقاء]

Solution (الحل)
كيف يحل منتجك المشكلة؟
[تركيبة ذهبية تحفظ الطعم 4 ساعات]

[✨ توليد سكريبت كامل]
[✨ توليد كابشن]
[✨ توليد منشور كاروسيل]
```

### 3.3 إطار StoryBrand (SB7) لميلر

```
📖 StoryBrand SB7 Framework

1. Character (البطل = العميل، ليس البراند)
من بطل القصة؟ ما الذي يريده؟
[شاب عراقي يبحث عن جلسة استثنائية]

2. Problem (المشكلة)
External: [معسل عادي بنكهة فقيرة]
Internal: [يشعر أن الجلسة ناقصة]
Philosophical: [يستحق تجربة أرقى]

3. Guide (الدليل = البراند)
كيف يثبت البراند تعاطفه + سلطته؟
[تعاطف: "نعرف هذا الشعور"]
[سلطة: "5 سنوات من البحث في النكهات"]

4. Plan (الخطة)
3 خطوات بسيطة للعميل
[1. اختر النكهة المفضلة]
[2. اطلب من أقرب مقهى]
[3. عش التجربة]

5. Call to Action
Direct: [اطلب الآن]
Transitional: [اعرف أكثر]

6. Avoiding Failure
ماذا يخسر إن لم يتصرف؟
[يستمر بتجربة عادية، يحرم نفسه من التراث]

7. Success
كيف ستبدو حياته بعد المنتج؟
[جلسات استثنائية، أصدقاء أكثر، ذكريات]

[🚀 توليد قصة فيديو 60 ثانية]
[🚀 توليد سلسلة منشورات (5 منشورات)]
```

### 3.4 إطار Hook-Story-Offer (Russell Brunson)

```
🎯 Hook-Story-Offer

Hook (الخطّاف): كيف توقف الإبهام؟
[Pattern Interrupt | Bold Claim | Question | Story Tease]
┌────────────────────────────────────┐
│ "ابتعد عن الشاشة 3 ثواني واسمع هذا"│
└────────────────────────────────────┘

Story (القصة): قصة قصيرة شخصية
┌────────────────────────────────────┐
│ "قبل سنتين، حاولنا تذوق 47 نوعاً... │
│ فقط واحد وصل لمعايير أجدادنا"       │
└────────────────────────────────────┘

Offer (العرض): ما تقدمه + لماذا الآن؟
┌────────────────────────────────────┐
│ "أول 100 طلب: علبة الإطلاق الذهبية │
│ بسعر التذوق - 25,000 د.ع فقط"      │
└────────────────────────────────────┘

[🚀 توليد ريل 30 ثانية]
```

### 3.5 إطار BAB (Before-After-Bridge)

```
🎯 BAB Framework

Before (الوضع الحالي السيء)
[جلسة معسل عادية، نكهة سريعة الزوال]

After (الوضع المثالي بعد المنتج)
[جلسة 4 ساعات بنكهة ثابتة]

Bridge (الجسر = منتجك)
[تركيبة معسل أحمد الذهبية]

[🚀 توليد منشور تصميم قبل/بعد]
[🚀 توليد ريل تحول]
```

### 3.6 إطار 4Ps (Promise-Picture-Proof-Push)

```
🎯 4Ps Framework

Promise (الوعد)
[نكهة تدوم 4 ساعات]

Picture (الصورة الذهنية)
[تخيّل: جلسة طويلة بدون إعادة تعبئة]

Proof (الدليل)
[شهادات 50 مقهى شريك + اختبار مخبري]

Push (الدفع للفعل)
[احجز علبة الإطلاق الآن]
```

### 3.7 إطار PASTOR

```
🎯 PASTOR Framework

P - Problem
A - Amplify
S - Story (and Solution)
T - Testimonial
O - Offer
R - Response
```

### 3.8 إطار Hook-Hold-Payoff (للريلز/تيكتوك)

```
🎯 Hook-Hold-Payoff (للفيديو القصير)

Hook (0-3s) - أمسك الانتباه
أنماط مقترحة:
○ Pattern Interrupt
○ Bold Claim
○ Curiosity Gap
○ Visual Surprise
○ Direct Question
○ Number Tease ("3 أشياء...")

Hold (3-20s) - استمر بالقبضة
- معلومة جديدة كل 3-5 ثواني
- تغيير لقطة كل 2-3 ثواني
- بناء توتر متصاعد

Payoff (20-30s) - الدفعة النهائية
- الكشف
- المنتج
- CTA واحد واضح
```

### 3.9 إطار CASA (TikTok-native)

```
🎯 CASA Framework

C - Context (السياق)
ضع المشاهد في مكان وزمان فوراً

A - Action (الفعل)
شيء يحدث، حركة، تطور

S - Story (القصة)
سرد قصير يبني توتراً

A - Aha! (اللحظة)
الكشف، المفاجأة، الفائدة
```

### 3.10 الإطار التصميمي: F-Pattern / Z-Pattern

```
📐 Layout Framework

F-Pattern (للقراءة الكثيفة):
- العين تبدأ من أعلى يسار
- تمرّ أفقياً
- تنزل عمودياً عبر اليسار
- تمرّ أفقياً مرة أخرى
[مناسب للكاروسيل التعليمي]

Z-Pattern (للقراءة الخفيفة):
- أعلى يسار → أعلى يمين
- قطري لأسفل يسار
- أسفل يسار → أسفل يمين
[مناسب للإعلانات بـ CTA واحد]

نظام 60-30-10 (الألوان):
- 60% لون أساسي
- 30% لون ثانوي
- 10% لون مميّز (للـ CTA)

نظام التسلسل البصري (5-3-2):
- 5: أكبر عنصر (Headline)
- 3: العنصر المتوسط (Image/Subheadline)
- 2: العناصر الصغيرة (Body/CTA)

قاعدة الأثلاث (Rule of Thirds):
- ضع العناصر الرئيسية على نقاط التقاطع
```

---

## 4. كتالوج الأدوات (Tools Catalog)

كل أداة من هذه الأدوات قائمة بذاتها، يفتحها كاتب المحتوى من القائمة الجانبية.

### 4.1 أدوات التخطيط الاستراتيجي

| الأداة | الوصف | المخرجات |
|---|---|---|
| **Brand Voice Builder** | يبني نبرة البراند بأسئلة موجّهة | Brand Brief كامل |
| **Audience Persona Builder** | يبني 1-3 شخصيات جمهور | Personas مع pains/goals |
| **Content Pillars Designer** | يقترح 3-5 محاور محتوى | Pillars + topics |
| **Competitor Analyzer** | يحلل منافسين عبر روابط | SWOT + فرص |
| **Trend Hunter** | يستخرج ترندات منصة معينة | قائمة ترندات + كيفية الاستفادة |

### 4.2 أدوات الأفكار

| الأداة | الوصف |
|---|---|
| **Big Idea Generator** | يولد 50 فكرة بناءً على Brand Brief + Pillar + هدف |
| **Topic Calendar Brainstormer** | يولد مواضيع مرتبطة بمناسبات الشهر |
| **Hook Lab** | يولد 20+ هوك بأنماط مختلفة |
| **Headline Tester** | يقيس قوة العنوان (1-10) ويعطي بدائل |

### 4.3 أدوات الفيديو

| الأداة | الوصف |
|---|---|
| **Script Writer** | يكتب سكريبتاً كاملاً بإطار محدد |
| **Storyboard Builder** | يحوّل سكريبت لـ shot list |
| **Voiceover Polisher** | يحسن نص الـ VO ليكون منطوقاً طبيعياً |
| **Music Mood Suggester** | يقترح نوع موسيقى مناسب |
| **B-roll Planner** | يقترح لقطات مساعدة |
| **Thumbnail Concept Generator** | يولد 5 مفاهيم للصورة المصغرة |
| **Video Prompt Generator** (Seedance/Kling) | حسب skill رؤية الموجود |

### 4.4 أدوات التصميم

| الأداة | الوصف |
|---|---|
| **Visual Direction Generator** | يولد brief كامل للمصمم |
| **Color Palette Extractor** | يستخرج بالتة من صورة مرجعية |
| **Color Palette Generator** | يولد بالتة بناءً على mood |
| **Typography Pair Suggester** | يقترح أزواج خطوط متناسقة |
| **Layout Suggester** | يختار التخطيط المناسب (F/Z/Centered) |
| **Image Prompt Generator** (Midjourney/DALL-E) | يولد برومت |
| **Mood Board Builder** | يجمع مراجع بصرية |

### 4.5 أدوات الستوري

| الأداة | الوصف |
|---|---|
| **Story Sequence Builder** | يبني تسلسل 3-7 فريمات |
| **Interactive Element Suggester** | يقترح poll/quiz/slider مناسب |
| **Story Hook Generator** | هوكس مخصصة للفريم الأول |

### 4.6 أدوات الكاروسيل

| الأداة | الوصف |
|---|---|
| **Carousel Outliner** | يقسم فكرة على 6-10 شرائح |
| **Slide Hook Designer** | الشريحة الأولى الخاطفة |
| **Carousel CTA Slide** | تصميم آخر شريحة |

### 4.7 أدوات النصوص النهائية

| الأداة | الوصف |
|---|---|
| **Caption Writer** | يكتب كابشن بنبرة البراند، طول مخصص |
| **Hashtag Researcher** | يبحث 30 هاشتاغ مصنف (mass/niche/branded) |
| **CTA Generator** | يولد 10 صيغ CTA بدرجات إلحاح مختلفة |
| **Emoji Strategist** | يقترح إيموجي مناسب لنبرة البراند |

### 4.8 أدوات الجودة والتحسين

| الأداة | الوصف |
|---|---|
| **Tone Checker** | يفحص النص ضد Brand Voice ويقترح تعديلات |
| **Cultural Sensitivity Check** | يفحص المحتوى للسوق العراقي/العربي |
| **Readability Score** | يقيس سهولة القراءة |
| **A/B Test Designer** | يولد نسختين للاختبار |
| **Performance Predictor** | يتوقع أداء المحتوى بناءً على تاريخي |

### 4.9 أدوات التحليل

| الأداة | الوصف |
|---|---|
| **Post Performance Analyzer** | يحلل لماذا أداء منشور كان جيد/سيء |
| **Best Time to Post Calculator** | يحلل أفضل أوقات النشر للجمهور |
| **Content Gap Finder** | يجد ثغرات في الخطة الشهرية |

---

## 5. الربط الذكي بين الأقسام (Smart Integrations)

### 5.1 من CRM → Content Studio

```
عميل جديد ينشأ في CRM
   ↓
نظام يقترح: "أنشئ Brand Brief الآن؟"
   ↓
عند فتح Brand Brief → استيراد تلقائي:
   - اسم الشركة (من client record)
   - الصناعة
   - المنصات النشطة (إن ذُكرت)
   - تواصل العميل (للموافقات)
```

### 5.2 من Content Plan → Tasks

عند الموافقة على خطة شهرية، يتم تلقائياً:

```
لكل Content Piece:
  - إنشاء مهمة (Task) واحدة على الأقل
  - حسب النوع:
    - Reel → 4 مهام: سكريبت، تصوير، مونتاج، كابشن
    - Static Design → 2 مهمة: نصوص، تصميم
    - Story → 1 مهمة: تنفيذ كامل
    - Carousel → 3 مهام: نصوص، تصميم، مراجعة
  - تعيين المسؤول حسب الدور (designer/editor/writer)
  - حساب deadline تلقائياً (publish_date - lead_time)
  - lead_time محفوظ في إعدادات الشركة (مثلاً: ريل = 5 أيام)
```

### 5.3 من Content Studio → Asset Library

```
عند رفع ملف نهائي على Content Piece:
  → يُحفظ في Asset Library تلقائياً
  → tags: [client, pillar, content_type, month]
  → linked: [project_id, content_piece_id]
  → قابل لإعادة الاستخدام في خطط مستقبلية
```

### 5.4 من Content Studio → Client Portal

```
Content Piece في حالة client_review:
  → يظهر للعميل في portal تلقائياً
  → العميل يفتح، يعلق على timestamp/area
  → يضغط Approve أو Request Revision
  → النظام يعيد القطعة إلى internal_review مع تعديلات العميل
  → revision_count++ (مع ربطه بـ revision_limit في Project)
```

### 5.5 من Content Studio → Calendar Module

```
Content Piece بحالة approved + scheduled_at:
  → يظهر تلقائياً في Content Calendar
  → عند الوصول لـ scheduled_at:
    - إذا كانت المنصة مربوطة بـ API → نشر تلقائي
    - إن لم تكن → إشعار للـ Account Manager للنشر اليدوي
  → بعد النشر → يطلب metrics من API بعد 24h, 7d, 30d
```

### 5.6 من Content Studio → Reports

```
Content Plan بعد انتهاء الشهر:
  → تقرير تلقائي:
    - أعلى 3 منشورات أداءً
    - أفضل محور (pillar)
    - أفضل نوع محتوى
    - أفضل وقت نشر
    - معدل الموافقة من المرة الأولى
    - تجاوزات revision_limit
    - تكلفة الإنتاج التقديرية vs العائد
  → يُرسل تلقائياً للـ Account Manager + العميل
```

### 5.7 من Content Studio → Finance

```
Content Pieces مكتملة في الشهر:
  → تجميع تلقائي تحت Project للعميل
  → إذا كان نوع العقد retainer شهري → تأكيد إصدار الفاتورة الشهرية
  → إذا كان عقد per-project → يضاف للحساب
```

### 5.8 من Content Studio → Equipment

```
Content Piece نوع Reel/Video:
  → عند إنشاء مهمة "تصوير":
    → نظام يقترح المعدات المطلوبة
    → كاتب المحتوى يحجز المعدات مباشرة
    → ربط Equipment Booking بـ Content Piece
```

### 5.9 من AI Generations → Content Studio

```
أي توليد AI لمحتوى:
  → يُحفظ في AI Library
  → عند العودة لخطة شهرية مستقبلية:
    - "إعادة استخدام الفكرة"
    - "تعلّم من أنماط ناجحة سابقة"
  → AI يستفيد من التاريخ في تحسين توليداته
```

---

## 6. مخطط البيانات (Database Schema)

### 6.1 الجداول الجديدة

```sql
-- ====================================================
-- BRAND BRIEFS
-- ====================================================
CREATE TABLE brand_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id) UNIQUE,
  
  brand_name_ar TEXT,
  brand_name_en TEXT,
  brand_story TEXT,
  mission TEXT,
  vision TEXT,
  
  -- Voice
  tone_of_voice TEXT[],
  voice_dos TEXT[],
  voice_donts TEXT[],
  brand_keywords TEXT[],
  banned_words TEXT[],
  
  -- Visual
  primary_colors TEXT[],
  secondary_colors TEXT[],
  fonts JSONB,
  visual_style TEXT[],
  mood_keywords TEXT[],
  
  -- Cultural
  cultural_context TEXT,
  religious_considerations TEXT,
  
  -- Platforms
  active_platforms TEXT[],
  posting_frequency JSONB,
  
  + standard columns
);

-- ====================================================
-- AUDIENCE PERSONAS
-- ====================================================
CREATE TABLE audience_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  brand_brief_id UUID NOT NULL REFERENCES brand_briefs(id),
  
  name TEXT NOT NULL,
  age_range TEXT,
  gender TEXT,
  location TEXT,
  occupation TEXT,
  income_level TEXT,
  
  interests TEXT[],
  pain_points TEXT[],
  goals TEXT[],
  objections TEXT[],
  motivations TEXT[],
  
  preferred_platforms TEXT[],
  content_consumption_habits TEXT,
  
  avatar_url TEXT,
  + standard columns
);

-- ====================================================
-- CONTENT PILLARS
-- ====================================================
CREATE TABLE content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  color TEXT,
  icon TEXT,
  percentage_target INT, -- 0-100
  example_topics TEXT[],
  recommended_formats TEXT[],
  
  + standard columns
);

-- ====================================================
-- CONTENT PLANS
-- ====================================================
CREATE TABLE content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  campaign_id UUID REFERENCES campaigns(id),
  
  title TEXT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'draft',
  -- draft | in_review | approved | active | completed
  
  monthly_objectives JSONB,
  pillar_distribution JSONB,
  content_type_distribution JSONB,
  
  client_approval_status TEXT,
  client_approved_at TIMESTAMPTZ,
  client_approved_by UUID,
  client_revision_count INT DEFAULT 0,
  client_revision_limit INT DEFAULT 2,
  
  total_pieces_planned INT DEFAULT 0,
  total_pieces_published INT DEFAULT 0,
  
  + standard columns,
  
  UNIQUE (company_id, client_id, year, month)
);

-- ====================================================
-- CONTENT PIECES
-- ====================================================
CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  content_plan_id UUID NOT NULL REFERENCES content_plans(id),
  pillar_id UUID REFERENCES content_pillars(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  -- video_long | reel | story | static_design | carousel | gif | podcast | blog_post
  
  platforms TEXT[] NOT NULL,
  
  big_idea TEXT,
  framework_used TEXT,
  framework_data JSONB,
  
  components JSONB,
  -- يحوي حقول مختلفة حسب النوع
  
  caption_ar TEXT,
  caption_en TEXT,
  hashtags TEXT[],
  cta_text TEXT,
  cta_link TEXT,
  
  linked_assets UUID[],
  inspiration_refs JSONB,
  
  stage TEXT NOT NULL DEFAULT 'idea',
  -- idea | in_writing | in_design | in_production | internal_review |
  -- client_review | revision | approved | scheduled | published | failed
  
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  internal_approver_id UUID,
  internal_approved_at TIMESTAMPTZ,
  client_approval_status TEXT,
  client_approved_at TIMESTAMPTZ,
  
  metrics JSONB,
  
  + standard columns
);

-- ====================================================
-- CONTENT REVISIONS (تتبع المراجعات)
-- ====================================================
CREATE TABLE content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  content_piece_id UUID NOT NULL REFERENCES content_pieces(id),
  round_number INT NOT NULL,
  requested_by_user_id UUID NOT NULL,
  requested_by_role TEXT, -- internal | client
  feedback_text TEXT,
  feedback_annotations JSONB, -- timestamps لـ video، x,y للتصميم
  attached_files UUID[],
  status TEXT, -- pending | in_progress | completed
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  
  + standard columns
);

-- ====================================================
-- FRAMEWORKS LIBRARY (مرجع نظامي - مشترك)
-- ====================================================
CREATE TABLE frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 'AIDA', 'PAS', 'SB7', ...
  name_ar TEXT,
  name_en TEXT,
  description TEXT,
  category TEXT, -- copywriting | storytelling | design_layout | video_short
  best_for_content_types TEXT[],
  fields_schema JSONB, -- الحقول التي يطلبها هذا الفريم ورك
  example_input JSONB,
  example_output TEXT,
  is_global BOOLEAN DEFAULT TRUE -- إن كان مرجعاً عالمياً أم خاصاً بشركة
);

-- ====================================================
-- TEMPLATES (قوالب قابلة لإعادة الاستخدام)
-- ====================================================
CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- نفس content_pieces.type
  
  framework_used TEXT,
  framework_data_template JSONB,
  components_template JSONB,
  
  use_count INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_from_piece_id UUID, -- إن أُنشئ من قطعة ناجحة
  
  + standard columns
);

-- ====================================================
-- AI GENERATIONS (تاريخ كل توليد AI)
-- ====================================================
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content_piece_id UUID REFERENCES content_pieces(id),
  
  tool_type TEXT NOT NULL, -- hook_generator | script_writer | ...
  framework_used TEXT,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  
  model_used TEXT, -- claude-opus-4-7 | claude-sonnet-4-6
  tokens_input INT,
  tokens_output INT,
  cost_estimate_usd DECIMAL(10, 6),
  
  user_rating INT, -- 1-5 (للتحسين المستقبلي)
  was_used BOOLEAN DEFAULT FALSE,
  
  + standard columns
);
```

---

## 7. واجهة الاستخدام التفصيلية (Detailed UI Specs)

### 7.1 Layout الأساسي لـ Content Studio

```
┌─────────────────────────────────────────────────────────────┐
│ AgencyOS                                    🔍   🔔   👤    │
├──────┬──────────────────────────────────────────────────────┤
│      │                                                       │
│  📊  │  ► Content Studio                                    │
│  📁  │                                                       │
│  ✏  │  [Tab: 📅 الخطط | 🎨 المحتوى | 🛠 الأدوات | 📚 المكتبة]│
│  🎬  │                                                       │
│  💼  │                                                       │
│  💰  │                                                       │
│  📈  │                                                       │
│  ⚙   │                                                       │
│      │                                                       │
└──────┴──────────────────────────────────────────────────────┘
```

### 7.2 مبادئ الواجهة

| المبدأ | التطبيق |
|---|---|
| **سياق دائم** | لوحة جانبية تظهر دائماً (Brand Brief + Audience) |
| **تنقّل بأقل احتكاك** | Tabs أفقية، تنقّل بـ Cmd+1/2/3 |
| **عمل بصري + نصي** | كل قطعة محتوى لها بطاقة مرئية + تفاصيل |
| **حفظ تلقائي** | كل تغيير يُحفظ تلقائياً (autosave 2s) |
| **يعمل offline** | المسوّدات تُحفظ محلياً ثم تُزامن |
| **Keyboard-first** | كل عمل قابل للاختصار |
| **AI ضمن السياق** | كل حقل له زر "✨ ولّد" بجواره |
| **Undo شامل** | Ctrl+Z يعمل في كل المحرر |

### 7.3 اختصارات لوحة المفاتيح

| Shortcut | الفعل |
|---|---|
| `Cmd+K` | فتح Command Palette (بحث/تنفيذ أي شيء) |
| `Cmd+N` | محتوى جديد |
| `Cmd+P` | خطة جديدة |
| `Cmd+S` | حفظ |
| `Cmd+Enter` | توليد بـ AI في الحقل الحالي |
| `Cmd+/` | تبديل بين المعاينة والتحرير |
| `Cmd+Shift+P` | افتح Persona |
| `Cmd+Shift+B` | افتح Brand Brief |
| `Cmd+Shift+F` | اختر Framework |
| `Cmd+Shift+R` | إرسال للمراجعة |
| `Tab` | الحقل التالي |

### 7.4 Command Palette (مهم جداً)

نقطة دخول واحدة لكل شيء:

```
┌─────────────────────────────────────────────┐
│ 🔍 ماذا تريد أن تفعل؟                       │
├─────────────────────────────────────────────┤
│ ⌨ "ولّد هوك"                                 │
│                                              │
│ 🛠 الأدوات                                   │
│   ✨ مولد الأفكار الكبيرة                    │
│   🪝 مختبر الهوكس                            │
│   📝 كاتب السكريبت                          │
│                                              │
│ 📅 الخطط الأخيرة                            │
│   📋 معسل أحمد - يناير 2026                 │
│   📋 السلامي - ديسمبر 2025                  │
│                                              │
│ 🎨 محتوى أخير                               │
│   🎬 ريل: تاريخ النرجيلة                    │
│   🖼 تصميم: 5 رموز بابلية                  │
│                                              │
│ ⚡ إجراءات سريعة                             │
│   ➕ خطة جديدة                              │
│   ➕ محتوى جديد                             │
│   📤 نسخ من قالب                            │
└─────────────────────────────────────────────┘
```

---

## 8. سير العمل الكامل (End-to-End Workflow)

### مثال حقيقي: إعداد خطة معسل أحمد لشهر يناير

#### اليوم 1: التحضير (15 دقيقة)
1. كاتب المحتوى يفتح Content Studio
2. يضغط `Cmd+P` → "خطة جديدة"
3. يختار العميل: معسل أحمد
4. يختار الشهر: يناير 2026
5. يربطها بحملة "إطلاق الخط الذهبي" (موجودة من CRM)
6. النظام يحمّل تلقائياً:
   - Brand Brief
   - 3 شخصيات جمهور
   - 4 محاور محتوى
   - تفضيلات النشر

#### اليوم 1: الأهداف والتوزيع (10 دقائق)
7. يحدد الهدف: زيادة التفاعل بـ 25%
8. يضبط التوزيع: 8 ريلز / 12 تصميم / 25 ستوري / 4 كاروسيل
9. AI يقترح توزيعاً متوازناً عبر المحاور

#### اليوم 1: توليد الأفكار (30 دقيقة)
10. يضغط "✨ توليد 50 فكرة"
11. AI يولّد 50 فكرة مرتبة حسب:
    - Brand Brief (نبرة، جمهور، ثقافة)
    - Pillar (التراث / التجربة / الشركاء / العروض)
    - النوع المناسب (لا يقترح ريل لشيء يعمل كتصميم)
    - فعالية مدروسة (يستخدم سياق الشركة من خططها السابقة)
12. يختار 30 فكرة بـ checkbox

#### اليوم 1: التقويم (10 دقائق)
13. AI يوزع الـ 30 فكرة على أيام الشهر بناءً على:
    - أفضل أوقات النشر للجمهور
    - تنوع الأنواع يومياً
    - المناسبات (رأس السنة، عاشوراء إن وقع، إلخ)
    - عدم تكرار محور لنفس اليوم
14. يعدل بالسحب والإفلات
15. يضغط "🚀 إنشاء الخطة"

**النظام تلقائياً:**
- ✅ ينشئ 30 Content Piece بحالة `idea`
- ✅ يخصص لكل قطعة pillar/type/scheduled_date
- ✅ يرسل إشعاراً للحساب مدير ليراجع
- ✅ ينشئ مهام (tasks) فارغة (تتفعّل عند بدء العمل)

#### اليوم 2-3: العمل على القطع (الكاتب يعمل قطعة قطعة)

كل صباح، يفتح "محتوى ينتظرني":

**القطعة الأولى - ريل: "كيف كان السومريون يستمتعون؟"**

1. يفتحها → يرى السياق الكامل (Brand Brief على اليمين)
2. ينقر تاب "💡 الفكرة" → يكتب Big Idea أو يضغط ✨
3. ينتقل لتاب "🪝 الهوك" → يستخدم Hook Lab
   - يولد 10 هوكس
   - يختار: "ابتعد عن الشاشة 3 ثواني واسمع هذا"
4. ينتقل لتاب "📝 السكريبت" → يختار Hook-Story-Payoff
   - الأداة تطلب منه: ما السبب؟ ما القصة؟ ما النهاية؟
   - يكتب → يضغط "✨ توليد سكريبت كامل"
   - السكريبت ينتج بـ 3 acts، توقيتات، VO + visual notes
5. ينتقل لتاب "🎞 ستوري بورد"
   - الأداة تحوّل السكريبت لـ 8 لقطات
   - يضيف ملاحظات على كل لقطة
   - يضغط "✨ توليد صور مرجعية" → AI يولد thumbnails
6. ينتقل لتاب "🎵 الموسيقى"
   - يكتب: "موسيقى تراثية تتحول لمعاصرة"
   - الأداة تقترح 5 تراكات من المكتبة + روابط
7. ينتقل لتاب "✏ الكابشن"
   - يضغط ✨ → يولد كابشن بنبرة البراند
   - ✨ يضيف 30 هاشتاغ مصنفة
8. حالة القطعة تتحول إلى `in_writing` → `internal_review`
9. يضغط "📤 إرسال للإنتاج"
   - تتحول لـ `in_production`
   - تنتشر مهام لفريق الإنتاج تلقائياً:
     - مهمة للمصور: "تصوير ريل تراثي - 5 يناير"
     - مهمة للمصمم: "تصميم thumbnail"
     - مهمة لمحرر الفيديو: "مونتاج بناءً على الستوري بورد"
   - تُحجز معدات تلقائياً (من اقتراح الأداة)

**القطعة الثانية - تصميم: "5 رموز بابلية على علبتنا"**

التدفق مختلف:
1. تاب "💡 الفكرة"
2. تاب "✍ النصوص" → Headline / Subheadline / Body / CTA
3. تاب "🎨 التوجيه البصري" → Layout / Colors / Typography / Mood
4. تاب "✏ الكابشن"
5. إرسال للمصمم بـ brief كامل

#### اليوم 5-10: الإنتاج (الفريق يشتغل)
- المصورون والمصممون والمحررون يعملون
- كل قطعة عند جاهزيتها → ترفع للنظام
- تتحول لحالة `internal_review`

#### اليوم 11-12: المراجعة الداخلية
- Creative Director يراجع
- يوافق أو يطلب تعديل
- عند الموافقة → `client_review`

#### اليوم 13-14: مراجعة العميل
- العميل يدخل portal
- يرى الخطة الشهرية كاملة + كل قطعة
- يعلق على فيديو في timestamp 0:14 → "أريد تكبير الشعار هنا"
- النظام يحوّل القطعة لـ `revision`، يفتح revision_round 1

#### اليوم 15: التعديل والموافقة النهائية
- التعديلات تُنفذ
- تعود `client_review` → `approved` → `scheduled`

#### بعد ذلك: النشر
- في الموعد، النظام إما:
  - ينشر تلقائياً (إذا API مربوط)
  - يرسل تذكير للحساب مدير

#### بعد النشر بـ 24h / 7d / 30d
- النظام يجلب metrics
- يحدّث performance على مستوى:
  - القطعة
  - الخطة الشهرية
  - الـ Pillar
  - العميل
- تقرير شهري يُرسل تلقائياً نهاية الشهر

---

## 9. ميزات متقدمة (Advanced Features)

### 9.1 Smart Suggestions أثناء الكتابة

أثناء كتابة كاتب المحتوى، تظهر اقتراحات ذكية:

```
"أكتب: قبل 5000 سنة..."
↓
💡 اقتراح: الفقرة تشبه فيديو ناجح سابق ("تاريخ النرجيلة" - 250K views)
   هل تريد رؤية هيكله؟
```

### 9.2 Brand Voice Enforcement

كل توليد AI أو كتابة يدوية يُفحص ضد Brand Voice:

```
كتب: "خصم رهيب لفترة محدودة!!!"
   ↓
⚠ تحذير: Brand Voice يقول "نتجنب الإلحاح المبالغ"
   اقتراح: "عرض الإطلاق - متوفر هذا الشهر"
```

### 9.3 Content Recycling Engine

محرّك إعادة تدوير المحتوى الناجح:

```
بعد 90 يوماً من نشر منشور حقق أداءً عالياً:
   ↓
🔄 اقتراح: "هذا المنشور حقق 50K تفاعل في أكتوبر.
    أعد استخدامه بصياغة جديدة لخطة فبراير؟"
   ↓
يفتح القطعة → يستبدل الكابشن والتصميم → ينشر كجديد
```

### 9.4 Cross-Client Insight (للوكالة فقط)

```
"خطة فبراير لمعسل أحمد"
   ↓
💡 رؤية الوكالة: "محور 'التراث' حقق أعلى أداء عبر 3 عملاء
    مختلفين. ينصح بزيادة وزنه إلى 40%."
```

### 9.5 Trend Sync

ربط مع منصات الترند:

```
TikTok Trends:
  ⬆ صوت "X" في تصاعد - 40% من الفيديوهات الناجحة
   اقتراح: استخدمه في ريل "تاريخ النرجيلة"
```

### 9.6 A/B Test Automation

```
لقطة محتوى:
  → توليد نسختين (caption A vs B / hook A vs B)
  → نشر كل نسخة على 50% جمهور
  → النظام يجمع النتائج بعد 48h
  → يعتمد الأفضل تلقائياً
  → يحفظ التعلم في "Brand Insights"
```

### 9.7 Content Health Score

كل خطة شهرية تحصل على درجة صحة:

```
خطة معسل أحمد - يناير
─────────────────────
Health Score: 87/100

✅ توازن المحاور: 95/100
✅ تنوع الأنواع: 90/100
⚠ تنوع المنصات: 70/100 (تركيز زائد على Instagram)
✅ Brand Voice consistency: 95/100
✅ هاشتاغات بحثية: 85/100
⚠ CTAs: 75/100 (3 منشورات بدون CTA واضح)
```

### 9.8 Asset Reuse Intelligence

```
عند طلب صورة/مرجع:
  → "لديك أصول مشابهة في المكتبة:
     - من خطة نوفمبر: 3 صور تراثية
     - من معرض النجف: 5 صور بوث
     استخدم أحدها بدل التصوير الجديد؟"
```

---

## 10. الأمان والصلاحيات

### 10.1 من يستطيع ماذا؟

| الفعل | Owner | Admin | Creative Director | Content Writer | Designer | Editor | Account Mgr | Client |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| إنشاء Brand Brief | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| إنشاء Plan | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| تعديل Content Piece | ✅ | ✅ | ✅ | ✅ | ✅* | ✅* | ❌ | ❌ |
| الموافقة الداخلية | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| موافقة العميل | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| نشر | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| استخدام AI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| رؤية التقارير | ✅ | ✅ | ✅ | محدود | ❌ | ❌ | ✅ | ✅ |

* فقط على القطع المعيّنة لهم

---

## 11. نصائح للتنفيذ في Claude Code

### 11.1 ترتيب البناء

```
1. Brand Briefs + Personas + Pillars (foundation)
2. Content Plan + Wizard
3. Content Piece editor (basic)
4. Frameworks library + tools
5. AI generators (واحد واحد)
6. Smart integrations (CRM/Tasks/Assets)
7. Client portal integration
8. Calendar + scheduling
9. Analytics + reports
10. Advanced features (recycling, A/B, health score)
```

### 11.2 نقاط حرجة

- **Frameworks Library**: تُحفظ كـ JSON Schema لكل فريم ورك. الواجهة تُولَّد ديناميكياً من Schema. هكذا إضافة فريم ورك جديد لا تحتاج تعديل كود.
- **AI Tools**: كل أداة لها prompt template مخزن في DB، قابل للتعديل بدون deployment.
- **Component Schema**: حقل `components` في `content_pieces` يكون JSON مرن، يتغير حسب النوع. النظام يستخدم JSON Schema للتحقق.
- **Stage Transitions**: كل تحوّل حالة يجب أن يمرّ عبر state machine صارمة (XState مناسبة).

---

## 12. المخرجات النهائية المتوقعة

### من النظام للكاتب:
- **Brand Brief** كامل لكل عميل (مرة واحدة)
- **خطة شهرية** كاملة في 1-2 ساعة عمل (بدلاً من يومين)
- **30+ قطعة محتوى** بفريم ورك واضح، نصوص جاهزة، تعليمات إنتاج

### من النظام للعميل:
- **عرض شهري** بصري كامل في Portal
- **موافقة بنقرة واحدة** أو ملاحظات محددة
- **تقرير أداء شهري** تلقائي

### من النظام للوكالة:
- **توحيد المعرفة** عبر الفرق
- **تقليل الأخطاء** بالـ Brand Voice enforcement
- **سرعة 3x** في إنتاج الخطط
- **تعلّم تراكمي** عبر الزمن

---

## END OF CONTENT STUDIO SPEC

---

## ملحق: كل الفريم وركس المدعومة (للمرجعية)

### Copywriting Frameworks
- AIDA (Attention, Interest, Desire, Action)
- PAS (Problem, Agitate, Solution)
- BAB (Before, After, Bridge)
- 4Ps (Promise, Picture, Proof, Push)
- FAB (Features, Advantages, Benefits)
- PASTOR (Problem, Amplify, Story, Testimonial, Offer, Response)
- The 4Us (Useful, Urgent, Unique, Ultra-specific)
- AIDPPC (Attention, Interest, Description, Persuasion, Proof, Close)
- QUEST (Qualify, Understand, Educate, Stimulate, Transition)

### Storytelling Frameworks
- StoryBrand SB7 (Donald Miller)
- Hero's Journey (Joseph Campbell)
- Pixar Storytelling (Once upon a time...)
- 3-Act Structure
- Freytag's Pyramid
- Save the Cat Beat Sheet
- The Story Spine

### Short-Form Video Frameworks (Reels/TikTok/Shorts)
- Hook-Hold-Payoff
- Hook-Story-Offer (Russell Brunson)
- CASA (Context, Action, Story, Aha)
- The Pattern Interrupt
- The Reverse Hook
- The Loop (ending ties to beginning)
- The List Format ("3 أشياء...")
- The Tutorial Format
- The Day in Life Format
- The Comparison Format

### Design Layout Frameworks
- F-Pattern (text-heavy)
- Z-Pattern (CTA-focused)
- Rule of Thirds
- Golden Ratio
- 60-30-10 Color Rule
- 5-3-2 Visual Hierarchy
- Whitespace Principles
- Gestalt Principles (Proximity, Similarity, Closure)
- Visual Weight Distribution

### Carousel Frameworks
- Hook → Build → Build → Build → CTA (5-slide)
- Problem → 5 Solutions → CTA (7-slide)
- Listicle (1 → 2 → 3... → CTA)
- Story Arc Carousel (3-act)
- Comparison (Before/After/Why)

### Story Frameworks
- Quick Hook → Build → CTA (3-frame)
- Tease → Reveal → Action (4-frame)
- Question → Build Tension → Answer (5-frame)
- Behind-the-Scenes Series
- Day-in-the-Life

كل واحد من هؤلاء يصبح أداة تفاعلية بحقول إدخال + ✨ توليد ذكي + خرج جاهز للإنتاج.
