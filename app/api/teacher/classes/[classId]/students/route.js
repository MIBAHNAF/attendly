import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, arrayRemove } from 'firebase/firestore';

/**
 * DELETE /api/teacher/classes/[classId]/students
 * Removes a student from a class
 */
export async function DELETE(request, { params }) {
  try {
    console.log('=== Remove Student from Class API called ===');
    const { classId } = params;
    const { studentId } = await request.json();
    
    console.log('Removing student:', studentId, 'from class:', classId);
    
    if (!classId || !studentId) {
      return NextResponse.json(
        { error: 'Class ID and Student ID are required' },
        { status: 400 }
      );
    }
    
    try {
      if (adminDb) {
        // Use Admin SDK
        console.log('Using Admin SDK to remove student');
        const classRef = adminDb.collection('classes').doc(classId);
        const classDoc = await classRef.get();
        
        if (!classDoc.exists) {
          return NextResponse.json(
            { error: 'Class not found' },
            { status: 404 }
          );
        }
        
        const classData = classDoc.data();
        if (!classData.students || !classData.students.includes(studentId)) {
          return NextResponse.json(
            { error: 'Student is not enrolled in this class' },
            { status: 400 }
          );
        }
        
        // Remove student from the students array
        const updatedStudents = classData.students.filter(id => id !== studentId);
        await classRef.update({
          students: updatedStudents,
          updatedAt: new Date()
        });
        
      } else {
        // Fallback to Client SDK
        console.log('Using Client SDK to remove student');
        const classRef = doc(db, 'classes', classId);
        const classDoc = await getDoc(classRef);
        
        if (!classDoc.exists()) {
          return NextResponse.json(
            { error: 'Class not found' },
            { status: 404 }
          );
        }
        
        const classData = classDoc.data();
        if (!classData.students || !classData.students.includes(studentId)) {
          return NextResponse.json(
            { error: 'Student is not enrolled in this class' },
            { status: 400 }
          );
        }
        
        // Remove student using arrayRemove
        await updateDoc(classRef, {
          students: arrayRemove(studentId),
          updatedAt: new Date()
        });
      }
      
      console.log('Student removed successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Student removed from class successfully'
      });
      
    } catch (removeError) {
      console.error('Error removing student:', removeError);
      throw new Error(`Failed to remove student: ${removeError.message}`);
    }
    
  } catch (error) {
    console.error('=== Error in remove student API ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { error: 'Failed to remove student', details: error.message },
      { status: 500 }
    );
  }
}
