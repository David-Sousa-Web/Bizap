import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns"

export interface DashboardPeriodPreset {
  id: string
  label: string
  resolve: () => { from: Date; to: Date }
}

export const dashboardPresets: DashboardPeriodPreset[] = [
  {
    id: "today",
    label: "Hoje",
    resolve: () => {
      const now = new Date()
      return { from: startOfDay(now), to: endOfDay(now) }
    },
  },
  {
    id: "7d",
    label: "Últimos 7 dias",
    resolve: () => {
      const now = new Date()
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    },
  },
  {
    id: "30d",
    label: "Últimos 30 dias",
    resolve: () => {
      const now = new Date()
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
    },
  },
  {
    id: "this-month",
    label: "Este mês",
    resolve: () => {
      const now = new Date()
      return { from: startOfMonth(now), to: endOfMonth(now) }
    },
  },
  {
    id: "this-year",
    label: "Este ano",
    resolve: () => {
      const now = new Date()
      return { from: startOfYear(now), to: endOfYear(now) }
    },
  },
]
