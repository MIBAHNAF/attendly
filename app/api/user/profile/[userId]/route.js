import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * GET /api/user/profile/[userId]
 * Get user profile information
 */
export async function GET(request, { params }) {
  try {
    console.log('=== Get User Profile API called ===');
    const { userId } = await params;
    
    console.log('Fetching profile for user:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    let profileData = null;
    
    try {
      if (adminDb) {
        // Use Admin SDK
        console.log('Using Admin SDK to get profile');
        const profileRef = adminDb.collection('userProfiles').doc(userId);
        const profileDoc = await profileRef.get();
        
        if (profileDoc.exists) {
          profileData = { id: profileDoc.id, ...profileDoc.data() };
        }
      } else {
        // Fallback to Client SDK
        const profileRef = doc(db, 'userProfiles', userId);
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
          profileData = { id: profileDoc.id, ...profileDoc.data() };
        }
      }
      
      if (!profileData) {
        // Return default profile if none exists
        return NextResponse.json({
          success: true,
          profile: {
            id: userId,
            displayName: '',
            studentId: '',
            teacherId: '',
            profilePicture: '',
            role: '',
            email: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        profile: profileData
      });
      
    } catch (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw new Error(`Failed to fetch profile: ${fetchError.message}`);
    }
    
  } catch (error) {
    console.error('Error in get user profile API:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile/[userId]
 * Update user profile information
 */
export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const profileData = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Add timestamps
    const updateData = {
      ...profileData,
      updatedAt: new Date()
    };
    
    // If this is a new profile, add createdAt
    if (!profileData.createdAt) {
      updateData.createdAt = new Date();
    }
    
    try {
      if (adminDb) {
        // Use Admin SDK
        const profileRef = adminDb.collection('userProfiles').doc(userId);
        await profileRef.set(updateData, { merge: true });
      } else {
        // Fallback to Client SDK
        const profileRef = doc(db, 'userProfiles', userId);
        await setDoc(profileRef, updateData, { merge: true });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        profile: { id: userId, ...updateData }
      });
      
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }
    
  } catch (error) {
    console.error('Error in update user profile API:', error);
    
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/profile/[userId]
 * Remove profile picture from user profile
 */
export async function DELETE(request, { params }) {
  try {
    console.log('=== Remove Profile Picture API called ===');
    const { userId } = await params;
    const { action } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (action !== 'remove_profile_picture') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    console.log('Removing profile picture for user:', userId);
    
    try {
      if (adminDb) {
        // Use Admin SDK
        console.log('Using Admin SDK to remove profile picture');
        const profileRef = adminDb.collection('userProfiles').doc(userId);
        await profileRef.update({
          profilePicture: '',
          updatedAt: new Date()
        });
      } else {
        // Fallback to Client SDK
        console.log('Using Client SDK to remove profile picture');
        const profileRef = doc(db, 'userProfiles', userId);
        await updateDoc(profileRef, {
          profilePicture: '',
          updatedAt: new Date()
        });
      }
      
      console.log('Profile picture removed successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Profile picture removed successfully'
      });
      
    } catch (removeError) {
      console.error('Error removing profile picture:', removeError);
      throw new Error(`Failed to remove profile picture: ${removeError.message}`);
    }
    
  } catch (error) {
    console.error('=== Error in remove profile picture API ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { error: 'Failed to remove profile picture', details: error.message },
      { status: 500 }
    );
  }
}
