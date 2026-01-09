import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { firestore } from '../../../../lib/firebase-admin';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { name, role, assignedClients } = body;
  await firestore
    .collection('users')
    .doc(params.id)
    .set(
      {
        ...(name ? { name } : {}),
        ...(role ? { role } : {}),
        ...(assignedClients ? { assignedClients } : {}),
        updatedAt: new Date(),
      },
      { merge: true },
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || (session.user as any).role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await firestore.collection('users').doc(params.id).delete();
  return NextResponse.json({ ok: true });
}


