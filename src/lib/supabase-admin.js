// Server-side Supabase client with service role key
import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create client or mock based on available configuration
let supabaseAdmin

if (!supabaseUrl || !supabaseServiceKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Missing Supabase configuration for admin client - using mock client for build')
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
  // Create admin client with service role key (server-side only)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export { supabaseAdmin }
export default supabaseAdmin