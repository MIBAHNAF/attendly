import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  doc, 
  updateDoc, 
  arrayRemove, 
  getDoc 
} from 'firebase/firestore';

/**
 * DELETE /api/student/classes/[classId]
 * Removes a student from a specific class
 * @param {Request} request - The HTTP request object
 * @param {Object} context - Contains route parameters
 * @returns {Response} JSON response with success status or error
 */
export async function DELETE(request, { params }) {
  try {
    const { classId } = params;
    const { studentId } = await request.json();

    if (!classId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Class ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Get the class document to verify it exists
    const classRef = doc(db, 'classes', classId);
    const classDoc = await getDoc(classRef);

    if (!classDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    const classData = classDoc.data();

    // Check if student is actually enrolled in this class
    if (!classData.students || !classData.students.includes(studentId)) {
      return NextResponse.json(
        { success: false, error: 'Student is not enrolled in this class' },
        { status: 400 }
      );
    }

    // Remove student from the class
    await updateDoc(classRef, {
      students: arrayRemove(studentId),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully left the class'
    });

  } catch (error) {
    console.error('Error leaving class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to leave class' },
      { status: 500 }
    );
  }
}
