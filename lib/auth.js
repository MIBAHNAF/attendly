// lib/auth.js
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Google auth provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let userFriendlyMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      userFriendlyMessage = "No account found with this email";
    } else if (error.code === 'auth/wrong-password') {
      userFriendlyMessage = "Incorrect password";
    } else if (error.code === 'auth/network-request-failed') {
      userFriendlyMessage = "Network error - check your internet connection";
    }
    
    return { success: false, error: userFriendlyMessage };
  }
};

/**
 * Register with email and password
 */
export const registerWithEmail = async (email, password, userData) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Try to send email verification, but don't fail registration if it doesn't work
    let emailVerificationSent = false;
    try {
      await sendEmailVerification(user);
      emailVerificationSent = true;
    } catch (verificationError) {
      console.warn("Email verification failed, but continuing with registration:", verificationError);
      // Continue with registration even if email verification fails
    }
    
    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      emailVerified: false,
      ...userData,
      createdAt: new Date()
    });
    
    const message = emailVerificationSent 
      ? "Account created successfully! Please check your email for verification."
      : "Account created successfully! Email verification will be available later.";
    
    return { 
      success: true, 
      user,
      message,
      emailVerificationSent
    };
  } catch (error) {
    console.error("Registration error:", error);
    let userFriendlyMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      userFriendlyMessage = "An account with this email already exists";
    } else if (error.code === 'auth/weak-password') {
      userFriendlyMessage = "Password should be at least 6 characters";
    } else if (error.code === 'auth/network-request-failed') {
      userFriendlyMessage = "Network error - check your internet connection";
    } else if (error.code === 'auth/invalid-email') {
      userFriendlyMessage = "Please enter a valid email address";
    }
    
    return { success: false, error: userFriendlyMessage };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (role = "teacher") => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create profile
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        role: role, // Use the provided role
        createdAt: new Date()
      });
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Resend email verification
 */
export const resendEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: "No user logged in" };
    }
    
    if (user.emailVerified) {
      return { success: false, error: "Email is already verified" };
    }
    
    await sendEmailVerification(user);
    
    return { success: true, message: "Verification email sent!" };
  } catch (error) {
    console.error("Resend verification error:", error);
    let userFriendlyMessage = error.message;
    
    if (error.code === 'auth/too-many-requests') {
      userFriendlyMessage = "Too many requests. Please wait before requesting another verification email.";
    } else if (error.code === 'auth/network-request-failed') {
      userFriendlyMessage = "Network error - check your internet connection";
    }
    
    return { success: false, error: userFriendlyMessage };
  }
};

/**
 * Sign out user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current user data from Firestore
 */
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Auth state listener
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};