import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, collection, query, where, getDocs, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { classId, classCode, method = 'nfc', userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    if (!classId && !classCode) {
      return NextResponse.json(
        { success: false, error: 'Class ID or class code required' },
        { status: 400 }
      );
    }

    // Get current date
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // First, find the class if only classCode is provided
    let finalClassId = classId;
    let classData = null;
    
    if (!finalClassId && classCode) {
      const classesRef = collection(db, 'classes');
      const classQuery = query(classesRef, where('inviteCode', '==', classCode));
      const classSnapshot = await getDocs(classQuery);
      
      if (classSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: 'Class not found' },
          { status: 404 }
        );
      }
      
      const classDoc = classSnapshot.docs[0];
      finalClassId = classDoc.id;
      classData = classDoc.data();
      
      // Check if student is enrolled
      if (!classData.students?.includes(userId)) {
        return NextResponse.json(
          { success: false, error: 'Student not enrolled in this class' },
          { status: 403 }
        );
      }
    } else if (finalClassId) {
      // Get class data if we have classId
      const classDoc = await getDoc(doc(db, 'classes', finalClassId));
      if (!classDoc.exists()) {
        return NextResponse.json(
          { success: false, error: 'Class not found' },
          { status: 404 }
        );
      }
      classData = classDoc.data();
    }

    // Check if attendance already exists for today
    const attendanceRef = collection(db, 'attendance');
    const existingAttendanceQuery = query(
      attendanceRef,
      where('studentId', '==', userId),
      where('classId', '==', finalClassId),
      where('date', '==', dateString)
    );
    const existingAttendance = await getDocs(existingAttendanceQuery);

    if (!existingAttendance.empty) {
      return NextResponse.json({
        success: true,
        alreadyPresent: true,
        message: 'Attendance already recorded for today'
      });
    }

    // Create attendance record
    const attendanceId = `${userId}_${finalClassId}_${dateString}`;
    const attendanceData = {
      studentId: userId,
      classId: finalClassId,
      teacherId: classData.teacherId,
      checkInTime: serverTimestamp(),
      method: method,
      status: 'present',
      date: dateString,
      createdAt: serverTimestamp()
    };

    // Save attendance record
    await setDoc(doc(db, 'attendance', attendanceId), attendanceData);

    return NextResponse.json({
      success: true,
      alreadyPresent: false,
      attendanceId: attendanceId,
      checkInTime: new Date().toISOString(),
      message: 'Attendance marked successfully'
    });

  } catch (error) {
    console.error('Attendance check-in error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}