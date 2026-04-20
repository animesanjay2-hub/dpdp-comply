import { supabase } from './supabase'
import { ComplianceTask } from '@/types'

const categoryWeights: Record<string, number> = {
  privacy_notice: 15,
  consent: 20,
  data_audit: 15,
  grievance_officer: 10,
  breach_protocol: 20,
  vendor_contracts: 10,
  children_data: 5,
  team_training: 5,
}

const categoryProgress: Record<string, { done: number; total: number }> = {}

export async function calculateAndSaveScore(
  companyId: string
): Promise<number> {
  // ✅ Chain .eq() on the builder before awaiting
  const { data, error } = await supabase
    .from('compliance_tasks')
    .select('category, status')
    .eq('company_id', companyId)

  const tasks = (data as Pick<ComplianceTask, 'category' | 'status'>[]) ?? []

  if (tasks.length === 0) return 0

  let score = 0
  for (const [category, weight] of Object.entries(categoryWeights)) {
    const progress = categoryProgress[category]
    if (progress?.total) {
      score += (progress.done / progress.total) * weight
    }
  }

  const finalScore = Math.round(score)

  // ✅ Chain .eq() on the builder for the update
  await supabase
    .from('companies')
    .update({ compliance_score: finalScore })
    .eq('id', companyId)

  return finalScore
}

export function scoreToColor(score: number): string {
  if (score >= 70) return '#2e7d32'
  if (score >= 40) return '#f57c00'
  return '#c62828'
}

export function scoreToLabel(score: number): string {
  if (score >= 70) return '✅ Good Compliance'
  if (score >= 40) return '⚠️ Partial Compliance'
  return '🔴 Critical Risk'
}

export function getCategoryProgress(
  tasks: { category: string; status: string }[],
  category: string
): number {
  const catTasks = tasks.filter(t => t.category === category)
  if (!catTasks.length) return 0
  const done = catTasks.filter(t => t.status === 'completed').length
  return Math.round((done / catTasks.length) * 100)
}