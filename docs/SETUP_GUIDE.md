# SETUP_GUIDE.md — دليل التثبيت من الصفر

> هذا الدليل لشخص لا يملك أي شيء مثبت. اتبعه خطوة بخطوة. كل خطوة تُختبر قبل الانتقال للتالية.

---

## 📋 ملخص ما سنثبّته

| الأداة | الغرض | الحجم التقريبي |
|---|---|---|
| Git | إدارة الإصدارات | 50 MB |
| Node.js (via nvm) | تشغيل JavaScript | 100 MB |
| pnpm | مدير حزم سريع | 5 MB |
| Docker Desktop | تشغيل قواعد البيانات محلياً | 1 GB |
| VS Code | محرر الكود | 350 MB |
| Antigravity | بيئة Claude Code | متغير |
| GitHub CLI | تسهيل التعامل مع GitHub | 30 MB |

**المتطلبات قبل البدء:**
- جهاز Windows 10/11 أو macOS أو Linux
- 8 GB RAM على الأقل (16 GB مفضل)
- 20 GB مساحة فارغة على القرص
- اتصال إنترنت مستقر

---

# الجزء الأول: Windows (الأكثر تفصيلاً)

## الخطوة 1: تفعيل WSL 2 (مطلوب لـ Docker)

WSL = Windows Subsystem for Linux. نحتاجه لأن Docker و معظم أدوات التطوير تعمل بسلاسة أكبر على Linux.

### 1.1 افتح PowerShell كمسؤول
- اضغط `Win + X` → اختر `Windows PowerShell (Admin)` أو `Terminal (Admin)`

### 1.2 ثبّت WSL بأمر واحد
```powershell
wsl --install
```

### 1.3 أعد تشغيل الجهاز

### 1.4 بعد إعادة التشغيل
- ستفتح نافذة Ubuntu تلقائياً
- ستطلب منك إنشاء username و password (احفظهم!)
- اكتب username بأحرف صغيرة فقط، بدون مسافات

### 1.5 تحقق من نجاح التثبيت
في PowerShell:
```powershell
wsl --status
```
يجب أن يظهر: `Default Version: 2`

---

## الخطوة 2: تثبيت Git

### 2.1 حمّل Git
- اذهب إلى: https://git-scm.com/download/win
- التحميل سيبدأ تلقائياً

### 2.2 شغّل المثبّت
- اقبل الإعدادات الافتراضية في معظم الشاشات
- في شاشة "Default editor" اختر: **Visual Studio Code** (سنثبّته لاحقاً، ولكن سيعمل عند تثبيته)
- في شاشة "Adjusting your PATH" اختر: **Git from the command line and also from 3rd-party software**

### 2.3 افتح PowerShell جديد واختبر
```powershell
git --version
```
يجب أن يظهر: `git version 2.x.x`

### 2.4 اضبط معلوماتك
```powershell
git config --global user.name "اسمك بالإنجليزية"
git config --global user.email "your-email@example.com"
git config --global init.defaultBranch main
```

---

## الخطوة 3: تثبيت Node.js عبر nvm-windows

استخدام nvm يسمح لك بتبديل إصدارات Node بسهولة.

### 3.1 حمّل nvm-windows
- اذهب إلى: https://github.com/coreybutler/nvm-windows/releases
- حمّل `nvm-setup.exe` من أحدث إصدار

### 3.2 ثبّته (Next, Next, Finish)

### 3.3 افتح PowerShell جديد
```powershell
nvm version
```
يجب أن يظهر رقم الإصدار.

### 3.4 ثبّت Node.js LTS
```powershell
nvm install lts
nvm use lts
node --version
```
يجب أن يظهر: `v20.x.x` أو أحدث.

### 3.5 ثبّت pnpm
```powershell
npm install -g pnpm
pnpm --version
```

---

## الخطوة 4: تثبيت Docker Desktop

### 4.1 حمّل Docker Desktop
- اذهب إلى: https://www.docker.com/products/docker-desktop/
- حمّل النسخة لـ Windows

### 4.2 شغّل المثبّت
- مهم: اترك خيار **Use WSL 2 instead of Hyper-V** مفعّلاً ✅

### 4.3 أعد تشغيل الجهاز

### 4.4 بعد إعادة التشغيل
- افتح Docker Desktop من قائمة Start
- اقبل شروط الخدمة
- يمكنك تخطي الـ tutorial

### 4.5 اختبر Docker
في PowerShell:
```powershell
docker --version
docker run hello-world
```
يجب أن ترى رسالة `Hello from Docker!`

---

## الخطوة 5: تثبيت Visual Studio Code

### 5.1 حمّل VS Code
- اذهب إلى: https://code.visualstudio.com/
- حمّل لـ Windows

### 5.2 ثبّته
- مهم: اقبل خيار **Add to PATH** ✅
- اقبل خيار **Open with Code** عند النقر بزر الماوس الأيمن ✅

