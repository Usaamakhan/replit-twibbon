// Server-side Supabase client with service role key
import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Create client or mock based on available configuration
let supabaseAdmin

if (!supabaseUrl || !supabaseServiceKey) {
  // In production, throw error immediately - no mock clients
  if (isProduction) {
    throw new Error(
      '[PRODUCTION] Supabase configuration is required in production. ' +
      'Missing: ' +
      (!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : '') +
      (!supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : '')
    );
  }
  
  // In development, warn and create mock client for build compatibility
  if (isDevelopment) {
    console.warn(
      '[DEV WARNING] Missing Supabase configuration - using mock client. ' +
      'Missing: ' +
      (!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : '') +
      (!supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : '')
    );
  }
  
  // Create a mock client that will work during build but fail at runtime
  supabaseAdmin = {
    storage: {
      from: () => ({
        list: () => Promise.reject(new Error('Supabase not configured')),
        remove: () => Promise.reject(new Error('Supabase not configured')),
        createSignedUrl: () => Promise.reject(new Error('Supabase not configured')),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  }
} else {
  // Validate Supabase URL format in production
  if (isProduction) {
    try {
      new URL(supabaseUrl);
      if (!supabaseUrl.includes('supabase.co')) {
        throw new Error('[PRODUCTION] NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL');
      }
    } catch (error) {
      throw new Error(`[PRODUCTION] Invalid NEXT_PUBLIC_SUPABASE_URL format: ${error.message}`);
    }
  }
  
  // Create admin client with service role key (server-side only)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  if (isDevelopment) {
    console.log('[DEV] Supabase Admin client initialized successfully');
  }
}

export { supabaseAdmin }
export default supabaseAdmin
