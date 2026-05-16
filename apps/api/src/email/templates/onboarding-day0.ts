export function buildOnboardingDay0Html(name: string, loginUrl: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">
  <tr>
    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700">مرحباً في Vision OS 🎉</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:32px">
      <p style="font-size:16px;line-height:1.8;margin:0 0 16px">أهلاً <strong>${name}</strong>،</p>
      <p style="color:#555;line-height:1.8;margin:0 0 24px">
        تم إنشاء حسابك في Vision OS بنجاح. أنت الآن على بُعد خطوة من إدارة وكالتك بشكل أذكى وأكثر كفاءة.
      </p>
      <div style="background:#f0f0ff;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#6366f1;font-weight:600;margin:0 0 12px">ابدأ بهذه الخطوات الثلاث:</p>
        <p style="color:#555;margin:0 0 8px">١. أضف أول موظف في فريقك</p>
        <p style="color:#555;margin:0 0 8px">٢. أنشئ أول مشروع</p>
        <p style="color:#555;margin:0">٣. جرّب أدوات AI للمحتوى</p>
      </div>
      <div style="text-align:center">
        <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600">
          ادخل إلى حسابك →
        </a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 32px;border-top:1px solid #f0f0f0;text-align:center">
      <p style="color:#999;font-size:11px;margin:0">Vision OS — فريق رؤية للإنتاج الفني</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
