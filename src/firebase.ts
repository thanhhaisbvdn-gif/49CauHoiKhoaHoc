import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

let authPromise: Promise<any> | null = null;

// Sign in anonymously for multiplayer features if not already signed in
export const ensureAuth = async () => {
  if (auth.currentUser) return auth.currentUser;
  if (authPromise) return authPromise;
  
  authPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        authPromise = null;
        resolve(user);
      } else {
        try {
          const result = await signInAnonymously(auth);
          authPromise = null;
          resolve(result.user);
        } catch (error: any) {
          authPromise = null;
          const isRestricted = error.code === 'auth/admin-restricted-operation';
          const isTooManyRequests = error.code === 'auth/too-many-requests';
          
          if (isRestricted || isTooManyRequests) {
            console.warn(`Auth issue (${error.code}). Using guest fallback.`);
            // Fallback to a guest user object
            let guestId = localStorage.getItem('guest_uid');
            if (!guestId) {
              guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
              localStorage.setItem('guest_uid', guestId);
            }
            resolve({ uid: guestId, isAnonymous: true, displayName: null, email: null } as any);
          } else {
            reject(error);
          }
        }
      }
    });
  });

  return authPromise;
};

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successful");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();
