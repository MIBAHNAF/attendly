import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

/**
 * GET /api/classes/lookup/[code]
 * Looks up a class by its invitation code
 * @param {Request} request - The HTTP request object
 * @param {Object} context - Contains route parameters
 * @returns {Response} JSON response with class details or error
 */
export async function GET(request, { params }) {
  try {
    const { code } = params;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Class code is required' },
        { status: 400 }
      );
    }

    // Query Firestore for the class with this invitation code
    const classesRef = collection(db, 'classes');
    const q = query(
      classesRef,
      where('classCode', '==', code)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation code. Please check the code and try again.' },
        { status: 404 }
      );
    }

    // Get the first (and should be only) matching class
    const classDoc = querySnapshot.docs[0];
    const classData = {
      id: classDoc.id,
      ...classDoc.data()
    };

    // Don't expose sensitive data like full student list in lookup
    const publicClassData = {
      id: classData.id,
      className: classData.className,
      subject: classData.subject,
      section: classData.section,
      teacherId: classData.teacherId,
      schedule: classData.schedule,
      room: classData.room,
      description: classData.description,
      studentCount: classData.students ? classData.students.length : 0
    };

    return NextResponse.json({
      success: true,
      class: publicClassData
    });

  } catch (error) {
    console.error('Error looking up class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to lookup class' },
      { status: 500 }
    );
  }
}
