import { NextRequest, NextResponse } from 'next/server';

const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const adminSecret = process.env.ADMIN_SHARED_SECRET;

if (!backendBase) {
  console.warn('NEXT_PUBLIC_API_BASE_URL is not set');
}

export async function GET(_: NextRequest, { params }: { params: { projectId: string } }) {
  if (!backendBase || !adminSecret) {
    console.error('Missing env vars:', { backendBase: !!backendBase, adminSecret: !!adminSecret });
    return NextResponse.json({ error: 'backend_not_configured' }, { status: 500 });
  }
  const url = `${backendBase.replace(/\/$/, '')}/admin/projects/${params.projectId}/config`;
  const authHeader = `Bearer ${adminSecret.trim()}`;
  console.log('Making request to:', url);
  console.log('Auth header length:', authHeader.length);
  const res = await fetch(url, {
    headers: { Authorization: authHeader },
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: { projectId: string } }) {
  if (!backendBase || !adminSecret) {
    return NextResponse.json({ error: 'backend_not_configured' }, { status: 500 });
  }
  const body = await req.json();
  const url = `${backendBase.replace(/\/$/, '')}/admin/projects/${params.projectId}/config`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

