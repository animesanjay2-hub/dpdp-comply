export async function safeSupabase<T>(promise: Promise<{ data: T | null; error: any }>) {
  const { data, error } = await promise
  if (error) {
    console.error('Supabase error:', error)
    throw error
  }
  return data as T
}