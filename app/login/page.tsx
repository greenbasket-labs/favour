"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPin, setShowPin] = useState(false);

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
        setMessage(data.error ?? "Unable to sign in. Check your PIN and try again.");
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
    <main
      className="shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #f0f7f2 0%, #f7f8fa 55%, #e9f2ec 100%)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 430,
          margin: "24px auto",
          padding: "32px 28px",
          borderRadius: 20,
          border: "1px solid #dce8df",
          boxShadow: "0 18px 50px rgba(22, 65, 42, 0.09)",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            aria-hidden="true"
            style={{
              width: 60,
              height: 60,
              margin: "0 auto 18px",
              display: "grid",
              placeItems: "center",
              borderRadius: 18,
              background: "#166534",
              color: "#fff",
              fontSize: 29,
              fontWeight: 800,
              letterSpacing: "-0.06em",
            }}
          >
            F
          </div>
          <p
            style={{
              margin: "0 0 7px",
              color: "#166534",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
            }}
          >
            FAVOUR INT&apos;L SCHOOL
          </p>
          <p style={{ margin: 0, color: "#667085", fontSize: 12 }}>
            MASAKA · SCHOOL MANAGEMENT PORTAL
          </p>
        </header>

        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1
            style={{
              margin: "0 0 9px",
              color: "#173b28",
              fontSize: 28,
              lineHeight: 1.2,
              letterSpacing: "-0.04em",
            }}
          >
            Welcome back
          </h1>
          <p style={{ margin: 0, color: "#667085", lineHeight: 1.6 }}>
            Sign in to access your school workspace.
          </p>
        </div>

        <form onSubmit={submit} className="grid" style={{ gap: 18 }}>
          <label className="grid" style={{ gap: 8 }}>
            <span style={{ color: "#344054", fontSize: 14, fontWeight: 700 }}>
              Personal PIN
            </span>
            <div style={{ position: "relative" }}>
              <input
                autoFocus
                required
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoComplete="current-password"
                minLength={4}
                maxLength={6}
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter your 4–6 digit PIN"
                aria-describedby="pin-help"
                style={{
                  width: "100%",
                  minHeight: 48,
                  padding: "12px 82px 12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  background: "#fff",
                  color: "#17202a",
                  outlineColor: "#166534",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin((visible) => !visible)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "7px 9px",
                  border: 0,
                  borderRadius: 7,
                  background: "#f0f7f2",
                  color: "#166534",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {showPin ? "Hide" : "Show"}
              </button>
            </div>
            <span id="pin-help" style={{ color: "#667085", fontSize: 12 }}>
              Use the PIN assigned to your account.
            </span>
          </label>

          <button
            className="button"
            disabled={busy || !/^[0-9]{4,6}$/.test(pin)}
            style={{
              width: "100%",
              minHeight: 48,
              justifyContent: "center",
              borderRadius: 10,
              background: busy || !/^[0-9]{4,6}$/.test(pin) ? "#9aafa0" : "#166534",
              fontWeight: 700,
              transition: "background 150ms ease",
            }}
          >
            {busy ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        {message && (
          <p
            role="alert"
            style={{
              marginTop: 18,
              padding: "11px 12px",
              borderRadius: 9,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#991b1b",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            margin: "22px 0 0",
            textAlign: "center",
            color: "#667085",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Don&apos;t have login details? Contact your school administrator.
        </p>

        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid #e5ebe7",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 5px", color: "#166534", fontSize: 12, fontWeight: 700 }}>
            AUTHORIZED SCHOOL USERS ONLY
          </p>
          <p style={{ margin: 0, color: "#667085", fontSize: 12 }}>
            Favour Int&apos;l School · School records and learning
          </p>
        </div>
      </div>
    </main>
  );
}
