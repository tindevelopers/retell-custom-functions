import Link from 'next/link';

export default function Home() {
  return (
    <div className="card">
      <h1>Retell Functions Admin</h1>
      <p>Manage transfer schedules and settings.</p>
      <p style={{ marginTop: 12 }}>
        Go to your project config:{' '}
        <Link href="/projects/default">
          <strong>/projects/default</strong>
        </Link>{' '}
        (replace &ldquo;default&rdquo; with your project ID).
      </p>
    </div>
  );
}

