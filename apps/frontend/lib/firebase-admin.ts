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

function getFirestoreInstance(): Firestore | null {
  // During build, env vars aren't available - return null
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // During build phase, return null - will be initialized at runtime
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NEXT_PHASE === 'phase-export' ||
                    process.env.NODE_ENV === 'production' && !process.env.VERCEL;
    if (isBuild) {
      return null;
    }
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not set');
  }
  
  if (!_firestore) {
    _firestore = getFirestore(getFirebaseApp());
  }
  return _firestore;
}

// Create a mock collection that matches Firestore API during build
function createMockCollection() {
  return {
    where: () => createMockCollection(),
    limit: () => createMockCollection(),
    get: () => Promise.resolve({ empty: true, docs: [] }),
    doc: () => ({
      get: () => Promise.resolve({ exists: false }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
  };
}

// Lazy getter - only initializes when actually accessed at runtime
export const firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getFirestoreInstance();
    if (!instance) {
      // During build, return a mock collection
      if (prop === 'collection') {
        return () => createMockCollection();
      }
      // Return a no-op for other properties
      return () => Promise.resolve({ empty: true, docs: [] });
    }
    const value = instance[prop as keyof Firestore];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});


