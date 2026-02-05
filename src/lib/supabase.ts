import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase-config';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// API URL for server functions - fallback if not available
export const API_URL = `${supabaseUrl}/functions/v1`;
