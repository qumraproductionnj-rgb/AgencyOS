const API = process.env.API_URL ?? 'http://localhost:3001'
const API_V1 = `${API}/api/v1`

async function api(path: string, options?: RequestInit) {
  const mergedHeaders = new Headers({ 'Content-Type': 'application/json' })
  if (options?.headers) {
    const incoming = new Headers(options.headers as Record<string, string>)
    incoming.forEach((v, k) => mergedHeaders.set(k, v))
  }
  const res = await fetch(`${API_V1}${path}`, {
    method: options?.method ?? 'GET',
    body: options?.body,
    headers: mergedHeaders,
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body, headers: res.headers }
}

export async function signup(data: {
  company: { name: string; slug: string }
  owner: { email: string; password: string; fullNameAr: string; preferredLanguage?: string }
}) {
  return api('/auth/signup', { method: 'POST', body: JSON.stringify(data) })
}

export async function verifyEmail(token: string) {
  return api('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
}

export async function login(email: string, password: string) {
  return api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function createEmployee(token: string, data: Record<string, unknown>) {
  return api('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function acceptInvite(token: string, password: string) {
  return api('/employees/accept-invite', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export async function createWorkLocation(token: string, data: Record<string, unknown>) {
  return api('/work-locations', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function assignEmployeeToLocation(
  token: string,
  locationId: string,
  employeeIds: string[],
) {
  return api(`/work-locations/${locationId}/employees`, {
    method: 'POST',
    body: JSON.stringify({ employeeIds }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function checkIn(token: string, data: { latitude: number; longitude: number }) {
  return api('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getTodayAll(token: string) {
  return api('/attendance/today/all', { headers: { Authorization: `Bearer ${token}` } })
}

export async function clearMailhog() {
  await fetch('http://localhost:8025/api/v1/messages', { method: 'DELETE' }).catch(() => {
    void 0
  })
}

function decodeQP(text: string): string {
  // Step 1: remove QP soft line breaks (= followed by CR/LF)
  let s = text.replace(/=\r?\n/g, '')
  // Step 2: decode =XX hex sequences
  s = s.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  return s
}

async function pollMailhog(): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch('http://localhost:8025/api/v2/messages').catch(() => null)
    if (!res) {
      await sleep(1000)
      continue
    }
    const data = await res.json()
    const msg = data.items?.[0]
    if (msg) {
      const raw = msg.Content?.Body ?? msg.Content?.Text ?? ''
      const body = decodeQP(raw)
      const match = body.match(/[?&]token=([a-zA-Z0-9_-]{10,})/)
      if (match) return match[1]
    }
    await sleep(1000)
  }
  throw new Error('Token not found in MailHog after 30s')
}

export async function getVerifyToken() {
  return pollMailhog()
}

export async function getInviteToken() {
  return pollMailhog()
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── Phase 2 Helpers ───────────────────────────────────────

// Leads
export async function createLead(token: string, data: Record<string, unknown>) {
  return api('/leads', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateLeadStatus(token: string, id: string, status: string) {
  return api(`/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Clients
export async function listClients(token: string) {
  return api('/clients', { headers: { Authorization: `Bearer ${token}` } })
}

// Quotations
export async function createQuotation(token: string, data: Record<string, unknown>) {
  return api('/quotations', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateQuotationStatus(token: string, id: string, status: string) {
  return api(`/quotations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Projects
export async function createProject(token: string, data: Record<string, unknown>) {
  return api('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateProjectStage(token: string, id: string, stage: string) {
  return api(`/projects/${id}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Tasks
export async function createTask(token: string, data: Record<string, unknown>) {
  return api('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Invoices
export async function createInvoice(token: string, data: Record<string, unknown>) {
  return api('/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateInvoiceStatus(token: string, id: string, status: string) {
  return api(`/invoices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createPayment(
  token: string,
  invoiceId: string,
  data: Record<string, unknown>,
) {
  return api(`/invoices/${invoiceId}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Leaves
export async function createLeave(token: string, data: Record<string, unknown>) {
  return api('/leaves', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function approveLeave(token: string, id: string) {
  return api(`/leaves/${id}/approve`, {
    method: 'PATCH',
    body: '{}',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getLeaveBalance(token: string) {
  return api('/leaves/balance', { headers: { Authorization: `Bearer ${token}` } })
}

// Expenses
export async function createExpense(token: string, data: Record<string, unknown>) {
  return api('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateExpenseStatus(
  token: string,
  id: string,
  status: string,
  rejectionReason?: string,
) {
  return api(`/expenses/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(
      status === 'REJECTED' && rejectionReason ? { status, rejectionReason } : { status },
    ),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Files
export async function uploadFile(token: string, entityType: string, entityId: string) {
  const formData = new FormData()
  formData.append(
    'file',
    new Blob(['test file content for e2e'], { type: 'text/plain' }),
    'e2e-test.txt',
  )
  formData.append('entityType', entityType)
  formData.append('entityId', entityId)

  const res = await fetch(`${API_V1}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body, headers: res.headers }
}

export async function getFile(token: string, id: string) {
  return api(`/files/${id}`, { headers: { Authorization: `Bearer ${token}` } })
}

// ─── Phase 3 Helpers ───────────────────────────────────────

// Clients (for portal enable)
export async function enableClientPortal(token: string, clientId: string) {
  return api(`/clients/${clientId}/enable-portal`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createPortalUser(
  token: string,
  clientId: string,
  data: Record<string, unknown>,
) {
  return api(`/clients/${clientId}/portal-users`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Brand Briefs
export async function createBrandBrief(token: string, data: Record<string, unknown>) {
  return api('/brand-briefs', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getBrandBriefs(token: string, clientId?: string) {
  const qs = clientId ? `?clientId=${clientId}` : ''
  return api(`/brand-briefs${qs}`, { headers: { Authorization: `Bearer ${token}` } })
}

export async function deleteBrandBrief(token: string, id: string) {
  return api(`/brand-briefs/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Content Pillars
export async function createContentPillar(token: string, data: Record<string, unknown>) {
  return api('/content-pillars', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Content Plans
export async function createContentPlan(token: string, data: Record<string, unknown>) {
  return api('/content-plans', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getContentPlan(token: string, id: string) {
  return api(`/content-plans/${id}`, { headers: { Authorization: `Bearer ${token}` } })
}

export async function generateIdeas(token: string, planId: string, data: Record<string, unknown>) {
  return api(`/content-plans/${planId}/generate-ideas`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function finalizePlan(token: string, planId: string, data: Record<string, unknown>) {
  return api(`/content-plans/${planId}/finalize`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Content Pieces
export async function updateContentPiece(token: string, id: string, data: Record<string, unknown>) {
  return api(`/content-pieces/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateContentPieceStage(token: string, id: string, stage: string) {
  return api(`/content-pieces/${id}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createRevision(
  token: string,
  pieceId: string,
  data: Record<string, unknown>,
) {
  return api(`/content-pieces/${pieceId}/revisions`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Equipment
export async function createEquipment(token: string, data: Record<string, unknown>) {
  return api('/equipment', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createEquipmentBooking(token: string, data: Record<string, unknown>) {
  return api('/equipment/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// AI
export async function generateAi(token: string, data: Record<string, unknown>) {
  return api('/ai/generate', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Portal (external user)
export async function portalLogin(email: string, password: string) {
  return api('/portal/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function portalGetDashboard(token: string) {
  return api('/portal/dashboard', { headers: { Authorization: `Bearer ${token}` } })
}

export async function portalGetFiles(token: string) {
  return api('/portal/files', { headers: { Authorization: `Bearer ${token}` } })
}

export async function portalRequestRevision(token: string, fileId: string, feedback: string) {
  return api(`/portal/files/${fileId}/request-revision`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function portalGetContentPieces(token: string) {
  return api('/portal/content-pieces', { headers: { Authorization: `Bearer ${token}` } })
}
