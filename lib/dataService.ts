import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Helper to check if running in browser
const isBrowser = typeof window !== 'undefined';

export const DataService = {
  // Saves an item. If userId is provided and not guest, uses Firestore. Else localStorage.
  async saveItem(collectionName: string, id: string, data: any, userId?: string, isGuest: boolean = false) {
    if (isGuest || !userId) {
      if (isBrowser) {
        const key = `guest_${collectionName}_${id}`;
        localStorage.setItem(key, JSON.stringify({ ...data, id, createdAt: new Date().toISOString() }));
      }
      return;
    }

    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...data, userId, updatedAt: new Date() }, { merge: true });
  },

  // Retrieves an item.
  async getItem(collectionName: string, id: string, userId?: string, isGuest: boolean = false) {
    if (isGuest || !userId) {
      if (isBrowser) {
        const key = `guest_${collectionName}_${id}`;
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
      return null;
    }

    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  // Retrieves all items for a user in a collection
  async getItems(collectionName: string, userId?: string, isGuest: boolean = false) {
    if (isGuest || !userId) {
      if (isBrowser) {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`guest_${collectionName}_`)) {
            const itemStr = localStorage.getItem(key);
            if (itemStr) items.push(JSON.parse(itemStr));
          }
        }
        return items;
      }
      return [];
    }

    const q = query(collection(db, collectionName), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Deletes an item
  async deleteItem(collectionName: string, id: string, userId?: string, isGuest: boolean = false) {
    if (isGuest || !userId) {
      if (isBrowser) {
        const key = `guest_${collectionName}_${id}`;
        localStorage.removeItem(key);
      }
      return;
    }

    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },

  // Check if there is any guest data to migrate
  hasGuestData() {
    if (!isBrowser) return false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('guest_')) {
        return true;
      }
    }
    return false;
  },

  // Migrate guest data to Firestore
  async migrateGuestData(userId: string) {
    if (!isBrowser || !userId) return;
    
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('guest_')) {
        const parts = key.split('_');
        // key format: guest_collectionName_id
        if (parts.length >= 3) {
          const collectionName = parts[1];
          const id = parts.slice(2).join('_'); // in case id has underscores
          
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            try {
              const item = JSON.parse(itemStr);
              // Save to Firestore
              const docRef = doc(db, collectionName, id);
              await setDoc(docRef, { ...item, userId, migratedAt: new Date() }, { merge: true });
              keysToRemove.push(key);
            } catch (e) {
              console.error("Migration error for key", key, e);
            }
          }
        }
      }
    }
    
    // Clean up local storage after successful migration
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
  
  // Clear guest data
  clearGuestData() {
    if (!isBrowser) return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('guest_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};
