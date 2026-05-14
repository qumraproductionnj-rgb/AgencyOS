export type WidgetId =
  | 'kpi-revenue'
  | 'kpi-projects'
  | 'kpi-employees'
  | 'kpi-clients'
  | 'chart-revenue'
  | 'chart-projects'
  | 'activity'
  | 'quick-actions'
  | 'team-load'
  | 'ai-insight'

export interface WidgetDef {
  id: WidgetId
  titleAr: string
  titleEn: string
  minW: number
  minH: number
  defaultW: number
  defaultH: number
}

export const WIDGET_CATALOG: WidgetDef[] = [
  {
    id: 'kpi-revenue',
    titleAr: 'الإيرادات',
    titleEn: 'Revenue KPI',
    minW: 1,
    minH: 2,
    defaultW: 1,
    defaultH: 2,
  },
  {
    id: 'kpi-projects',
    titleAr: 'المشاريع',
    titleEn: 'Projects KPI',
    minW: 1,
    minH: 2,
    defaultW: 1,
    defaultH: 2,
  },
  {
    id: 'kpi-employees',
    titleAr: 'الموظفون',
    titleEn: 'Employees KPI',
    minW: 1,
    minH: 2,
    defaultW: 1,
    defaultH: 2,
  },
  {
    id: 'kpi-clients',
    titleAr: 'العملاء',
    titleEn: 'Clients KPI',
    minW: 1,
    minH: 2,
    defaultW: 1,
    defaultH: 2,
  },
  {
    id: 'chart-revenue',
    titleAr: 'مخطط الإيرادات',
    titleEn: 'Revenue Chart',
    minW: 2,
    minH: 3,
    defaultW: 2,
    defaultH: 3,
  },
  {
    id: 'chart-projects',
    titleAr: 'حالة المشاريع',
    titleEn: 'Project Status',
    minW: 1,
    minH: 3,
    defaultW: 1,
    defaultH: 3,
  },
  {
    id: 'activity',
    titleAr: 'آخر النشاطات',
    titleEn: 'Recent Activity',
    minW: 2,
    minH: 4,
    defaultW: 2,
    defaultH: 4,
  },
  {
    id: 'quick-actions',
    titleAr: 'إجراءات سريعة',
    titleEn: 'Quick Actions',
    minW: 1,
    minH: 3,
    defaultW: 1,
    defaultH: 3,
  },
  {
    id: 'team-load',
    titleAr: 'حمل الفريق',
    titleEn: 'Team Load',
    minW: 2,
    minH: 3,
    defaultW: 2,
    defaultH: 3,
  },
  {
    id: 'ai-insight',
    titleAr: 'تحليل AI',
    titleEn: 'AI Insight',
    minW: 1,
    minH: 2,
    defaultW: 2,
    defaultH: 2,
  },
]

export interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

export const PRESET_MANAGER: LayoutItem[] = [
  { i: 'kpi-revenue', x: 0, y: 0, w: 1, h: 2 },
  { i: 'kpi-projects', x: 1, y: 0, w: 1, h: 2 },
  { i: 'kpi-employees', x: 2, y: 0, w: 1, h: 2 },
  { i: 'kpi-clients', x: 3, y: 0, w: 1, h: 2 },
  { i: 'chart-revenue', x: 0, y: 2, w: 2, h: 3 },
  { i: 'chart-projects', x: 2, y: 2, w: 1, h: 3 },
  { i: 'quick-actions', x: 3, y: 2, w: 1, h: 3 },
  { i: 'activity', x: 0, y: 5, w: 2, h: 4 },
  { i: 'ai-insight', x: 2, y: 5, w: 2, h: 2 },
]

export const PRESET_DESIGNER: LayoutItem[] = [
  { i: 'kpi-projects', x: 0, y: 0, w: 1, h: 2 },
  { i: 'kpi-clients', x: 1, y: 0, w: 1, h: 2 },
  { i: 'team-load', x: 2, y: 0, w: 2, h: 3 },
  { i: 'chart-projects', x: 0, y: 2, w: 2, h: 3 },
  { i: 'activity', x: 0, y: 5, w: 2, h: 4 },
  { i: 'quick-actions', x: 2, y: 3, w: 2, h: 3 },
]

export const PRESET_ACCOUNTANT: LayoutItem[] = [
  { i: 'kpi-revenue', x: 0, y: 0, w: 2, h: 2 },
  { i: 'kpi-clients', x: 2, y: 0, w: 1, h: 2 },
  { i: 'kpi-projects', x: 3, y: 0, w: 1, h: 2 },
  { i: 'chart-revenue', x: 0, y: 2, w: 3, h: 3 },
  { i: 'chart-projects', x: 3, y: 2, w: 1, h: 3 },
  { i: 'activity', x: 0, y: 5, w: 4, h: 3 },
]
