export interface Project {
  id: string
  name: string
  image: string | null
  phoneNumber: string
  agency: string | null
  templateSid: string
  flowMessage: string
  apiKey: string
}

export interface CreateProjectPayload {
  name: string
  phoneNumber: string
  agency?: string
  templateSid: string
  flowMessage: string
}

export type MediaRequestStatus =
  | "PENDING"
  | "TEMPLATE_SENT"
  | "RECONFIRMATION_SENT"
  | "CONFIRMED"
  | "MEDIA_SENT"
  | "DECLINED"
  | "INVALID_RESPONSE_LIMIT"
  | "FAILED"

export interface ProjectNumber {
  id: string
  name: string
  number: string
  projectId: string
  lastMediaRequestStatus: MediaRequestStatus | null
}

export interface CreateNumberPayload {
  name: string
  number: string
}

export interface MediaRequest {
  id: string
  mediaUrl: string
  status: string
  numberId: string
  projectId: string
}

export interface UpdateProjectPayload {
  phoneNumber?: string
  agency?: string
  templateSid?: string
}

export interface UpdateFlowMessagePayload {
  flowMessage: string
}
