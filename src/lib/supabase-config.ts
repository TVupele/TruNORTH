/*
 * Supabase Configuration
 * Uses environment variables for Vercel deployment
 * Fallback to defaults for local development
 */

// Get values from environment variables or use defaults
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "ikthjaibjralpqyjwktt"
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_eMfP92Pq5hA6Izm9ynQkWw_K7EuVAdx"
