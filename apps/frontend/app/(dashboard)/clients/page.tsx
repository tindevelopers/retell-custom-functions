import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';
import { firestore } from '../../../lib/firebase-admin';
import { ClientCard } from '../../../components/ClientCard';

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }
  const role = (session?.user as any)?.role;
  const assignedClients = ((session?.user as any)?.assignedClients || []) as string[];

  const snapshot = await firestore.collection('clients').get();
  let clients = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  if (role !== 'super_admin' && assignedClients.length) {
    clients = clients.filter((c) => assignedClients.includes(c.id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-gray-600">Manage Retell clients and their configurations.</p>
        </div>
      </div>
      {clients.length === 0 ? (
        <div className="card">No clients found.</div>
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

