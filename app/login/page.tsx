"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error ?? "Could not sign in.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("Cannot connect to the school server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <p className="muted">FAVOUR INT'L SCHOOL</p>
        <h1>Sign in with PIN</h1>
        <p className="muted">Enter your personal PIN to access your school workspace.</p>

        <form onSubmit={submit} className="grid">
          <label className="grid">
            <span>Personal PIN</span>
            <input
              autoFocus
              required
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              minLength={4}
              maxLength={6}
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 4–6 digit PIN"
            />
          </label>

          <button
            className="button"
            disabled={busy || !/^[0-9]{4,6}$/.test(pin)}
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message && <p role="alert">{message}</p>}

        <p className="muted" style={{ marginTop: 16 }}>
          Favour Int'l School · Secure school records
        </p>
      </div>
    </main>
  );
}
