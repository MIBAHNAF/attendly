import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';

/**
 * POST /api/user/profiles
 * Get multiple user profiles by user IDs
 */
export async function POST(request) {
  try {
    console.log('=== Get Multiple User Profiles API called ===');
    const { userIds } = await request.json();
    
    console.log('Fetching profiles for users:', userIds);
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs array is required' },
        { status: 400 }
      );
    }
    
    const profiles = [];
    
    try {
      if (adminDb) {
        // Use Admin SDK
        console.log('Using Admin SDK to get profiles');
        
        // Get profiles in batches (Firestore has a limit on 'in' queries)
        const batchSize = 10;
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          
          const profileRefs = batch.map(userId => adminDb.collection('userProfiles').doc(userId));
          const profileDocs = await Promise.all(profileRefs.map(ref => ref.get()));
          
          profileDocs.forEach((doc, index) => {
            if (doc.exists) {
              profiles.push({ id: doc.id, ...doc.data() });
            } else {
              // Add default profile for users without profiles
              profiles.push({
                id: batch[index],
                displayName: `User ${batch[index].substring(0, 8)}`,
                studentId: '',
                teacherId: '',
                profilePicture: '',
                role: '',
                email: ''
              });
            }
          });
        }
      } else {
        // Fallback to Client SDK
        console.log('Using Client SDK to get profiles');
        
        // Get profiles individually since we're using client SDK
        for (const userId of userIds) {
          const profileRef = doc(db, 'userProfiles', userId);
          const profileDoc = await getDoc(profileRef);
          
          if (profileDoc.exists()) {
            profiles.push({ id: profileDoc.id, ...profileDoc.data() });
          } else {
            // Add default profile for users without profiles
            profiles.push({
              id: userId,
              displayName: `User ${userId.substring(0, 8)}`,
              studentId: '',
              teacherId: '',
              profilePicture: '',
              role: '',
              email: ''
            });
          }
        }
      }
      
      console.log('Profiles fetched successfully, count:', profiles.length);
      
      return NextResponse.json({
        success: true,
        profiles: profiles
      });
      
    } catch (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
    }
    
  } catch (error) {
    console.error('=== Error in get multiple user profiles API ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch profiles', details: error.message },
      { status: 500 }
    );
  }
}
