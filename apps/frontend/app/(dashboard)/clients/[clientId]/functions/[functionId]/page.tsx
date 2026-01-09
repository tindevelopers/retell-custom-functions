import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../../../../lib/auth';
import { firestore } from '../../../../../../lib/firebase-admin';
import { ConfigEditor } from '../../../../../../components/ConfigEditor';

type Props = {
  params: { clientId: string; functionId: string };
};

export default async function FunctionConfigPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const role = (session?.user as any)?.role;
  const assignedClients = ((session?.user as any)?.assignedClients || []) as string[];

  const allowed = role === 'super_admin' || assignedClients.includes(params.clientId) || assignedClients.length === 0;
  if (!allowed) redirect('/');

  const clientDoc = await firestore.collection('clients').doc(params.clientId).get();
  if (!clientDoc.exists) {
    return <div className="card">Client not found</div>;
  }
  const client = clientDoc.data() as any;
  const projectId = client.retellWorkspaceId || 'default';

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h1 className="text-xl font-semibold">{client.name || params.clientId}</h1>
        <p className="text-gray-600">Function: {params.functionId}</p>
        <p className="text-gray-600">Project: {projectId}</p>
      </div>
      <ConfigEditor projectId={projectId} />
    </div>
  );
}


