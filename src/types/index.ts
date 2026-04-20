export interface Company {
  id: string
  name: string
  gstin?: string
  website?: string
  founder_name?: string
  email: string
  phone?: string
  employee_count?: number
  funding_stage?: string
  industry?: string
  compliance_score: number
  grievance_officer_name?: string
  grievance_officer_email?: string
  onboarding_complete: boolean
  created_at: string
}

export interface ComplianceTask {
  id: string
  company_id: string
  task_name: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  deadline?: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  estimated_time?: string
  notes?: string
  created_at: string
}

export interface BreachIncident {
  id: string
  company_id: string
  detected_at: string
  breach_type?: string
  affected_users_count?: number
  data_categories_affected?: string[]
  dpb_notified_at?: string
  users_notified_at?: string
  status: 'detected' | 'investigating' | 'dpb_notified' | 
          'users_notified' | 'resolved'
  incident_report?: string
  dpb_letter?: string
  created_at: string
}

export interface DataInventoryItem {
  id: string
  company_id: string
  data_category: string
  data_type: 'regular' | 'sensitive' | 'children'
  collection_purpose?: string
  storage_location?: string
  retention_period?: string
  third_party_shared: boolean
  third_party_names?: string[]
  created_at: string
}

export interface GeneratedDocument {
  id: string
  company_id: string
  doc_type: string
  content: string
  language: string
  version: number
  created_at: string
}
