import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * POST /api/user/profile/upload
 * Upload user profile picture as Base64 data URL (FREE - no Firebase Storage needed)
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    
    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 2MB for Base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB for free storage' },
        { status: 400 }
      );
    }

    // Convert file to Base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64String}`;
    
    try {
      // Store Base64 data URL directly in Firestore (completely free!)
      if (adminDb) {
        await adminDb.collection('userProfiles').doc(userId).update({
          profilePicture: dataUrl,
          updatedAt: new Date().toISOString()
        });
      } else {
        throw new Error('Admin database not available');
      }
      
      return NextResponse.json({
        success: true,
        imageUrl: dataUrl,
        message: 'Profile picture uploaded successfully (stored in database)'
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database update failed: ${dbError.message}`);
    }
    
  } catch (error) {
    console.error('Error in upload profile picture API:', error);
    
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    );
  }
}
