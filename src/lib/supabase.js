// Supabase configuration for storage services
import { createClient } from '@supabase/supabase-js'

// Check for Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Initialize Supabase client only if configured
let supabase = null

if (supabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Storage utilities
export const uploadFile = async (file, bucket = 'uploads', path = '') => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }

  try {
    const fileName = `${path}${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const getPublicUrl = (bucket = 'uploads', path) => {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export const deleteFile = async (bucket = 'uploads', path) => {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

export const listFiles = async (bucket = 'uploads', folder = '') => {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0
      })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}

// Export client and configuration status
export { supabase, supabaseConfigured }
export default supabase