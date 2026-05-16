interface MonthlyStats {
  month: string
  revenue: number
  currency: string
  projectsCompleted: number
  attendanceRate: number
  newClients: number
}

export function buildMonthlyReportHtml(
  name: string,
  stats: MonthlyStats,
  dashboardUrl: string,
): string {
  const fmt = (n: number) => n.toLocaleString('ar-IQ')

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">
  <tr>
    <td style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:28px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px">📊 تقرير ${stats.month}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:28px">
      <p style="margin:0 0 20px">أهلاً <strong>${name}</strong>، إليك ملخص شهر <strong>${stats.month}</strong>:</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${[
            {
              label: 'الإيرادات',
              value: `${fmt(stats.revenue)} ${stats.currency}`,
              color: '#10b981',
            },
            { label: 'مشاريع منجزة', value: String(stats.projectsCompleted), color: '#6366f1' },
            { label: 'نسبة الحضور', value: `${stats.attendanceRate}%`, color: '#f59e0b' },
            { label: 'عملاء جدد', value: String(stats.newClients), color: '#0ea5e9' },
          ]
            .map(
              (s) => `
            <td width="25%" style="padding:8px;text-align:center">
              <div style="background:#f8f9fa;border-radius:10px;padding:16px">
                <p style="color:${s.color};font-size:20px;font-weight:700;margin:0">${s.value}</p>
                <p style="color:#888;font-size:11px;margin:6px 0 0">${s.label}</p>
              </div>
            </td>`,
            )
            .join('')}
        </tr>
      </table>
      <div style="text-align:center;margin-top:24px">
        <a href="${dashboardUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px">
          عرض التقرير الكامل →
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
