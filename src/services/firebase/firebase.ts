import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Initialize Firebase instances
// React Native Firebase app is initialized natively, so we just export the instances.

export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseFirestore = firestore;
export const firebaseStorage = storage;

export default {
  app: firebaseApp,
  auth: firebaseAuth,
  firestore: firebaseFirestore,
  storage: firebaseStorage,
};
