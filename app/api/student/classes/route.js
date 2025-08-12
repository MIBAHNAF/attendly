import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';

/**
 * GET /api/student/classes
 * Purpose: Fetch all classes that a student is enrolled in
 * What it does: Queries Firestore for classes where the student's UID is in the students array
 */
export async function GET(request) {
  try {
    // Extract student ID from URL search params
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }
    
    // Query Firestore for classes where this student is enrolled
    // This searches the 'classes' collection for documents where the 'students' array contains the studentId
    const classesQuery = query(
      collection(db, 'classes'),
      where('students', 'array-contains', studentId)
    );
    
    const querySnapshot = await getDocs(classesQuery);
    console.log('Got query snapshot, docs count:', querySnapshot.size);
    
    let classes = [];
    
    querySnapshot.forEach((doc) => {
      console.log('Processing doc:', doc.id);
      const data = doc.data();
      classes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date()
      });
    });

    // Sort by createdAt in JavaScript instead of Firestore
    classes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Fetch teacher profile information for each class
    for (let classItem of classes) {
      if (classItem.teacherId) {
        try {
          let teacherProfile = null;
          
          if (adminDb) {
            // Use Admin SDK to get teacher profile
            const teacherProfileRef = adminDb.collection('userProfiles').doc(classItem.teacherId);
            const teacherProfileDoc = await teacherProfileRef.get();
            
            if (teacherProfileDoc.exists) {
              teacherProfile = teacherProfileDoc.data();
            }
          } else {
            // Fallback to Client SDK
            const teacherProfileRef = doc(db, 'userProfiles', classItem.teacherId);
            const teacherProfileDoc = await getDoc(teacherProfileRef);
            
            if (teacherProfileDoc.exists()) {
              teacherProfile = teacherProfileDoc.data();
            }
          }
          
          // Set teacher name based on profile data
          if (teacherProfile) {
            // Priority: Profile displayName -> Profile name -> Google display name -> Default "Teacher"
            const teacherName = teacherProfile.displayName || 
                               teacherProfile.name || 
                               teacherProfile.googleDisplayName || 
                               'Teacher';
            classItem.teacherName = teacherName;
          } else {
            classItem.teacherName = 'Teacher';
          }
        } catch (error) {
          console.error('Error fetching teacher profile for', classItem.teacherId, ':', error);
          classItem.teacherName = 'Teacher';
        }
      }
    }
    
    console.log('Returning classes:', classes.length);
    
    return NextResponse.json({ 
      success: true, 
      classes 
    });
    
  } catch (error) {
    console.error('Error fetching student classes:', error);
    
    // For development: if it's a permission error, return empty array
    if (error.code === 'permission-denied') {
      return NextResponse.json({
        success: true,
        classes: [],
        message: 'No classes found or permission denied'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/classes
 * Purpose: Join a student to a class using an invitation code
 * What it does: Finds the class by invitation code and adds the student's UID to the students array
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, invitationCode } = body;
    
    if (!studentId || !invitationCode) {
      return NextResponse.json(
        { error: 'Student ID and invitation code are required' },
        { status: 400 }
      );
    }
    
    // Find the class by invitation code
    const classQuery = query(
      collection(db, 'classes'),
      where('classCode', '==', invitationCode)
    );
    
    const querySnapshot = await getDocs(classQuery);
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 404 }
      );
    }
    
    const classDoc = querySnapshot.docs[0];
    const classData = classDoc.data();
    
    // Check if student is already enrolled
    if (classData.students && classData.students.includes(studentId)) {
      return NextResponse.json(
        { error: 'Already enrolled in this class' },
        { status: 400 }
      );
    }
    
    // Add student to the class
    console.log('Adding student to class...');
    const updatedStudents = classData.students ? [...classData.students, studentId] : [studentId];
    console.log('Updated students array will have', updatedStudents.length, 'students');
    
    try {
      // Use Admin SDK for the update to avoid permission issues
      if (adminDb) {
        console.log('Using Admin SDK to update class');
        await adminDb.collection('classes').doc(classDoc.id).update({
          students: updatedStudents,
          updatedAt: new Date()
        });
      } else {
        console.log('Using Client SDK to update class');
        await updateDoc(doc(db, 'classes', classDoc.id), {
          students: updatedStudents,
          updatedAt: new Date()
        });
      }
      console.log('Successfully updated class document');
    } catch (updateError) {
      console.error('Error updating document:', updateError);
      throw new Error(`Failed to update class: ${updateError.message}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully joined class',
      classData: {
        id: classDoc.id,
        ...classData,
        students: updatedStudents,
        joinedAt: new Date() // Add join timestamp for the student
      }
    });
    
  } catch (error) {
    console.error('=== Error in student join class API ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { error: 'Failed to join class', details: error.message },
      { status: 500 }
    );
  }
}