### 5.3 ثبّت الإضافات الضرورية
افتح VS Code، ثم اضغط `Ctrl+Shift+X` (Extensions). ابحث وثبّت:
- **ESLint** (Microsoft)
- **Prettier - Code formatter** (Prettier)
- **Tailwind CSS IntelliSense** (Tailwind Labs)
- **Prisma** (Prisma)
- **Docker** (Microsoft)
- **GitLens** (GitKraken)
- **Error Lens** (Alexander)
- **Path Intellisense** (Christian Kohler)
- **Auto Rename Tag** (Jun Han)
- **DotENV** (mikestead)
- **WSL** (Microsoft) — ضرورية!

### 5.4 إعدادات مفيدة
اضغط `Ctrl+Shift+P` → اكتب `Open User Settings (JSON)` → الصق:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## الخطوة 6: تثبيت GitHub CLI

### 6.1 حمّل GitHub CLI
- اذهب إلى: https://cli.github.com/
- حمّل لـ Windows

### 6.2 ثبّته (Next, Next, Finish)

### 6.3 افتح PowerShell جديد ولغ
```powershell
gh auth login
```
- اختر: **GitHub.com**
- اختر: **HTTPS**
- اختر: **Yes** for Git operations
- اختر: **Login with a web browser**
- ستظهر رسالة بالكود → اضغط Enter → سينفتح المتصفح
- ألصق الكود وفعّل الحساب

اختبر:
```powershell
gh auth status
```

---

## الخطوة 7: تثبيت Antigravity

### 7.1 حمّل Antigravity
- اذهب إلى: https://antigravity.google/ (أو الموقع الرسمي وقت التثبيت)
- حمّل لـ Windows

### 7.2 ثبّته كأي تطبيق آخر

### 7.3 سجّل دخولك بحساب Google

### 7.4 إعدادات Claude Code داخل Antigravity
- افتح إعدادات Antigravity
- ابحث عن: **AI Provider** أو **Models**
- أضف Anthropic API Key (سنحصل عليه في الخطوة التالية)

---

## الخطوة 8: الحصول على Anthropic API Key

### 8.1 أنشئ حساب Anthropic
- اذهب إلى: https://console.anthropic.com/
- سجّل دخولك (يقبل Google + Email)

### 8.2 أضف رصيداً
- اذهب إلى: **Plans & Billing**
- اشحن $20-$50 للبداية (سيكفي شهرين بالاستخدام المتوسط)

### 8.3 أنشئ API Key
- اذهب إلى: **API Keys**
- اضغط: **Create Key**
- الاسم: `AgencyOS-Development`
- نوع: **Restricted** (للاستخدام في التطوير)
- انسخ الـ Key فوراً وضعه في مكان آمن — لن تستطيع رؤيته مرة أخرى!

### 8.4 احفظ الـ Key
أنشئ ملف نصي محمي على جهازك (مثلاً في 1Password أو Bitwarden) واحفظه:
```
ANTHROPIC_API_KEY_DEV=sk-ant-...your-key...
```

> ⚠️ **مهم جداً:** سنحتاج إلى **مفتاحين منفصلين**:
> - مفتاح للتطوير (Claude Code يستخدمه): اسمه `AgencyOS-Development`
> - مفتاح للنظام نفسه (للأدوات AI داخل التطبيق): اسمه `AgencyOS-Production-AI`
>
> أنشئ كلاهما الآن. سنحتاج الثاني لاحقاً عند بناء أدوات AI في Phase 3.

---

## الخطوة 9: إنشاء حساب Cloudflare + R2

### 9.1 أنشئ حساب Cloudflare
- اذهب إلى: https://cloudflare.com/
- سجّل (مجاني)

### 9.2 فعّل R2
- في لوحة التحكم: **R2 Object Storage**
- اضغط **Get Started**
- ستحتاج إضافة بطاقة (لكن R2 ضمن الـ free tier حتى 10GB مجاناً)

### 9.3 أنشئ Bucket
- Name: `agencyos-dev`
- Location Hint: **EEUR** (Eastern Europe — أقرب للعراق)

### 9.4 أنشئ API Token لـ R2
- في R2 → **Manage R2 API Tokens**
- اضغط: **Create API Token**
- Permissions: **Object Read & Write**
- Bucket: `agencyos-dev` (المحدد فقط)
- احفظ:
  - Access Key ID
  - Secret Access Key
  - Endpoint URL

---

## الخطوة 10: إنشاء حساب GitHub + المستودع

### 10.1 إن لم يكن لديك حساب
- اذهب إلى: https://github.com/
- سجّل

### 10.2 أنشئ المستودع
في PowerShell (سنستخدم gh):
```powershell
cd C:\Users\YourName\Documents
mkdir AgencyOS
cd AgencyOS
gh repo create AgencyOS --private --description "Multi-tenant SaaS for marketing agencies"
```

### 10.3 جاهز لتلقّي الكود

