import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminApp;

if (getApps().length === 0) {
  try {
    // Check if we have service account credentials
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Initializing Firebase Admin with service account credentials');
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.log('Service account credentials not found, trying default initialization');
      // Fallback to default initialization (for local emulator or cloud environment)
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } catch (error) {
    console.log('Failed to initialize Firebase Admin:', error.message);
    // If Admin SDK fails, we'll need to use client SDK with different approach
    adminApp = null;
  }
} else {
  adminApp = getApps()[0];
}

// Get Firestore instance with admin privileges if available
export const adminDb = adminApp ? getFirestore(adminApp) : null;

export default adminApp;
