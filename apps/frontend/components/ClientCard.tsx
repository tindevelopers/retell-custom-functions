"use client";

import Link from "next/link";

type Props = {
  id: string;
  name: string;
  status?: string;
  workspace?: string;
  bucket?: string;
  href?: string;
};

export function ClientCard({ id, name, status = "active", workspace, bucket, href }: Props) {
  return (
    <Link
      href={href || `/clients/${id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      </div>
      {workspace && <div className="text-sm text-gray-600">Retell workspace: {workspace}</div>}
      {bucket && <div className="text-sm text-gray-600">GCS bucket: {bucket}</div>}
    </Link>
  );
}


