"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { readApiResponse } from "@/lib/read-api-response";

type AuthResponse = { user: { id: string; email: string } };
type SessionResponse = { user: AuthResponse["user"] | null };

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => readApiResponse<SessionResponse>(response))
      .then((payload) => {
        if (active && payload.user) router.replace("/learning");
      })
      .catch(() => {
        if (active) setError("Could not connect to the sign-in service. Try again shortly.");
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await readApiResponse<AuthResponse>(
        await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
      );
      router.replace("/learning");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-labelledby="auth-title">
        <Image
          src="/images/drupalmentor-logo.svg"
          alt="Drupal Mentor"
          width={168}
          height={45}
          priority
        />
        <span className="section-kicker">YOUR PRIVATE LEARNING SPACE</span>
        <h1 id="auth-title">{mode === "login" ? "Welcome back." : "Create your learner account."}</h1>
        <p>Each account has its own lessons, assessment results, and saved progress.</p>

        {error && <p className="auth-error" role="alert">{error}</p>}
        <form onSubmit={submit}>
          <label htmlFor="learner-email">Email address</label>
          <input
            id="learner-email"
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="learner-password">Password</label>
          <input
            id="learner-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 12 : undefined}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {mode === "register" && (
            <small className="auth-password-note">Use at least 12 characters. Passwords are securely hashed.</small>
          )}
          <button className="placement-primary-button auth-submit" type="submit" disabled={busy}>
            {busy ? <LoaderCircle className="placement-spinner" size={15} /> : <ShieldCheck size={15} />}
            {mode === "login" ? "Sign in" : "Create account"}
            {!busy && <ArrowRight size={15} />}
          </button>
        </form>

        <button
          className="auth-mode-toggle"
          type="button"
          onClick={() => {
            setMode((current) => current === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        <div className="auth-security-note"><ShieldCheck size={14} /> Your progress is private to your account.</div>
      </section>
    </main>
  );
}
