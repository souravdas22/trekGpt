import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import auth, { 
  GoogleAuthProvider, 
  signInWithCredential, 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { firebaseAuth } from './firebase';
import env from '@config/env';

export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Invalid email or password. Please try again.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email is already in use by another account.';
  }
  if (code === 'auth/weak-password') {
    return 'Your password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection.';
  }
  if (code === 'auth/invalid-email') {
    return 'The email address is invalid.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please try again later.';
  }
  
  // Fallback to removing the [auth/...] prefix if it exists
  const message = error?.message || 'Something went wrong. Please try again.';
  return message.replace(/\[.*?\]\s*/, '');
};

export const registerWithEmail = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(getAuth(), email, password) as unknown as FirebaseAuthTypes.UserCredential;
  } catch (error) {
    console.log('Error in registerWithEmail:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await signInWithEmailAndPassword(getAuth(), email, password) as unknown as FirebaseAuthTypes.UserCredential;
  } catch (error) {
    console.log('Error in loginWithEmail:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(getAuth(), email);
  } catch (error) {
    console.log('Error in resetPassword:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Attempt to sign out of Google to clear the saved account selection
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore errors (e.g., if user signed in with email instead of Google)
    }

    if (getAuth().currentUser) {
      await signOut(getAuth());
    }
  } catch (error) {
    console.log('Error in logout:', error);
    throw error;
  }
};

export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return getAuth().currentUser as unknown as FirebaseAuthTypes.User | null;
};

export const onAuthStateChanged = (callback: (user: FirebaseAuthTypes.User | null) => void) => {
  return firebaseOnAuthStateChanged(getAuth(), (user) => {
    callback(user as unknown as FirebaseAuthTypes.User | null);
  });
};

export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    GoogleSignin.configure({ webClientId: env.GOOGLE_WEB_CLIENT_ID });
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    const signInResult = await GoogleSignin.signIn();
    
    if (signInResult.type === 'cancelled' || signInResult.type !== 'success') {
      const err = new Error('Sign-In Cancelled');
      (err as any).code = 'SIGN_IN_CANCELLED';
      throw err;
    }

    // Use getTokens() as recommended in newer versions of GoogleSignin
    const tokens = await GoogleSignin.getTokens();
    
    if (!tokens.idToken) {
      throw new Error('No idToken returned from Google Sign-In');
    }
    
    // Modular API for GoogleAuthProvider
    const googleCredential = GoogleAuthProvider.credential(tokens.idToken, tokens.accessToken);
    
    // Modular API for signInWithCredential
    return await signInWithCredential(getAuth(), googleCredential) as unknown as FirebaseAuthTypes.UserCredential;
  } catch (error: any) {
    // Normalize Google Sign-in cancellation errors
    if (
      error.code === 'SIGN_IN_CANCELLED' || 
      error.code === '12501' || // Common Android cancellation code
      error.message?.toLowerCase().includes('cancel')
    ) {
      error.code = 'SIGN_IN_CANCELLED';
    } else {
      console.log('Error in signInWithGoogle:', error);
    }
    throw error;
  }
};
