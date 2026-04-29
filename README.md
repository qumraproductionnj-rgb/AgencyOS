# 🚀 AgencyOS — Build Package

> حزمة بناء كاملة لنظام AgencyOS — منصة SaaS متعددة المستأجرين لشركات الإنتاج الفني والوكالات الإبداعية.

---

## 📦 محتويات الحزمة

```
AgencyOS/
├── 📄 README.md                          ← أنت هنا (ابدأ من هذا الملف)
├── 📄 CLAUDE.md                          ← دليل Claude Code الدائم (لا تحذفه)
│
├── 📁 docs/                              ← كل المواصفات والوثائق
│   ├── AgencyOS_MasterSpec.md           ← المواصفة الرئيسية للنظام
│   ├── AgencyOS_ContentStudio.md        ← مواصفة قسم Content Studio
│   ├── TASKS.md                          ← 72 مهمة مرتبة في 5 مراحل
│   ├── PROGRESS.md                       ← متعقب التقدم (يحدّثه Claude Code)
│   ├── DECISIONS.md                      ← قرارات معمارية موثقة
│   ├── SETUP_GUIDE.md                    ← دليل تثبيت من الصفر
│   └── PROMPT_TEMPLATES.md               ← 16 قالب برومت جاهز
│
├── 📁 prompts/                           ← مكتبة برومتات AI داخل النظام
│   └── AI_PROMPTS_LIBRARY.md            ← 20 أداة AI مع برومتاتها
│
├── 📁 schemas/                           ← JSON Schemas لأُطر العمل
│   └── frameworks.json                   ← AIDA, PAS, BAB, SB7, إلخ
│
├── 📁 configs/                           ← ملفات الإعداد
│   ├── .env.example                      ← متغيرات البيئة الكاملة
│   ├── docker-compose.yml                ← خدمات التطوير المحلية
│   └── .gitignore                        ← قائمة الإهمال الشاملة
│
└── 📁 scripts/                           ← السكريبتات
    ├── init-db.sql                       ← تهيئة PostgreSQL
    └── github-actions-ci.yml             ← CI workflow
```

---

## 🎯 نظرة سريعة: ما الذي ستبنيه؟

**AgencyOS** هو نظام متكامل يدير:

- **HR كامل** — موظفون، حضور بـ GPS، إجازات، رواتب، أداء
- **CRM** — leads، عملاء، deals، حملات
- **Sales** — quotations، invoices، payments (دعم IQD + USD)
- **Projects** — مشاريع، tasks، revisions، time tracking
- **Content Studio** — خطط محتوى، AI tools (20 أداة)، frameworks (40+)
- **Client Portal** — مراجعة العملاء، اعتمادات، تعليقات على الفيديو/الصور
- **Equipment** — معدات، حجوزات، صيانة (للإنتاج)
- **Exhibitions** — معارض، بوثات، مالية (مثل تجربة معرض النجف)
- **Multi-tenant SaaS** — اشتراكات، billing، super admin

**اللغة:** عربي + إنجليزي (RTL كامل)
**العملة:** IQD + USD
**الموقع الأمثل للجمهور:** السوق العراقي/العربي

---

## 🚦 ابدأ هنا — الترتيب المُلزِم

### الخطوة 0: قبل أي شيء (ساعة واحدة)

1. **اقرأ هذا الـ README كاملاً**
2. **اقرأ `docs/SETUP_GUIDE.md`** — تجهيز البيئة
3. **اقرأ `docs/AgencyOS_MasterSpec.md`** — المواصفة الكاملة (60-90 دقيقة)
4. **اقرأ `docs/AgencyOS_ContentStudio.md`** — قسم Content Studio
5. **اقرأ `docs/TASKS.md`** — خريطة الطريق (15 دقيقة)

> ⚠️ لا تتخطّ هذه الخطوة. كل ساعة تقضيها في القراءة الآن توفّر عليك 10 ساعات تخبّط لاحقاً.

