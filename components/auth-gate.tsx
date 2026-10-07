"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readApiResponse } from "@/lib/read-api-response";

type User = { id: string; email: string };
type AuthState = { user: User | null };
type SessionResponse = { user: User | null };

const AuthContext = createContext<AuthState>({ user: null });

export function useAuthSession() {
  return useContext(AuthContext);
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"checking" | "authenticated" | "error">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("checking");
    setError("");
    if (pathname === "/login") {
      setUser(null);
      setStatus("authenticated");
      return () => {
        active = false;
      };
    }
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => readApiResponse<SessionResponse>(response))
      .then((payload) => {
        if (!active) return;
        if (!payload.user) {
          setUser(null);
          setStatus("authenticated");
          router.replace("/login");
          return;
        }
        setUser(payload.user);
        setStatus("authenticated");
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Could not verify your sign-in.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (pathname === "/login") {
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
  }
  if (status === "error") {
    return <main className="auth-loading" role="alert">{error}</main>;
  }
  if (status !== "authenticated" || !user) {
    return <main className="auth-loading" aria-live="polite">Checking your secure learning session…</main>;
  }
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
