export function buildTrialExpiryHtml(name: string, daysLeft: number, upgradeUrl: string): string {
  const isExpired = daysLeft <= 0
  const isUrgent = daysLeft <= 5

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">
  <tr>
    <td style="background:${isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#6366f1'};padding:28px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">
        ${isExpired ? '⚠️ انتهت تجربتك المجانية' : `⏰ ${daysLeft} أيام متبقية في تجربتك`}
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding:28px">
      <p style="font-size:15px;line-height:1.8;margin:0 0 16px">أهلاً <strong>${name}</strong>،</p>
      <p style="color:#555;line-height:1.8;margin:0 0 20px">
        ${
          isExpired
            ? 'انتهت فترة تجربتك المجانية. لا تفقد بياناتك — اشترك الآن للاستمرار.'
            : `باقي ${daysLeft} أيام فقط على انتهاء فترة التجربة المجانية. اشترك الآن للاستمرار دون انقطاع.`
        }
      </p>
      ${daysLeft === -2 ? '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:20px"><p style="color:#dc2626;margin:0;font-weight:600">🎁 عرض خاص: خصم 20% على أي خطة لمدة 48 ساعة فقط</p></div>' : ''}
      <div style="text-align:center">
        <a href="${upgradeUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600">
          اشترك الآن →
        </a>
      </div>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