---

### الخطوة 1: تجهيز البيئة (نصف يوم)

اتبع `docs/SETUP_GUIDE.md` خطوة بخطوة:

- [ ] تثبيت Git, Node.js (via nvm), pnpm, Docker, VS Code, GitHub CLI
- [ ] تثبيت Antigravity
- [ ] إنشاء حساب Anthropic + الحصول على **مفتاحين**:
  - `AgencyOS-Development` (لـ Claude Code)
  - `AgencyOS-Production-AI` (للنظام نفسه)
- [ ] إنشاء حساب Cloudflare + R2 bucket
- [ ] إنشاء مستودع GitHub خاص

✅ **معيار النجاح:** كل أوامر الفحص في الجزء الثالث من SETUP_GUIDE تنجح.

---

### الخطوة 2: تجهيز المشروع (15 دقيقة)

```bash
cd ~/Documents
mkdir AgencyOS && cd AgencyOS
git init && git branch -M main
```

ضع ملفات هذه الحزمة في الأماكن المحددة:

| ضع هذا الملف | في هذا المكان |
|---|---|
| `CLAUDE.md` | جذر المشروع |
| `README.md` | جذر المشروع |
| كل ملفات `docs/` | `docs/` |
| كل ملفات `prompts/` | `prompts/` |
| كل ملفات `schemas/` | `schemas/` |
| `configs/.env.example` | جذر المشروع (احذف البادئة `configs/`) |
| `configs/docker-compose.yml` | جذر المشروع |
| `configs/.gitignore` | جذر المشروع |
| `scripts/init-db.sql` | `scripts/` |
| `scripts/github-actions-ci.yml` | `.github/workflows/ci.yml` |

ثم:

```bash
cp .env.example .env
# عدّل .env بقيمك الفعلية
git add .
git commit -m "chore: initial spec and instructions"
gh repo create AgencyOS --private --source=. --push
```

---

### الخطوة 3: أول جلسة Claude Code (ساعة)

افتح Antigravity → Open Folder → AgencyOS

في chat Claude Code، الصق **PROMPT 00** من `docs/PROMPT_TEMPLATES.md`.

سيقرأ Claude Code الملفات ويؤكد فهمه قبل البدء.

ثم الصق **PROMPT 01** مع `TASK_ID = 0.1` لبدء المهمة الأولى.

---

### الخطوة 4: حلقة العمل اليومية

كل يوم، اتبع هذه الحلقة:

```
1. صباحاً: PROMPT 02 (Daily Startup)
2. أثناء العمل: PROMPT 01 لكل مهمة جديدة
3. عند العلق: PROMPT 04
4. عند انتهاء مهمة: PROMPT 03
5. نهاية الأسبوع: PROMPT 15
```

كل البرومتات في `docs/PROMPT_TEMPLATES.md`.

---

## 📊 الجدول الزمني المتوقع

بمعدل **2-4 ساعات/يوم**:

| المرحلة | المدة | المخرجات |
|---|---|---|
| Phase 0 — Setup | 1 أسبوع | بيئة تطوير كاملة |
| Phase 1 — Foundation | 3-4 أسابيع | تسجيل دخول + موظفين + GPS check-in |
| Phase 2 — Core Operations | 4-5 أسابيع | مشاريع + CRM + فواتير + HR |
| Phase 3 — Creative | 5-6 أسابيع | Content Studio + AI + Client Portal |
| Phase 4 — SaaS | 3 أسابيع | اشتراكات + super admin + إطلاق |
| **الإجمالي** | **~16-19 أسبوع** | **منصة SaaS كاملة قابلة للبيع** |

---

## 🎓 ملاحظات حرجة

### 1. لا تتخطّ المراحل
كل مرحلة تبني على التي قبلها. تخطّي مرحلة = فوضى لاحقاً.

### 2. لا تجمع المهام
كل مهمة في `TASKS.md` صُمّمت لتُنجز في جلسة واحدة (1-2 ساعة). جمع مهمتين = إنتاج أضعف.

