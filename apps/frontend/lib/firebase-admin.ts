import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function getCredentials() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not set');
  }
  try {
    return JSON.parse(json);
  } catch (err) {
    throw new Error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON');
  }
}

function getFirebaseApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  
  const credentials = getCredentials();
  return initializeApp({
    credential: cert(credentials),
  });
}

let _firestore: Firestore | null = null;

function getFirestoreInstance(): Firestore {
  // During build, env vars aren't available - defer initialization
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // This should only happen during build - throw a clear error
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export') {
      throw new Error(
        'Firebase Admin SDK cannot be initialized during build. ' +
        'Make sure GOOGLE_APPLICATION_CREDENTIALS_JSON is set in Vercel environment variables.'
      );
    }
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not set');
  }
  
  if (!_firestore) {
    _firestore = getFirestore(getFirebaseApp());
  }
  return _firestore;
}

// Lazy getter - only initializes when actually accessed at runtime
export const firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getFirestoreInstance();
    const value = instance[prop as keyof Firestore];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});


