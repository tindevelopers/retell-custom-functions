import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { firestore } from '../../../lib/firebase-admin';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const snapshot = await firestore.collection('users').get();
  const users = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { email, name, role, assignedClients } = body;
  if (!email || !role) {
    return NextResponse.json({ error: 'Missing email or role' }, { status: 400 });
  }
  const existing = await firestore.collection('users').where('email', '==', email).limit(1).get();
  if (!existing.empty) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const doc = await firestore.collection('users').add({
    email,
    name: name || '',
    role,
    assignedClients: assignedClients || [],
    createdAt: new Date(),
  });
  return NextResponse.json({ id: doc.id }, { status: 201 });
}