### 3. اختبر قبل الانتقال
كل مهمة لها acceptance criteria. لا تصدّق Claude Code إن قال "تم" بدون تشغيل tests.

### 4. commit بانتظام
كل sub-feature = commit. لا تنتظر "ينتهي اليوم".

### 5. اطلب التوقف عند الشك
إن أحسست أن Claude Code يخمّن business logic — أوقفه فوراً واسأله ليسألك.

### 6. راقب التكلفة
- $50-100/شهر معقول
- إن تجاوز $200 → أنت تستخدم بشكل غير فعال (راجع PROMPT_TEMPLATES)

---

## 🆘 عندما تعلق

| المشكلة | الحل |
|---|---|
| Claude Code يخمّن ولا يسأل | استخدم PROMPT 04 |
| Claude Code يكسر اشياء عاملة | استخدم PROMPT 06 (Refactor) قبل التعديل |
| لا تفهم الكود | استخدم PROMPT 14 (Explain) |
| الـ tests تفشل | استخدم PROMPT 05 (Bug Report) |
| الأداء سيء | استخدم PROMPT 12 (Performance) |
| تشك في الأمان | استخدم PROMPT 11 (Security Review) |

---

## 📞 إذا احتجت لتعديل المواصفات

كلما تطورت رؤيتك للنظام، عدّل ملفات `docs/`:

- **تعديل ميزة موجودة** → عدّل في `MasterSpec.md` + أضف ADR في `DECISIONS.md`
- **إضافة ميزة جديدة** → أضف في `MasterSpec.md` + أنشئ tasks جديدة في `TASKS.md`
- **تغيير قرار معماري** → أنشئ ADR جديد في `DECISIONS.md` يُلغي القديم

**القاعدة:** Claude Code يثق بالملفات. غيّر الملفات → سيتبع التغيير.

---

## ✅ Checklist البدء (انسخه واملأه)

### قبل أول جلسة Claude Code:

- [ ] قرأت SETUP_GUIDE.md
- [ ] ثبّتت كل البرامج (الأمر `git --version` يعمل)
- [ ] حصلت على Anthropic API keys (الاثنين)
- [ ] حصلت على Cloudflare R2 credentials
- [ ] أنشأت GitHub repo
- [ ] قرأت MasterSpec.md (على الأقل التصفح السريع)
- [ ] قرأت ContentStudio.md
- [ ] فهمت TASKS.md
- [ ] فتحت المشروع في Antigravity
- [ ] جرّبت PROMPT 00

### بعد كل مهمة:

- [ ] tests تعمل (`pnpm test`)
- [ ] typecheck نظيف (`pnpm typecheck`)
- [ ] lint نظيف (`pnpm lint`)
- [ ] PROGRESS.md محدّث
- [ ] git commit + push
- [ ] الـ acceptance criteria محقق

---

## 🎯 الهدف النهائي

في نهاية الـ 4 أشهر، ستملك:

1. **منصة SaaS تجارية كاملة** قابلة للبيع لشركات أخرى
2. **نظام داخلي لرؤية** يدير كل عمليات الشركة
3. **مكتبة AI tools** متخصصة في السوق العربي
4. **معرفة تقنية** كافية لفهم كيف يعمل النظام
5. **أصل رقمي** له قيمة سوقية حقيقية

---

## 💎 نصيحة أخيرة

أنت لا تبني فقط برنامجاً. أنت تبني **عملية تفكير منظمة** حول إدارة الشركات الإبداعية في السوق العراقي.

كل قرار تتخذه الآن سيؤثر على شركات قد تستخدم هذا النظام لسنوات.

خذ الوقت. اسأل Claude Code أكثر مما يسألك. لا ترضَ بـ "تقريباً". اطلب الكمال في الأشياء الحرجة (الأمان، تعدد المستأجرين، البيانات).

التوفيق! 🚀
