import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import { firestore } from '../../lib/firebase-admin';
import { ClientCard } from '../../components/ClientCard';

type Client = {
  id: string;
  name: string;
  retellWorkspaceId?: string;
  gcsBucket?: string;
  status?: string;
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }
  const role = (session?.user as any)?.role;
  const assignedClients = ((session?.user as any)?.assignedClients || []) as string[];

  let query = firestore.collection('clients').where('status', '==', 'active');
  if (role !== 'super_admin' && assignedClients.length) {
    query = query.where('__name__', 'in', assignedClients.slice(0, 10));
  }

  const snapshot = await query.get();
  const clients = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as Client[];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Retell Admin</h1>
        <p className="text-gray-600">
          Manage multiple clients and their Retell custom functions in one place.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="card">No clients assigned to your account. Contact an admin.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              id={client.id}
              name={client.name || client.id}
              status={client.status}
              workspace={client.retellWorkspaceId}
              bucket={client.gcsBucket}
              href={`/clients/${client.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

