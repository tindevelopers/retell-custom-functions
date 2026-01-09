"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export function AuthGuard({ children, requireAdmin }: Props) {
  const { status, data } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    if (requireAdmin && data?.user?.role !== "super_admin") {
      router.replace("/");
    }
  }, [status, data, router, pathname, requireAdmin]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}


