import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

let firestoreInstance: Firestore | null = null;

export const getDb = (): Firestore | null => {
  if (!firestoreInstance) {
    try {
      firestoreInstance = getFirestore(app);
    } catch (e) {
      console.warn('[firebaseAuth] Could not initialize Firestore:', e);
    }
  }
  return firestoreInstance;
};

// Export db as a safe lazy proxy so importing db does not eagerly start IndexedDB connections
export const db = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    const instance = getDb();
    if (!instance) return undefined;
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});


