import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export const firestore = getFirestore(getFirebaseApp());


