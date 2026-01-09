export default function DocsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Documentation</h1>
        <p className="text-gray-600">
          How to use the admin interface, add clients, and manage users for Retell custom functions.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Authentication</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Sign in with Google (approved emails only)</li>
          <li>Super Admin can add/remove users and assign clients</li>
          <li>Client Admin can manage their clients and users</li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Clients</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Each client maps to a Retell workspace and a dedicated GCS bucket</li>
          <li>Use the Clients page to view details and function links</li>
          <li>Use Admin &gt; Clients to add new client records</li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Functions</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Open a client, then pick a function to edit its configuration</li>
          <li>JSON editor is available; form-based editor can be added later</li>
          <li>Use deny/allow windows to control operating hours</li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">User Roles</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Super Admin: manage all clients, users, functions</li>
          <li>Client Admin: manage assigned clients and their users</li>
          <li>User: view/edit functions for assigned clients only</li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Developer Notes</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Seed script: <code>npm run seed</code> with GOOGLE_APPLICATION_CREDENTIALS_JSON set</li>
          <li>Env vars: GOOGLE_CLIENT_ID/SECRET, NEXTAUTH_SECRET, NEXT_PUBLIC_API_BASE_URL</li>
          <li>Backend per-client buckets are planned; currently uses existing Cloud Run endpoint</li>
        </ul>
      </div>
    </div>
  );
}


