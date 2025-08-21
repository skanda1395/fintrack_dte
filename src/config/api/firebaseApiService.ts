import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  Firestore,
  addDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

let app: FirebaseApp | undefined;
let database: Firestore | undefined;
let auth: any;

if (firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    database = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error('Firebase initialization failed:', e);
  }
}

const ensureAuth = async () => {
  if (auth && auth.currentUser) {
    return;
  }
  try {
    const __initial_auth_token = '';
    if (
      typeof __initial_auth_token !== 'undefined' &&
      __initial_auth_token.length > 0
    ) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }
  } catch (e) {
    console.error('Firebase authentication failed:', e);
  }
};

export const firebaseApi = {
  get: async (path: string, queryParams: { [key: string]: string } = {}) => {
    if (!database) {
      console.error(
        'Firebase is not initialized. Check your environment variables.'
      );
      return null;
    }
    await ensureAuth();
    const colRef = collection(database, path);

    let q = query(colRef);
    if (queryParams.userId) {
      q = query(colRef, where('userId', '==', queryParams.userId));
    }

    const snapshot = await getDocs(q);

    const data: any[] = [];
    snapshot.forEach((doc) => {
      data.push({ ...doc.data(), id: doc.id });
    });
    return data;
  },

  post: async (path: string, data: any) => {
    if (!database) {
      console.error(
        'Firebase is not initialized. Check your environment variables.'
      );
      return null;
    }
    await ensureAuth();
    const colRef = collection(database, path);
    const newDocRef = await addDoc(colRef, data);
    return { ...data, id: newDocRef.id };
  },

  put: async (path: string, id: string, data: any) => {
    if (!database) {
      console.error(
        'Firebase is not initialized. Check your environment variables.'
      );
      return null;
    }
    await ensureAuth();
    const docRef = doc(database, path, id);
    await updateDoc(docRef, data);
    return data;
  },

  delete: async (path: string, id: string) => {
    if (!database) {
      console.error(
        'Firebase is not initialized. Check your environment variables.'
      );
      return null;
    }
    await ensureAuth();
    const docRef = doc(database, path, id);
    await deleteDoc(docRef);
    return true;
  },
};
