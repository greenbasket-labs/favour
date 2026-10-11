"use client";

import { useEffect, useState } from "react";

type SchoolClass = {
  id: string;
  name: string;
  arm: string | null;
  active?: boolean;
};

type Section = {
  id: string;
  name: string;
  classes: SchoolClass[];
};

const standardArms = [
  { value: "A", label: "Arm A" },
  { value: "B", label: "Arm B" },
  { value: "C", label: "Arm C" },
];

export default function ClassesPage() {
  const [schoolId, setSchoolId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [customName, setCustomName] = useState("");
  const [customArm, setCustomArm] = useState("");
  const [armChoice, setArmChoice] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const me = await fetch("/api/auth/me");
      const meData = await me.json();

      if (!me.ok) throw new Error("Unable to load your account.");

      const id = meData?.user?.membership?.schoolId;
      if (!id) throw new Error("No active school membership found.");

      setSchoolId(id);

      const response = await fetch(`/api/schools/${id}/sections`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to load sections.");
      }

      const loaded: Section[] = Array.isArray(data)
        ? data
        : data?.sections ?? [];

      setSections(loaded);
      setSelectedId(current =>
        loaded.some(section => section.id === current)
          ? current
          : loaded[0]?.id ?? ""
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selected = sections.find(section => section.id === selectedId);

  async function saveClass(name: string, arm: string): Promise<boolean> {
    if (!schoolId || !selected || !name.trim() || !arm.trim()) {
      setMessage("Enter a class name and choose an arm.");
      return false;
    }

    setSaving("new-class");
    setMessage("");

    try {
      const response = await fetch(`/api/schools/${schoolId}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: selected.id,
          name: name.trim(),
          arm: arm.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to save class arm.");
      }

      setSections(current =>
        current.map(section =>
          section.id === selected.id
            ? { ...section, classes: [...section.classes, data] }
            : section
        )
      );

      setMessage(`${name.trim()} — ${arm.trim()} saved.`);
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save class arm."
      );
      return false;
    } finally {
      setSaving("");
    }
  }

  async function toggleClass(schoolClass: SchoolClass) {
    if (!schoolId || saving) return;

    const nextActive = schoolClass.active === false;
    setSaving(schoolClass.id);
    setMessage("");

    try {
      const response = await fetch(
        `/api/schools/${schoolId}/classes/${schoolClass.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: nextActive }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update class status.");
      }

      setSections(current =>
        current.map(section => ({
          ...section,
          classes: section.classes.map(item =>
            item.id === schoolClass.id
              ? { ...item, ...data }
              : item
          ),
        }))
      );

      setMessage(
        `${schoolClass.name}${schoolClass.arm ? ` — ${schoolClass.arm}` : ""} ${
          nextActive ? "reactivated" : "disabled"
        }.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update class status."
      );
    } finally {
      setSaving("");
    }
  }

  async function saveCustomClass() {
    const arm = armChoice === "CUSTOM" ? customArm.trim() : armChoice;

    if (!customName.trim() || !arm) {
      setMessage("Enter a class name and choose or enter an arm.");
      return;
    }

    const saved = await saveClass(customName, arm);

    if (saved) {
      setCustomName("");
      setCustomArm("");
      setArmChoice("");
    }
  }

  return (
    <main className="workspace-main">
      <div className="workspace-header">
        <div>
          <p className="muted">Admin</p>
          <h1>Classes</h1>
          <p>Manage classes and arms without deleting school records.</p>
        </div>
      </div>

      {message && (
        <div
          role="status"
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: "#f3f4f6",
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : sections.length === 0 ? (
        <section className="workspace-card">
          <h2>No sections yet</h2>
          <p>Add a section first, then return here to configure its classes.</p>
        </section>
      ) : (
        <>
          <section className="workspace-card">
            <div className="workspace-card-header">
              <div>
                <h2>Sections</h2>
                <p>Choose a section to manage its classes.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sections.map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedId(section.id)}
                  aria-pressed={selectedId === section.id}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </section>

          {selected && (
            <section
              className="workspace-card"
              style={{ marginTop: 20 }}
            >
              <div className="workspace-card-header">
                <div>
                  <h2>{selected.name}</h2>
                  <p>
                    Disabled classes remain saved for school history.
                  </p>
                </div>
              </div>

              {selected.classes.length === 0 ? (
                <p>No classes saved yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {selected.classes.map(schoolClass => {
                    const isActive = schoolClass.active !== false;

                    return (
                      <div
                        key={schoolClass.id}
                        style={{
                          padding: 12,
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          opacity: isActive ? 1 : 0.7,
                        }}
                      >
                        <div>
                          <strong>
                            {schoolClass.name}
                            {schoolClass.arm ? ` — ${schoolClass.arm}` : ""}
                          </strong>
                          <p
                            className="muted"
                            style={{ margin: "4px 0 0" }}
                          >
                            {isActive ? "Active" : "Disabled"}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={!!saving}
                          onClick={() => void toggleClass(schoolClass)}
                        >
                          {saving === schoolClass.id
                            ? "Saving..."
                            : isActive
                              ? "Disable"
                              : "Reactivate"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <h3>Add a class arm</h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 12,
                  }}
                >
                  <input
                    value={customName}
                    onChange={event => setCustomName(event.target.value)}
                    placeholder="Class name (e.g. JSS 1)"
                    aria-label="Class name"
                  />

                  <select
                    value={armChoice}
                    onChange={event => setArmChoice(event.target.value)}
                    aria-label="Class arm"
                  >
                    <option value="">Choose arm</option>
                    {standardArms.map(arm => (
                      <option key={arm.value} value={arm.value}>
                        {arm.label}
                      </option>
                    ))}
                    <option value="CUSTOM">Custom arm...</option>
                  </select>

                  {armChoice === "CUSTOM" && (
                    <input
                      value={customArm}
                      onChange={event => setCustomArm(event.target.value)}
                      placeholder="Custom arm name"
                      aria-label="Custom arm name"
                    />
                  )}

                  <button
                    type="button"
                    disabled={!!saving}
                    onClick={() => void saveCustomClass()}
                  >
                    {saving === "new-class" ? "Saving..." : "Add Arm"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}