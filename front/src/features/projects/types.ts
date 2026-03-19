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

export interface ProjectNumber {
  id: string
  name: string
  number: string
  projectId: string
}

export interface UpdateProjectPayload {
  name?: string
  phoneNumber?: string
  agency?: string
  templateSid?: string
}
