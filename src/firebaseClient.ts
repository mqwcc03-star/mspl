import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, collection, getDocs, query as fsQuery, where as fsWhere, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, orderBy as fsOrderBy } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase config - prefer environment variables but fall back to embedded values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAwG5oVB0KGf16jD7zTBuLpwH01Ju6oTvE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mspl-attendance.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://mspl-attendance-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mspl-attendance',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mspl-attendance.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '796741291694',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:796741291694:web:202f12e35622068f80273f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-YC8N1WC6MS'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // Analytics may fail in non-browser or when disabled
}

const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Helper wrappers for Firestore operations to mimic minimal Supabase client behavior used in the app.
const from = (collectionName: string) => {
  return {
    select: (fields?: string) => {
      const p = (async () => {
        try {
          const col = collection(firestore, collectionName);
          const snap = await getDocs(col);
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      })();

      // support .eq chaining: select(...).eq(field, value)
      (p as any).eq = (field: string, value: any) => {
        const qp = (async () => {
          try {
            const q = fsQuery(collection(firestore, collectionName), fsWhere(field, '==', value));
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return { data, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        })();
        (qp as any).single = async () => {
          const res = await qp;
          return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: res.error };
        };
        return qp as any;
      };

      (p as any).single = async () => {
        const res = await p;
        return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: res.error };
      };

      // support .order(field, { ascending: boolean }) similar to Supabase
      (p as any).order = (field: string, opts?: { ascending?: boolean }) => {
        const qp = (async () => {
          try {
            const colRef = collection(firestore, collectionName);
            const q = fsQuery(colRef, fsOrderBy(field, opts && opts.ascending ? 'asc' : 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return { data, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        })();
        (qp as any).single = async () => {
          const res = await qp;
          return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: res.error };
        };
        return qp as any;
      };

      return p as any;
    },
    insert: (items: any[]) => {
      const p = (async () => {
        try {
          const results: any[] = [];
          for (const it of items) {
            // if item has id, use it as document id
            if (it.id) {
              await setDoc(doc(firestore, collectionName, it.id), it);
              results.push({ id: it.id, ...it });
            } else {
              const ref = await addDoc(collection(firestore, collectionName), it);
              results.push({ id: ref.id, ...it });
            }
          }
          return { data: results, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      })();

      // attach select().single() helpers to mimic Supabase chain used in repo
      (p as any).select = () => ({ single: async () => {
        const res = await p;
        return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: res.error };
      }});

      return p as any;
    },
    upsert: (items: any[], opts?: any) => {
      const p = (async () => {
        try {
          const results: any[] = [];
          for (const it of items) {
            if (it.id) {
              await setDoc(doc(firestore, collectionName, it.id), it, { merge: true } as any);
              results.push({ id: it.id, ...it });
            } else {
              const ref = await addDoc(collection(firestore, collectionName), it);
              results.push({ id: ref.id, ...it });
            }
          }
          return { data: results, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      })();
      return p as any;
    },
    update: (changes: any) => {
      return {
        eq: async (field: string, value: any) => {
          try {
            if (field === 'id') {
              const ref = doc(firestore, collectionName, value);
              await updateDoc(ref, changes);
              return { data: null, error: null };
            }
            // fallback: query and update matched docs
            const q = fsQuery(collection(firestore, collectionName), fsWhere(field, '==', value));
            const snap = await getDocs(q);
            const batchResults: any[] = [];
            for (const d of snap.docs) {
              const ref = doc(firestore, collectionName, d.id);
              await updateDoc(ref, changes);
              batchResults.push({ id: d.id, ...changes });
            }
            return { data: batchResults, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        }
      };
    },
    delete: () => {
      return {
        eq: async (field: string, value: any) => {
          try {
            if (field === 'id') {
              await deleteDoc(doc(firestore, collectionName, value));
              return { data: null, error: null };
            }
            const q = fsQuery(collection(firestore, collectionName), fsWhere(field, '==', value));
            const snap = await getDocs(q);
            for (const d of snap.docs) {
              await deleteDoc(doc(firestore, collectionName, d.id));
            }
            return { data: null, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        }
      };
    }
  };
};

// Storage shim to mimic `supabase.storage.from(bucket).upload(path, file, opts)` and `getPublicUrl`
const storageShim = {
  from: (bucket: string) => ({
    upload: async (path: string, file: any, opts?: any) => {
      try {
        const fullPath = `${bucket}/${path}`;
        const ref = storageRef(storage, fullPath);
        // If `file` is a base64 string, try to convert
        let payload = file;
        if (typeof file === 'string' && file.startsWith('data:')) {
          // data URL
          const base64 = file.split(',')[1];
          const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          payload = bytes;
        }
        await uploadBytes(ref, payload);
        const url = await getDownloadURL(ref);
        return { data: { path: fullPath, url }, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    getPublicUrl: (path: string) => {
      try {
        const fullPath = `${bucket}/${path}`;
        // Construct a public-style URL for Google Cloud Storage objects. This works when the bucket/file is public or rules allow access.
        const bucketName = firebaseConfig.storageBucket;
        const encoded = encodeURIComponent(fullPath);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media`;
        return { data: { publicUrl }, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  })
};

// Minimal auth wrappers
const authWrapper = {
  signUp: async ({ email, password }: { email: string; password: string }) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      return { data: userCred.user, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      return { data: userCred.user, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },
  signOut: async () => {
    try {
      await signOut(auth);
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
};

// Compose the `supabase` compatibility object
export const supabase = {
  app,
  auth: authWrapper,
  database,
  firestore,
  storage: storageShim,
  analytics,
  from
};

export { app as firebaseApp, auth as firebaseAuth, database as firebaseDatabase, firestore as firebaseFirestore, storage as firebaseStorage, analytics as firebaseAnalytics };
