export interface Article {
  id: string
  categoryId: string
  titleAr: string
  titleEn: string
  readMinAr: number
  readMinEn: number
  contentAr: string
  contentEn: string
}

export interface Category {
  id: string
  icon: string
  titleAr: string
  titleEn: string
}

export const CATEGORIES: Category[] = [
  { id: 'start', icon: '🚀', titleAr: 'البداية السريعة', titleEn: 'Quick Start' },
  { id: 'team', icon: '👥', titleAr: 'إدارة الفريق', titleEn: 'Team Management' },
  { id: 'projects', icon: '💼', titleAr: 'المشاريع والمهام', titleEn: 'Projects & Tasks' },
  { id: 'invoices', icon: '💰', titleAr: 'الفواتير والمدفوعات', titleEn: 'Invoices & Payments' },
  { id: 'content', icon: '🎨', titleAr: 'Content Studio', titleEn: 'Content Studio' },
  { id: 'settings', icon: '⚙️', titleAr: 'الإعدادات', titleEn: 'Settings' },
]

export const ARTICLES: Article[] = [
  // ── Quick Start ────────────────────────────────────────────────────────────
  {
    id: 'getting-started',
    categoryId: 'start',
    titleAr: 'كيف تبدأ مع Vision OS',
    titleEn: 'How to Get Started with Vision OS',
    readMinAr: 5,
    readMinEn: 5,
    contentAr: `## الخطوة ١: أنشئ حسابك

بعد قبول دعوة Beta، ستصلك رسالة بريد إلكتروني تحتوي على رابط إنشاء الحساب. انقر الرابط وأدخل:
- اسم شركتك
- اسمك الكامل
- كلمة مرور قوية

## الخطوة ٢: أضف موظفيك

من القائمة الجانبية، اذهب إلى **الموظفون** ← **إضافة موظف**. أدخل:
- الاسم الكامل
- البريد الإلكتروني
- القسم والمنصب

سيصل الموظف دعوة بريد إلكتروني للانضمام.

## الخطوة ٣: أضف عملاءك

اذهب إلى **العملاء** ← **عميل جديد**. أضف:
- اسم الشركة
- معلومات التواصل
- نوع العمل

## الخطوة ٤: ابدأ مشروعك الأول

اذهب إلى **المشاريع** ← **مشروع جديد**. حدد:
- اسم المشروع
- العميل المرتبط
- تاريخ البداية والنهاية
- أعضاء الفريق

## الخطوة ٥: استخدم أدوات AI

اذهب إلى **AI Tools** واكتشف 20+ أداة للمحتوى والتصميم والكتابة الإبداعية.`,
    contentEn: `## Step 1: Create Your Account

After accepting your Beta invitation, you'll receive an email with your account setup link. Click it and enter:
- Your company name
- Your full name
- A strong password

## Step 2: Add Your Team

From the sidebar, go to **Employees** → **Add Employee**. Enter:
- Full name
- Email address
- Department and role

They'll receive an invitation email to join.

## Step 3: Add Your Clients

Go to **Clients** → **New Client**. Add:
- Company name
- Contact information
- Business type

## Step 4: Start Your First Project

Go to **Projects** → **New Project**. Set:
- Project name
- Linked client
- Start and end dates
- Team members

## Step 5: Use AI Tools

Go to **AI Tools** and discover 20+ tools for content, design ideas, and creative writing.`,
  },
  {
    id: 'gps-checkin',
    categoryId: 'team',
    titleAr: 'كيف تسجل حضور الموظفين بـ GPS',
    titleEn: 'How to Use GPS Attendance',
    readMinAr: 3,
    readMinEn: 3,
    contentAr: `## إعداد مواقع العمل

أولاً، عليك إضافة مواقع العمل المسموح بها:

١. اذهب إلى **الإعدادات** ← **مواقع العمل**
٢. انقر **إضافة موقع**
٣. أدخل الاسم والعنوان
٤. حدد الموقع على الخريطة
٥. اضبط نطاق الحضور (الافتراضي: 100 متر)

## تسجيل الحضور

يستطيع الموظف تسجيل الحضور من:
- تطبيق Vision OS على هاتفه
- صفحة **تسجيل الحضور** في المتصفح

النظام يتحقق تلقائياً أن الموظف داخل نطاق الموقع المحدد.

## حالة "خارج النطاق"

إذا كان الموظف خارج النطاق، يظهر تحذير ويُسجَّل الحضور كـ "بعيد" مع ملاحظة.

## تقارير الحضور

اذهب إلى **التقارير** ← **HR** لعرض:
- خريطة الحضور الشهرية
- إجمالي ساعات كل موظف
- سجل التأخيرات والغيابات`,
    contentEn: `## Setting Up Work Locations

First, add the allowed work locations:

1. Go to **Settings** → **Work Locations**
2. Click **Add Location**
3. Enter the name and address
4. Pin the location on the map
5. Set the radius (default: 100 meters)

## Checking In

Employees can check in from:
- The Vision OS mobile app
- The **Attendance** page in the browser

The system automatically verifies the employee is within the allowed radius.

## Out-of-Range Status

If the employee is out of range, a warning shows and attendance is logged as "remote" with a note.

## Attendance Reports

Go to **Reports** → **HR** to view:
- Monthly attendance heatmap
- Total hours per employee
- Late and absent records`,
  },
  {
    id: 'create-invoice',
    categoryId: 'invoices',
    titleAr: 'كيف تنشئ فاتورة وترسلها',
    titleEn: 'How to Create and Send an Invoice',
    readMinAr: 4,
    readMinEn: 4,
    contentAr: `## إنشاء فاتورة جديدة

١. اذهب إلى **الفواتير** ← **فاتورة جديدة**
٢. اختر العميل من القائمة
٣. أضف البنود:
   - وصف الخدمة
   - الكمية
   - سعر الوحدة (بالدينار العراقي أو الدولار)
٤. النظام يحسب تلقائياً الإجمالي والضريبة

## تصدير PDF

انقر **طباعة PDF** لفتح نافذة الطباعة مع الفاتورة مُنسَّقة بالعربية أو الإنجليزية.

## إرسال بالبريد الإلكتروني

انقر **إرسال** وأدخل بريد العميل. سيصله نسخة PDF من الفاتورة مع رابط للدفع (إذا كان Stripe مفعَّلاً).

## متابعة الفواتير

من صفحة **الفواتير** يمكنك تتبع:
- **معلقة**: لم تُرسَل بعد
- **مرسلة**: في انتظار الدفع
- **مدفوعة**: مكتملة
- **متأخرة**: تجاوزت تاريخ الاستحقاق

## إشعار تذكير

للفواتير المتأخرة، انقر **إرسال تذكير** لإبلاغ العميل تلقائياً.`,
    contentEn: `## Creating a New Invoice

1. Go to **Invoices** → **New Invoice**
2. Select the client from the dropdown
3. Add line items:
   - Service description
   - Quantity
   - Unit price (IQD or USD)
4. The system auto-calculates totals and tax

## Export PDF

Click **Print PDF** to open the print dialog with the invoice formatted in Arabic or English.

## Send by Email

Click **Send** and enter the client's email. They'll receive a PDF of the invoice with a payment link (if Stripe is enabled).

## Tracking Invoices

From the **Invoices** page, track:
- **Draft**: Not sent yet
- **Sent**: Awaiting payment
- **Paid**: Completed
- **Overdue**: Past due date

## Send a Reminder

For overdue invoices, click **Send Reminder** to automatically notify the client.`,
  },
  {
    id: 'content-studio',
    categoryId: 'content',
    titleAr: 'كيف تستخدم Content Studio',
    titleEn: 'How to Use Content Studio',
    readMinAr: 4,
    readMinEn: 4,
    contentAr: `## ما هو Content Studio؟

Content Studio هو نظام متكامل لإدارة المحتوى الرقمي يشمل:
- التخطيط الشهري للمحتوى
- توليد الأفكار بالذكاء الاصطناعي
- متابعة حالة كل قطعة محتوى
- الموافقة من قِبَل العملاء

## إنشاء خطة محتوى

١. اذهب إلى **Content Studio** ← **خطط جديدة**
٢. اختر العميل والشهر
٣. حدد المنصات (إنستجرام، تيك توك، يوتيوب...)
٤. أضف عدد القطع المطلوبة لكل منصة

## توليد أفكار بـ AI

في قطعة المحتوى، انقر **توليد بـ AI** وأدخل:
- الموضوع أو الكلمة المفتاحية
- نبرة المحتوى (رسمي/مرح/تثقيفي)

سيقترح النظام عنوانًا وكابشنًا وهاشتاقات.

## سير العمل

كل قطعة تمر بهذه المراحل:
**فكرة** → **كتابة** → **تصميم** → **مراجعة** → **موافقة** → **نشر**

## موافقة العميل

شارك رابط المراجعة مع العميل ليتمكن من الموافقة أو طلب تعديلات مباشرة من البوابة.`,
    contentEn: `## What is Content Studio?

Content Studio is a complete digital content management system including:
- Monthly content planning
- AI-powered idea generation
- Content piece status tracking
- Client approval workflow

## Create a Content Plan

1. Go to **Content Studio** → **New Plan**
2. Select the client and month
3. Choose platforms (Instagram, TikTok, YouTube...)
4. Set the number of pieces per platform

## Generate Ideas with AI

On a content piece, click **Generate with AI** and enter:
- Topic or keyword
- Content tone (formal/fun/educational)

The system suggests a title, caption, and hashtags.

## Workflow Stages

Each piece goes through:
**Idea** → **Writing** → **Design** → **Review** → **Approval** → **Published**

## Client Approval

Share the review link with your client so they can approve or request revisions directly from the portal.`,
  },
  {
    id: 'telegram-notifications',
    categoryId: 'settings',
    titleAr: 'كيف تفعّل إشعارات Telegram',
    titleEn: 'How to Enable Telegram Notifications',
    readMinAr: 3,
    readMinEn: 3,
    contentAr: `## لماذا Telegram؟

Vision OS يرسل إشعارات فورية عبر Telegram لأهم الأحداث:
- فاتورة جديدة أو دفع
- حضور الموظفين
- تنبيهات المشاريع
- تقرير يومي تلقائي

## الإعداد

١. في التطبيق، اذهب إلى **الإعدادات** ← **الإشعارات**
٢. انقر **ربط Telegram**
٣. افتح Telegram وابحث عن @VisionOSBot
٤. أرسل /start
٥. انسخ الرمز المؤقت وأدخله في النظام

## تخصيص الإشعارات

يمكنك اختيار أي إشعارات تريد:
- ☑️ كل إشعارات الفريق
- ☑️ الفواتير فقط
- ☑️ التقرير اليومي الساعة 9 صباحاً
- ☑️ تنبيهات المشاريع المتأخرة`,
    contentEn: `## Why Telegram?

Vision OS sends instant Telegram notifications for important events:
- New invoices or payments
- Employee attendance
- Project alerts
- Automatic daily report

## Setup

1. In the app, go to **Settings** → **Notifications**
2. Click **Connect Telegram**
3. Open Telegram and search for @VisionOSBot
4. Send /start
5. Copy the temporary code and enter it in the system

## Customize Notifications

Choose which notifications you want:
- ☑️ All team notifications
- ☑️ Invoices only
- ☑️ Daily report at 9 AM
- ☑️ Late project alerts`,
  },
]
