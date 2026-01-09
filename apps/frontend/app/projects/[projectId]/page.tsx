"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ConfigEditor } from '../../../components/ConfigEditor';

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId || 'default';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Link href="/">← Back</Link>
      <h1>Project: {projectId}</h1>
      <ConfigEditor projectId={projectId} />
    </div>
  );
}

