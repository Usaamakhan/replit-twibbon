import { NextResponse } from 'next/server'
import { verifyIdToken } from '../../../../lib/firebaseAdmin'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { headers } from 'next/headers'

// Force Node.js runtime for server-side operations
export const runtime = 'nodejs'

export async function DELETE(request) {
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

    const { path } = await request.json()
    
    if (!path) {
      return NextResponse.json({ error: 'path is required' }, { status: 400 })
    }

    // Verify user owns this file - handle different folder structures
    const allowedPrefixes = [
      `uploads/${decodedToken.uid}/`,
      `profile-images/${decodedToken.uid}/`,
      `documents/${decodedToken.uid}/`,
      `temp/${decodedToken.uid}/`
    ]
    
    const hasValidPrefix = allowedPrefixes.some(prefix => path.startsWith(prefix))
    if (!hasValidPrefix) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the file
    const { error } = await supabaseAdmin.storage
      .from('uploads')
      .remove([path])

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}