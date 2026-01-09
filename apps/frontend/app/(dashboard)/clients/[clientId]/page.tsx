import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../../lib/auth';
import { firestore } from '../../../../lib/firebase-admin';
import Link from 'next/link';

type Props = {
  params: { clientId: string };
};

export default async function ClientDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const role = (session?.user as any)?.role;
  const assignedClients = ((session?.user as any)?.assignedClients || []) as string[];

  const allowed =
    role === 'super_admin' || assignedClients.includes(params.clientId) || assignedClients.length === 0;
  if (!allowed) redirect('/');

  const doc = await firestore.collection('clients').doc(params.clientId).get();
  if (!doc.exists) {
    return <div className="card">Client not found</div>;
  }
  const data = doc.data() as any;

  const functions = [
    {
      id: 'RETELL_TRANSFER_WEEKDAYS',
      name: 'Transfer - Weekdays',
      description: 'Call transfer during weekday hours',
    },
    {
      id: 'RETELL_TRANSFER_SATURDAY',
      name: 'Transfer - Saturday',
      description: 'Call transfer during Saturday hours',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">{data.name || params.clientId}</h1>
        <p className="text-gray-600">Workspace: {data.retellWorkspaceId}</p>
        <p className="text-gray-600">GCS bucket: {data.gcsBucket}</p>
        <p className="text-gray-600">Cloud Run: {data.cloudRunUrl}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Functions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {functions.map((fn) => (
            <Link
              key={fn.id}
              href={`/clients/${params.clientId}/functions/${fn.id}`}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-sm"
            >
              <div className="font-semibold">{fn.name}</div>
              <div className="text-sm text-gray-600">{fn.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

