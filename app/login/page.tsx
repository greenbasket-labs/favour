"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WorkspaceUnlock from "@/components/workspace-unlock";

type Workspace = {
  membershipId: string;
  schoolId: string;
  schoolName: string;
  schoolAbbr: string;
  role: string;
};

export default function Login() {
  const [message, setMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Workspace | null>(null);
  const [pinConfigured, setPinConfigured] = useState(true);
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.emailVerificationRequired && data.email) {
          setVerificationEmail(data.email);
        }
        setMessage(data.error || "Sign-in failed.");
        return;
      }

      setVerificationEmail("");

      const available: Workspace[] = Array.isArray(data.workspaces)
        ? data.workspaces
        : [];

      if (available.length === 0) {
        setMessage(
          "This account is not connected to Favour Int'l School. Please contact the school administrator."
        );
        return;
      }

      if (available.length !== 1) {
        setMessage(
          "This account has multiple active school workspaces. Please contact the administrator to resolve the account setup."
        );
        return;
      }

      setPinConfigured(Boolean(data.pinConfigured));
      setSelectedWorkspace(available[0]);
    } catch {
      setMessage("Unable to connect. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (!verificationEmail) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error || "Could not send the verification email.");
        return;
      }

      router.push(
        "/verify-email?pending=1&email=" +
          encodeURIComponent(verificationEmail)
      );
      router.refresh();
    } catch {
      setMessage("Unable to send the verification email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (selectedWorkspace) {
    return (
      <main className="shell">
        <div className="card" style={{ maxWidth: 440, margin: "56px auto" }}>
          <div className="grid">
            <p className="muted">FAVOUR INT'L SCHOOL</p>
            <h1>Secure access</h1>
            {!pinConfigured ? (
              <>
                <p className="muted">
                  Set up your 4–6 digit PIN before entering your school workspace.
                </p>
                <Link className="button" href="/account">
                  Set up PIN
                </Link>
              </>
            ) : (
              <WorkspaceUnlock
                schoolName="Favour Int'l School"
                onCancel={() => setSelectedWorkspace(null)}
                onUnlock={async pin => {
                  try {
                    const response = await fetch("/api/workspaces/select", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        membershipId: selectedWorkspace.membershipId,
                        pin,
                      }),
                    });

                    const data = await response.json().catch(() => ({}));

                    if (!response.ok) {
                      return {
                        ok: false,
                        error: data.error || "Could not unlock your account.",
                        setupRequired: data.setupRequired,
                      };
                    }

                    router.push("/dashboard");
                    router.refresh();
                    return { ok: true };
                  } catch {
                    return {
                      ok: false,
                      error: "Unable to connect. Please try again.",
                    };
                  }
                }}
              />
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <div
        className="card"
        style={{ maxWidth: 440, margin: "56px auto", padding: 28 }}
      >
        <div className="grid" style={{ gap: 8 }}>
          <p
            className="muted"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            FAVOUR INT'L SCHOOL
          </p>

          <h1 style={{ marginBottom: 0 }}>Sign in</h1>

          <p className="muted" style={{ marginTop: 4 }}>
            Enter your email and password to access your school workspace.
          </p>
        </div>

        <form onSubmit={submit} className="grid" style={{ marginTop: 24 }}>
          <label className="grid" style={{ gap: 6 }}>
            <span>Email address</span>
            <input
              required
              type="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="username"
            />
          </label>

          <label className="grid" style={{ gap: 6 }}>
            <span>Password</span>
            <input
              required
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          <div style={{ textAlign: "right" }}>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          <button className="button" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message && (
          <p role="alert" style={{ marginTop: 16 }}>
            {message}
          </p>
        )}

        {verificationEmail && (
          <div className="grid" style={{ marginTop: 16 }}>
            <p className="muted">
              Your email needs to be verified before you can sign in.
            </p>
            <button
              className="button"
              type="button"
              onClick={resendVerification}
              disabled={busy}
            >
              {busy ? "Please wait..." : "Resend verification email"}
            </button>
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid var(--border, #e5e7eb)",
            marginTop: 24,
            paddingTop: 16,
          }}
        >
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
            Favour Int'l School · Secure school records
          </p>
        </div>
      </div>
    </main>
  );
}
