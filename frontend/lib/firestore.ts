import { firestore } from './firebase-admin';
import { AppUser } from './types';

export type ClientDoc = {
  name: string;
  slug: string;
  retellWorkspaceId: string;
  gcsBucket: string;
  cloudRunUrl: string;
  status: 'active' | 'inactive';
  createdAt: FirebaseFirestore.Timestamp;
};

export async function getUserByEmail(email?: string | null) {
  if (!email) return null;
  const snapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data() as Omit<AppUser, 'id'>;
  return { id: doc.id, ...data };
}

export async function listClients(ids?: string[]) {
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firestore
    .collection('clients')
    .where('status', '==', 'active');

  if (ids && ids.length > 0) {
    query = query.where('id', 'in', ids.slice(0, 10));
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
}


