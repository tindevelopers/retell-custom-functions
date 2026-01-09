/* eslint-disable no-console */
const admin = require('firebase-admin');

function getCredentials() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not set');
  return JSON.parse(json);
}

function init() {
  if (admin.apps.length) return admin.app();
  return admin.initializeApp({
    credential: admin.credential.cert(getCredentials()),
  });
}

async function seed() {
  init();
  const db = admin.firestore();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  const clientId = process.env.CLIENT_ID || 'pet-store';
  const clientName = process.env.CLIENT_NAME || 'Pet Store Direct';
  const workspaceId = process.env.CLIENT_WORKSPACE_ID || 'org_P5F0bnCrRcdlNtZk';
  const bucket = process.env.CLIENT_GCS_BUCKET || 'pet-store-direct-retell-configs';
  const cloudRunUrl =
    process.env.CLIENT_CLOUD_RUN_URL ||
    'https://out-of-office-transfer-880489367524.us-central1.run.app';

  // Seed client
  const clientRef = db.collection('clients').doc(clientId);
  await clientRef.set(
    {
      name: clientName,
      slug: clientId,
      retellWorkspaceId: workspaceId,
      gcsBucket: bucket,
      cloudRunUrl,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`Client upserted: ${clientId}`);

  // Seed super admin user
  const userQuery = await db.collection('users').where('email', '==', adminEmail).limit(1).get();
  if (userQuery.empty) {
    await db.collection('users').add({
      email: adminEmail,
      name: adminName,
      role: 'super_admin',
      assignedClients: [clientId],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Super admin created: ${adminEmail}`);
  } else {
    const doc = userQuery.docs[0];
    await doc.ref.set(
      {
        name: adminName,
        role: 'super_admin',
        assignedClients: [clientId],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    console.log(`Super admin updated: ${adminEmail}`);
  }
}

seed()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


