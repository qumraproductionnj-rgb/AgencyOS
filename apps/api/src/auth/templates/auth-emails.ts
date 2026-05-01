/**
 * Bilingual auth-flow email templates.
 * Pure HTML strings (Phase 1). Will move to mjml/react-email if/when needed.
 */

interface VerifyEmailVars {
  appName: string
  recipientName: string
  verifyUrl: string
}

interface ResetPasswordVars {
  appName: string
  recipientName: string
  resetUrl: string
  expiryHours: number
}

const baseStyles = `
<style>
  body { margin: 0; padding: 0; background: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #1f2937; }
  .container { max-width: 560px; margin: 24px auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; }
  .button { display: inline-block; background: #3b82f6; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  .muted { color: #6b7280; font-size: 13px; }
  .url-fallback { word-break: break-all; color: #3b82f6; font-size: 12px; }
</style>
`

export function verifyEmailAr(v: VerifyEmailVars): { subject: string; html: string } {
  return {
    subject: `${v.appName} — تأكيد البريد الإلكتروني`,
    html: `
<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8" />${baseStyles}</head>
<body>
  <div class="container">
    <h2>أهلاً ${escape(v.recipientName)}،</h2>
    <p>شكراً لاشتراكك في <strong>${escape(v.appName)}</strong>. لإكمال تفعيل حسابك، يرجى تأكيد بريدك الإلكتروني:</p>
    <p><a class="button" href="${escape(v.verifyUrl)}">تأكيد البريد الإلكتروني</a></p>
    <p class="muted">إذا لم يعمل الزر، انسخ الرابط التالي والصقه في المتصفح:</p>
    <p class="url-fallback">${escape(v.verifyUrl)}</p>
    <p class="muted">سينتهي صلاحية هذا الرابط خلال 24 ساعة. إذا لم تطلب هذا، يمكنك تجاهل الرسالة.</p>
  </div>
</body>
</html>`,
  }
}

export function verifyEmailEn(v: VerifyEmailVars): { subject: string; html: string } {
  return {
    subject: `${v.appName} — Verify your email`,
    html: `
<!doctype html>
<html lang="en" dir="ltr">
<head><meta charset="utf-8" />${baseStyles}</head>
<body>
  <div class="container">
    <h2>Hi ${escape(v.recipientName)},</h2>
    <p>Thanks for signing up to <strong>${escape(v.appName)}</strong>. To activate your account, please confirm your email address:</p>
    <p><a class="button" href="${escape(v.verifyUrl)}">Verify Email</a></p>
    <p class="muted">If the button doesn't work, copy and paste the following link into your browser:</p>
    <p class="url-fallback">${escape(v.verifyUrl)}</p>
    <p class="muted">This link expires in 24 hours. If you didn't request this, you can ignore this email.</p>
  </div>
</body>
</html>`,
  }
}

export function resetPasswordAr(v: ResetPasswordVars): { subject: string; html: string } {
  return {
    subject: `${v.appName} — إعادة تعيين كلمة المرور`,
    html: `
<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8" />${baseStyles}</head>
<body>
  <div class="container">
    <h2>مرحباً ${escape(v.recipientName)}،</h2>
    <p>تلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك في <strong>${escape(v.appName)}</strong>.</p>
    <p><a class="button" href="${escape(v.resetUrl)}">إعادة تعيين كلمة المرور</a></p>
    <p class="muted">إذا لم يعمل الزر، انسخ الرابط التالي والصقه في المتصفح:</p>
    <p class="url-fallback">${escape(v.resetUrl)}</p>
    <p class="muted">ينتهي صلاحية هذا الرابط خلال ${String(v.expiryHours)} ساعة. إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة وكلمة مرورك ستبقى آمنة.</p>
  </div>
</body>
</html>`,
  }
}

export function resetPasswordEn(v: ResetPasswordVars): { subject: string; html: string } {
  return {
    subject: `${v.appName} — Reset your password`,
    html: `
<!doctype html>
<html lang="en" dir="ltr">
<head><meta charset="utf-8" />${baseStyles}</head>
<body>
  <div class="container">
    <h2>Hi ${escape(v.recipientName)},</h2>
    <p>We received a request to reset the password for your <strong>${escape(v.appName)}</strong> account.</p>
    <p><a class="button" href="${escape(v.resetUrl)}">Reset Password</a></p>
    <p class="muted">If the button doesn't work, copy and paste the following link into your browser:</p>
    <p class="url-fallback">${escape(v.resetUrl)}</p>
    <p class="muted">This link expires in ${String(v.expiryHours)} hour(s). If you didn't request a reset, you can ignore this email and your password will remain unchanged.</p>
  </div>
</body>
</html>`,
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
