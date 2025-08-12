import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * PUT /api/teacher/classes/[classId]
 * Updates an existing class
 */
export async function PUT(request, { params }) {
  try {
    console.log('=== Teacher Update Class API called ===');
    const { classId } = params;
    const updateData = await request.json();
    
    console.log('Updating class ID:', classId);
    console.log('Update data:', updateData);
    
    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }
    
    // Add updatedAt timestamp
    const classUpdate = {
      ...updateData,
      updatedAt: new Date()
    };
    
    try {
      if (adminDb) {
        // Use Admin SDK
        console.log('Using Admin SDK to update class');
        await adminDb.collection('classes').doc(classId).update(classUpdate);
      } else {
        // Fallback to Client SDK
        console.log('Using Client SDK to update class');
        await updateDoc(doc(db, 'classes', classId), classUpdate);
      }
      
      console.log('Class updated successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Class updated successfully',
        classId: classId
      });
      
    } catch (updateError) {
      console.error('Error updating class:', updateError);
      throw new Error(`Failed to update class: ${updateError.message}`);
    }
    
  } catch (error) {
    console.error('=== Error in teacher update class API ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { error: 'Failed to update class', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/classes/[classId]
 * Deletes a class and all associated data
 */
export async function DELETE(request, { params }) {
  try {
    console.log('=== Teacher Delete Class API called ===');
    const { classId } = params;
    
    console.log('Deleting class ID:', classId);
    
    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }
    
    try {
      if (adminDb) {
        // Use Admin SDK
        console.log('Using Admin SDK to delete class');
        await adminDb.collection('classes').doc(classId).delete();
      } else {
        // Fallback to Client SDK
        console.log('Using Client SDK to delete class');
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'classes', classId));
      }
      
      console.log('Class deleted successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Class deleted successfully',
        classId: classId
      });
      
    } catch (deleteError) {
      console.error('Error deleting class:', deleteError);
      throw new Error(`Failed to delete class: ${deleteError.message}`);
    }
    
  } catch (error) {
    console.error('=== Error in teacher delete class API ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete class', details: error.message },
      { status: 500 }
    );
  }
}
