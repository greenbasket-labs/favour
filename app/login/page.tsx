
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginMode = "signin" | "teacher-signin" | "activate";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("signin");
  const [pin, setPin] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [teacherPin, setTeacherPin] = useState("");
  const [activationPin, setActivationPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showTeacherPin, setShowTeacherPin] = useState(false);

  function changeMode(nextMode: LoginMode) {
    setMode(nextMode);
    setMessage("");
    setShowPin(false);
    setShowTeacherPin(false);
  }

  async function submitPersonalPin(event: FormEvent<HTMLFormElement>) {
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
        setMessage(
          data.error ?? "Unable to sign in. Check your PIN and try again."
        );
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

  async function submitTeacherSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherCode: teacherCode.trim(),
          teacherPin,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data.error ??
            "Teacher sign-in failed. Check your Teacher ID and PIN."
        );
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

  async function activateTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (newPin !== confirmPin) {
      setMessage("The new PINs do not match.");
      return;
    }

    if (!/^\d{4,8}$/.test(newPin)) {
      setMessage("Your new PIN must contain 4 to 8 digits.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/teacher/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherCode: teacherCode.trim(),
          activationPin,
          newPin,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // Recovery case: the permanent PIN was saved, but this device
      // could not be registered. Allow the teacher to sign in manually.
      if (data.requiresSignIn && data.activated) {
        setMessage(
          data.error ??
            "Your permanent PIN was saved. Please sign in using your Teacher ID and new PIN."
        );
        setMode("teacher-signin");
        setTeacherPin(newPin);
        return;
      }

      if (!response.ok) {
        setMessage(
          data.error ??
            "Teacher activation failed. Check your details and try again."
        );
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

  const inputStyle = {
    width: "100%",
    minHeight: 48,
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    background: "#fff",
    color: "#17202a",
    outlineColor: "#166534",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    color: "#344054",
    fontSize: 14,
    fontWeight: 700 as const,
  };

  const tabStyle = (selected: boolean) => ({
    minHeight: 44,
    padding: "8px 5px",
    borderRadius: 10,
    border: "1px solid #dce8df",
    background: selected ? "#166534" : "#fff",
    color: selected ? "#fff" : "#344054",
    fontWeight: 700 as const,
    fontSize: 12,
    cursor: "pointer",
  });

  return (
    <main
      className="shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #f0f7f2 0%, #f7f8fa 55%, #e9f2ec 100%)",
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
        <header style={{ textAlign: "center", marginBottom: 24 }}>
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

        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <h1
            style={{
              margin: "0 0 9px",
              color: "#173b28",
              fontSize: 27,
              lineHeight: 1.2,
              letterSpacing: "-0.04em",
            }}
          >
            {mode === "signin"
              ? "Welcome back"
              : mode === "teacher-signin"
                ? "Teacher sign-in"
                : "Activate teacher account"}
          </h1>

          <p style={{ margin: 0, color: "#667085", lineHeight: 1.6 }}>
            {mode === "signin"
              ? "Sign in to access your school workspace."
              : mode === "teacher-signin"
                ? "Use your Teacher ID and permanent PIN to access your workspace."
                : "Use the temporary PIN from your administrator to create your permanent PIN."}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 6,
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            onClick={() => changeMode("signin")}
            aria-pressed={mode === "signin"}
            style={tabStyle(mode === "signin")}
          >
            Personal PIN
          </button>

          <button
            type="button"
            onClick={() => changeMode("teacher-signin")}
            aria-pressed={mode === "teacher-signin"}
            style={tabStyle(mode === "teacher-signin")}
          >
            Teacher sign-in
          </button>

          <button
            type="button"
            onClick={() => changeMode("activate")}
            aria-pressed={mode === "activate"}
            style={tabStyle(mode === "activate")}
          >
            Activation
          </button>
        </div>

        {mode === "signin" && (
          <form
            onSubmit={submitPersonalPin}
            className="grid"
            style={{ gap: 18 }}
          >
            <label className="grid" style={{ gap: 8 }}>
              <span style={labelStyle}>Personal PIN</span>

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
                  style={{ ...inputStyle, paddingRight: 78 }}
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

              <span style={{ color: "#667085", fontSize: 12 }}>
                Use the PIN assigned to your personal account.
              </span>
            </label>

            <button
              className="button"
              disabled={busy || !/^\d{4,6}$/.test(pin)}
              style={{
                width: "100%",
                minHeight: 48,
                justifyContent: "center",
                borderRadius: 10,
                background:
                  busy || !/^\d{4,6}$/.test(pin) ? "#9aafa0" : "#166534",
                fontWeight: 700,
              }}
            >
              {busy ? "Signing in..." : "Sign in securely"}
            </button>
          </form>
        )}

        {mode === "teacher-signin" && (
          <form
            onSubmit={submitTeacherSignIn}
            className="grid"
            style={{ gap: 16 }}
          >
            <label className="grid" style={{ gap: 8 }}>
              <span style={labelStyle}>Teacher ID</span>
              <input
                required
                autoComplete="username"
                value={teacherCode}
                onChange={(event) => setTeacherCode(event.target.value)}
                placeholder="Enter your Teacher ID"
                style={inputStyle}
              />
            </label>

            <label className="grid" style={{ gap: 8 }}>
              <span style={labelStyle}>Permanent PIN</span>

              <div style={{ position: "relative" }}>
                <input
                  required
                  type={showTeacherPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  minLength={4}
                  maxLength={8}
                  pattern="[0-9]{4,8}"
                  value={teacherPin}
                  onChange={(event) =>
                    setTeacherPin(
                      event.target.value.replace(/\D/g, "").slice(0, 8)
                    )
                  }
                  placeholder="Enter your permanent PIN"
                  style={{ ...inputStyle, paddingRight: 78 }}
                />

                <button
                  type="button"
                  onClick={() => setShowTeacherPin((visible) => !visible)}
                  aria-label={showTeacherPin ? "Hide PIN" : "Show PIN"}
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
                  {showTeacherPin ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button
              className="button"
              disabled={
                busy ||
                !teacherCode.trim() ||
                !/^\d{4,8}$/.test(teacherPin)
              }
              style={{
                width: "100%",
                minHeight: 48,
                justifyContent: "center",
                borderRadius: 10,
                background:
                  busy ||
                  !teacherCode.trim() ||
                  !/^\d{4,8}$/.test(teacherPin)
                    ? "#9aafa0"
                    : "#166534",
                fontWeight: 700,
              }}
            >
              {busy ? "Signing in..." : "Sign in as teacher"}
            </button>

            <p
              style={{
                margin: 0,
                color: "#667085",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              First time here? Activate your teacher account using the temporary
              PIN provided by your administrator.
            </p>
          </form>
        )}

        {mode === "activate" && (
          <form
            onSubmit={activateTeacher}
            className="grid"
            style={{ gap: 16 }}
          >
            <label className="grid" style={{ gap: 8 }}>
              <span style={labelStyle}>Teacher ID</span>
              <input
                required
                autoComplete="username"
                value={teacherCode}
                onChange={(event) => setTeacherCode(event.target.value)}
                placeholder="Enter your Teacher ID"
                style={inputStyle}
              />
            </label>

            <label className="grid" style={{ gap: 8 }}>
              <span style={labelStyle}>Temporary activation PIN</span>
              <input
                required
                inputMode="numeric"
                autoComplete="off"
                minLength={6}
                maxLength={6}
                pattern="[0-9]{6}"
                value={activationPin}
                onChange={(event) =>
                  setActivationPin(
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="6-digit temporary PIN"
                style={inputStyle}
              />
            </label>

            <label className="grid" style={{ gap: 8 }}>
              <span style={labelStyle}>Create permanent PIN</span>
              <input
                required
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                minLength={4}
                maxLength={8}
                pattern="[0-9]{4,8}"
                value={newPin}
                onChange={(event) =>
                  setNewPin(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
                placeholder="Choose 4–8 digits"
                style={inputStyle}
              />
            </label>

            <label className="grid" style={{ gap: 8 }}>
              <span style={labelStyle}>Confirm permanent PIN</span>
              <input
                required
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                minLength={4}
                maxLength={8}
                pattern="[0-9]{4,8}"
                value={confirmPin}
                onChange={(event) =>
                  setConfirmPin(
                    event.target.value.replace(/\D/g, "").slice(0, 8)
                  )
                }
                placeholder="Enter the new PIN again"
                style={inputStyle}
              />
            </label>

            <p
              style={{
                margin: 0,
                color: "#667085",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Your temporary PIN expires after 24 hours if unused. Never share
              your permanent PIN with anyone.
            </p>

            <button
              className="button"
              disabled={
                busy ||
                !teacherCode.trim() ||
                !/^\d{6}$/.test(activationPin) ||
                !/^\d{4,8}$/.test(newPin) ||
                newPin !== confirmPin
              }
              style={{
                width: "100%",
                minHeight: 48,
                justifyContent: "center",
                borderRadius: 10,
                background:
                  busy ||
                  !teacherCode.trim() ||
                  !/^\d{6}$/.test(activationPin) ||
                  !/^\d{4,8}$/.test(newPin) ||
                  newPin !== confirmPin
                    ? "#9aafa0"
                    : "#166534",
                fontWeight: 700,
              }}
            >
              {busy ? "Activating account..." : "Activate teacher account"}
            </button>
          </form>
        )}

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
          {mode === "activate"
            ? "Don't have a temporary activation PIN? Ask your school administrator to issue one."
            : "Don't have login details? Contact your school administrator."}
        </p>

        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid #e5ebe7",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 5px",
              color: "#166534",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
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
