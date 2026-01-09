import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { firestore } from '../../../lib/firebase-admin';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  const assignedClients = (session.user as any).assignedClients as string[] | undefined;

  const snapshot = await firestore.collection('clients').where('status', '==', 'active').get();
  let clients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  if (role !== 'super_admin' && assignedClients?.length) {
    clients = clients.filter((c) => assignedClients.includes(c.id as string));
  }
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { id, name, retellWorkspaceId, gcsBucket, cloudRunUrl } = body;
  if (!id || !name || !retellWorkspaceId || !gcsBucket || !cloudRunUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  await firestore
    .collection('clients')
    .doc(id)
    .set({
      name,
      slug: id,
      retellWorkspaceId,
      gcsBucket,
      cloudRunUrl,
      status: 'active',
      createdAt: new Date(),
    });
  return NextResponse.json({ ok: true }, { status: 201 });
}


