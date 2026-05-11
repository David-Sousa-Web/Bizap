import type { MediaRequestStatus } from "@/features/projects/types"

export interface DashboardFilters {
  projectId?: string
  from?: string
  to?: string
}

export interface DashboardSummary {
  totalProjects: number
  totalNumbers: number
  totalMediaRequests: number
  totalDeliveredMedia: number
  totalFailed: number
  confirmationRate: number
  deliveryRate: number
}

export type DashboardMediaStatus = Record<MediaRequestStatus, number>

export interface DashboardReplyMetrics {
  templateSent: number
  yesReply: number
  noReply: number
  invalidReply: number
  mediaSent: number
}

export interface DashboardProjectSummary {
  id: string
  name: string
  image: string | null
  agency: string | null
  totalNumbers: number
  totalMediaRequests: number
  deliveredMedia: number
  failed: number
  confirmationRate: number
}

export interface DashboardActivityItem {
  id: string
  projectId: string
  projectName: string
  numberId: string
  status: MediaRequestStatus
  createdAt: string
  updatedAt: string
}

export interface DashboardAttention {
  pendingRequests: number
  declinedRequests: number
  invalidResponseLimit: number
  failedRequests: number
  projectsWithoutZabbixHost: number
}

export interface DashboardData {
  filters: {
    projectId: string | null
    from: string | null
    to: string | null
  }
  summary: DashboardSummary
  mediaStatus: DashboardMediaStatus
  replyMetrics: DashboardReplyMetrics
  projects: DashboardProjectSummary[]
  recentActivity: DashboardActivityItem[]
  attention: DashboardAttention
}
