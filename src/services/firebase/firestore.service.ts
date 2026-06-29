import { 
  FirebaseFirestoreTypes,
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection as firestoreCollection,
  getDocs,
  addDoc
} from '@react-native-firebase/firestore';

export const addDocument = async <T extends FirebaseFirestoreTypes.DocumentData>(
  collection: string,
  data: T
): Promise<string> => {
  try {
    const collectionRef = firestoreCollection(getFirestore(), collection);
    const documentRef = await addDoc(collectionRef, data as any);
    return documentRef.id;
  } catch (error) {
    console.log(`Error adding document in ${collection}:`, error);
    throw error;
  }
};

export const createDocument = async <T extends FirebaseFirestoreTypes.DocumentData>(
  collection: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    const documentRef = doc(getFirestore(), collection, docId);
    await setDoc(documentRef, data as any);
  } catch (error) {
    console.log(`Error creating document in ${collection}:`, error);
    throw error;
  }
};

export const updateDocument = async <T extends FirebaseFirestoreTypes.DocumentData>(
  collection: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  try {
    const documentRef = doc(getFirestore(), collection, docId);
    await updateDoc(documentRef, data as any);
  } catch (error) {
    console.log(`Error updating document in ${collection}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collection: string, docId: string): Promise<void> => {
  try {
    const documentRef = doc(getFirestore(), collection, docId);
    await deleteDoc(documentRef);
  } catch (error) {
    console.log(`Error deleting document in ${collection}:`, error);
    throw error;
  }
};

export const getDocument = async <T extends FirebaseFirestoreTypes.DocumentData>(
  collection: string,
  docId: string
): Promise<T | null> => {
  try {
    const documentRef = doc(getFirestore(), collection, docId);
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      return documentSnapshot.data() as T;
    }
    return null;
  } catch (error) {
    console.log(`Error getting document from ${collection}:`, error);
    throw error;
  }
};

export const getCollection = async <T extends FirebaseFirestoreTypes.DocumentData>(
  collection: string
): Promise<(T & { id: string })[]> => {
  try {
    const collectionRef = firestoreCollection(getFirestore(), collection);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(documentSnapshot => ({
      id: documentSnapshot.id,
      ...(documentSnapshot.data() as T),
    }));
  } catch (error) {
    console.log(`Error getting collection ${collection}:`, error);
    throw error;
  }
};