---

# الجزء الثاني: macOS

## استخدم Homebrew (أبسط بكثير)

### 1. ثبّت Homebrew
في Terminal:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. ثبّت كل شيء بأمر واحد
```bash
brew install git node pnpm gh
brew install --cask docker visual-studio-code
```

### 3. ثبّت nvm (للتحكم في إصدارات Node)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc
nvm install --lts
```

### 4. باقي الخطوات
- Antigravity من الموقع
- Anthropic API key (نفس الخطوة 8 أعلاه)
- Cloudflare R2 (نفس الخطوة 9 أعلاه)
- GitHub CLI:
```bash
gh auth login
```

---

# الجزء الثالث: التحقق النهائي من البيئة

افتح PowerShell (Windows) أو Terminal (Mac/Linux) ونفّذ كل الأوامر التالية. يجب أن تنجح كلها:

```bash
# Git
git --version

# Node
node --version          # v20.x.x
pnpm --version          # 9.x.x

# Docker
docker --version
docker compose version

# GitHub CLI
gh --version
gh auth status

# VS Code
code --version
```

كلها تعمل؟ ✅ ممتاز، البيئة جاهزة!

---

# الجزء الرابع: تجهيز ملفات AgencyOS

### 1. ضع الملفات في المكان الصحيح

أنشئ المجلد الرئيسي:
```bash
cd ~/Documents          # أو أي مكان مفضل
mkdir AgencyOS
cd AgencyOS
git init
git branch -M main
```

### 2. أنشئ هيكل المجلدات الأولي
```bash
mkdir -p docs prompts schemas configs scripts
```

### 3. ضع الملفات التي حصلت عليها مني

ضع في الجذر (`AgencyOS/`):
- `CLAUDE.md`
- `.gitignore` (سأعطيك إياه في الملفات المرفقة)

ضع في `docs/`:
- `AgencyOS_MasterSpec.md`
- `AgencyOS_ContentStudio.md`
- `TASKS.md`
- `PROGRESS.md`
- `DECISIONS.md`
- `SETUP_GUIDE.md` (هذا الملف)

ضع في `prompts/`:
- ملفات قوالب البرومتات (سأعطيك)

### 4. أنشئ ملف `.env.example`

(سأعطيك إياه — ضعه في الجذر)

### 5. أول commit
```bash
git add .
git commit -m "chore: initial spec and instructions"
git remote add origin https://github.com/YOUR_USERNAME/AgencyOS.git
git push -u origin main
```

---

# الجزء الخامس: ربط Antigravity بالمشروع

### 1. افتح Antigravity

### 2. افتح المجلد
- File → Open Folder → اختر `AgencyOS`

### 3. تحقق من قراءة CLAUDE.md
- في Antigravity، Claude Code يقرأ `CLAUDE.md` تلقائياً عند فتح أي مجلد

### 4. ابدأ أول جلسة
في chat Claude Code، اكتب البرومت من ملف `prompts/00_session_start.md` (سأعطيك إياه).

---

# 🎯 خلاصة: الترتيب الذي ستتبعه

```
1. ✅ ثبّت كل البرامج (الجزء الأول/الثاني)
2. ✅ تحقق من البيئة (الجزء الثالث)
3. ✅ احصل على API keys (Anthropic + Cloudflare)
4. ✅ أنشئ مستودع GitHub
5. ✅ ضع ملفاتي في المكان الصحيح
6. ✅ افتح Antigravity على المجلد
7. 🚀 ابدأ Task 0.1 من TASKS.md
```

---

# ❓ مشاكل شائعة وحلولها

### "Docker daemon is not running"
- افتح Docker Desktop يدوياً
- انتظر حتى يصبح أيقونته خضراء في system tray

### "WSL: command not found"
- أعد تشغيل الجهاز
- إن استمرت: في PowerShell admin: `wsl --update`

### "pnpm: command not found"
- أعد فتح Terminal/PowerShell
- إن استمرت: `npm install -g pnpm` مرة أخرى

### "Permission denied" على Linux/Mac
- استخدم `sudo` للأوامر التي تحتاج صلاحيات
- أو `chmod +x` للملفات التنفيذية

### Antigravity لا يقرأ CLAUDE.md
- تأكد أن الملف بالضبط بالاسم `CLAUDE.md` (case-sensitive على macOS/Linux)
- تأكد أنه في جذر المشروع، ليس داخل مجلد فرعي
- أعد فتح Antigravity

### Anthropic API: "Insufficient credits"
- اشحن حسابك في console.anthropic.com → Billing
- $5 يكفي ليوم تطوير مكثف عادة

---

# 📞 الدعم

إن واجهتك مشكلة لم تُحل من هذا الدليل:
1. خذ screenshot للخطأ
2. اكتب: نظام التشغيل، الخطوة، النص الحرفي للخطأ
3. اطلب المساعدة من Claude Code مباشرةً (داخل Antigravity)
