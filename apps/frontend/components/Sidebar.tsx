"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Dashboard", roles: ["super_admin", "client_admin", "user"] },
  { href: "/clients", label: "Clients", roles: ["super_admin"] },
  { href: "/admin/users", label: "Users", roles: ["super_admin"] },
  { href: "/admin/clients", label: "Client Admin", roles: ["super_admin"] },
  { href: "/docs", label: "Docs", roles: ["super_admin", "client_admin", "user"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const role = (data?.user as any)?.role;

  return (
    <div className="min-h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="text-lg font-semibold">Retell Admin</div>
        {data?.user?.email && (
          <div className="text-sm text-gray-600 mt-1">
            {data.user.email} {role ? `• ${role}` : ""}
          </div>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links
          .filter((link) => !role || link.roles.includes(role))
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded text-sm ${
                pathname === link.href ? "bg-gray-100 font-semibold" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full text-sm text-left text-gray-700 hover:text-gray-900"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}


