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
  addDoc,
  query,
  where
} from '@react-native-firebase/firestore';

export class BaseRepository<T extends FirebaseFirestoreTypes.DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  public async get(id: string): Promise<T | null> {
    try {
      const documentRef = doc(getFirestore(), this.collectionName, id);
      const documentSnapshot = await getDoc(documentRef);
      if (documentSnapshot.exists()) {
        return { id: documentSnapshot.id, ...documentSnapshot.data() } as unknown as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  public async create(id: string, data: T): Promise<void> {
    try {
      const documentRef = doc(getFirestore(), this.collectionName, id);
      await setDoc(documentRef, data as any);
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  public async add(data: T): Promise<string> {
    try {
      const collectionRef = firestoreCollection(getFirestore(), this.collectionName);
      const documentRef = await addDoc(collectionRef, data as any);
      return documentRef.id;
    } catch (error) {
      console.error(`Error adding document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  public async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const documentRef = doc(getFirestore(), this.collectionName, id);
      await updateDoc(documentRef, data as any);
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const documentRef = doc(getFirestore(), this.collectionName, id);
      await deleteDoc(documentRef);
    } catch (error) {
      console.error(`Error deleting document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Helper to perform basic query where field == value
   */
  public async getByField(field: string, value: any): Promise<T[]> {
    try {
      const collectionRef = firestoreCollection(getFirestore(), this.collectionName);
      const q = query(collectionRef, where(field, '==', value));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      })) as unknown as T[];
    } catch (error) {
      console.error(`Error querying ${this.collectionName} by ${field}:`, error);
      throw error;
    }
  }

  /**
   * Helper to perform query with multiple equality where clauses
   */
  public async getByFields(conditions: Record<string, any>): Promise<T[]> {
    try {
      const collectionRef = firestoreCollection(getFirestore(), this.collectionName);
      
      // Start with base collection, then apply where clauses sequentially
      let q: any = collectionRef;
      for (const [field, value] of Object.entries(conditions)) {
        q = query(q, where(field, '==', value));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      })) as unknown as T[];
    } catch (error) {
      console.error(`Error querying ${this.collectionName} by multiple fields:`, error);
      throw error;
    }
  }
}
