import { supabase } from './supabase'
import { ComplianceTask, Company } from '@/types'

export async function calculateAndSaveScore(
  companyId: string
): Promise<number> {
  const { data } = await supabase
      .from('compliance_tasks')
      .select('category, status')
      .eq('company_id', companyId)
  
  const tasks = (data as Pick<ComplianceTask, 'category' | 'status'>[]) ?? []

  if (tasks.length === 0) return 0

  const categoryWeights: Record<string, number> = {
    'privacy_notice': 15,
    'consent': 20,
    'data_audit': 15,
    'grievance_officer': 10,
    'breach_protocol': 20,
    'vendor_contracts': 10,
    'children_data': 5,
    'team_training': 5
  }

  const categoryProgress: Record<string, {done: number, total: number}> = {}

  for (const task of tasks) {
    const cat = task.category
    if (!categoryProgress[cat]) {
      categoryProgress[cat] = { done: 0, total: 0 }
    }
    categoryProgress[cat].total++
    if (task.status === 'completed') {
      categoryProgress[cat].done++
    }
  }

  let score = 0
  for (const [category, weight] of Object.entries(categoryWeights)) {
    const progress = categoryProgress[category]
    if (progress && progress.total > 0) {
      const categoryScore = (progress.done / progress.total) * weight
      score += categoryScore
    }
  }

  const finalScore = Math.round(score)

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
  if (catTasks.length === 0) return 0
  const done = catTasks.filter(t => t.status === 'completed').length
  return Math.round((done / catTasks.length) * 100)
}