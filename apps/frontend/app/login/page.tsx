"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  return (
    <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg p-8 mt-12">
      <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
      <p className="text-sm text-gray-600 mb-6">
        Use your Google account to access the Retell admin.
      </p>
      <button
        className="button"
        onClick={() => signIn("google", { callbackUrl })}
        style={{ width: "100%", justifyContent: "center" }}
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg p-8 mt-12">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}


