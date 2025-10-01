import { NextResponse } from 'next/server'
import { verifyIdToken } from '../../../../lib/firebaseAdmin'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { headers } from 'next/headers'

/**
 * Campaign Upload URL Generation Endpoint
 * 
 * Creates signed upload URLs for campaign images with the correct path structure:
 * campaigns/{userId}/{campaignId}.png
 * 
 * This ensures:
 * - Predictable file paths (easy deletion)
 * - One image per campaign (no duplicates)
 * - Clear ownership structure
 * - PNG format enforcement (required for transparency)
 */

// Force Node.js runtime for server-side operations
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    // Get the authorization header
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Verify Firebase ID token
    let decodedToken
    try {
      decodedToken = await verifyIdToken(token)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { campaignId } = await request.json()
    
    // Validate campaignId is provided
    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    // Validate campaignId format (alphanumeric, hyphens, underscores only)
    const campaignIdRegex = /^[a-zA-Z0-9_-]+$/
    if (!campaignIdRegex.test(campaignId)) {
      return NextResponse.json({ 
        error: 'Invalid campaignId format. Use only letters, numbers, hyphens, and underscores.' 
      }, { status: 400 })
    }

    // Create campaign-specific path as documented: campaigns/{userId}/{campaignId}.png
    const filePath = `campaigns/${decodedToken.uid}/${campaignId}.png`

    // Generate signed upload URL (valid for 1 hour)
    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .createSignedUploadUrl(filePath, {
        upsert: true  // Allow overwriting if user re-uploads campaign image
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      path: filePath,
      token: data.token
    })

  } catch (error) {
    console.error('Campaign upload URL generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
