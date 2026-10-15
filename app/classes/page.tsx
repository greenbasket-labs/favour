"use client";

import { useEffect, useState } from "react";

type SchoolClass = { id: string; name: string; arm: string | null; active?: boolean };
type Section = { id: string; name: string; classes: SchoolClass[] };
const standardArms = [{ value: "A", label: "Arm A" }, { value: "B", label: "Arm B" }, { value: "C", label: "Arm C" }];

export default function ClassesPage() {
  const [schoolId, setSchoolId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [className, setClassName] = useState("");
  const [newName, setNewName] = useState("");
  const [armChoice, setArmChoice] = useState("");
  const [customArm, setCustomArm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const me = await fetch("/api/auth/me");
      const meData = await me.json();
      if (!me.ok) throw new Error("Unable to load your account.");
      const id = meData?.user?.membership?.schoolId;
      if (!id) throw new Error("No active school membership found.");
      setSchoolId(id);
      const response = await fetch(`/api/schools/${id}/sections`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Unable to load sections.");
      const loaded: Section[] = Array.isArray(data) ? data : data?.sections ?? [];
      setSections(loaded);
      const section = loaded.find(item => item.id === sectionId) ?? loaded[0];
      setSectionId(section?.id ?? "");
      setClassName(current => section?.classes?.some(item => item.name === current) ? current : section?.classes?.[0]?.name ?? "");
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); /* initial load only */ }, []);

  const selectedSection = sections.find(section => section.id === sectionId);
  const classNames = Array.from(new Set((selectedSection?.classes ?? []).map(item => item.name))).sort((a, b) => a.localeCompare(b));
  const selectedName = classNames.includes(className) ? className : classNames[0] ?? "";
  const records = (selectedSection?.classes ?? []).filter(item => item.name === selectedName);
  const mainClass = records.find(item => !item.arm) ?? null;
  const arms = records.filter(item => Boolean(item.arm)).sort((a, b) => (a.arm ?? "").localeCompare(b.arm ?? ""));

  async function createClass(name: string, arm: string | null) {
    if (!schoolId || !selectedSection || !name.trim()) { setMessage("Choose a section and enter a class name."); return false; }
    setSaving("create"); setMessage("");
    try {
      const response = await fetch(`/api/schools/${schoolId}/classes`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: selectedSection.id, name: name.trim(), arm }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Unable to save class.");
      setSections(current => current.map(section => section.id === selectedSection.id ? { ...section, classes: [...section.classes, data] } : section));
      setClassName(name.trim()); setMessage(arm ? `${name.trim()} — ${arm} added.` : `${name.trim()} class added.`);
      return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save class."); return false; }
    finally { setSaving(""); }
  }

  async function addArm() {
    const arm = armChoice === "CUSTOM" ? customArm.trim() : armChoice;
    if (!selectedName || !arm) { setMessage("Select a main class and choose or enter an arm."); return; }
    if (await createClass(selectedName, arm)) { setArmChoice(""); setCustomArm(""); }
  }

  async function toggleClass(item: SchoolClass) {
    if (!schoolId || saving) return;
    const active = item.active === false;
    setSaving(item.id); setMessage("");
    try {
      const response = await fetch(`/api/schools/${schoolId}/classes/${item.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Unable to update class status.");
      setSections(current => current.map(section => ({ ...section, classes: section.classes.map(row => row.id === item.id ? { ...row, ...data } : row) })));
      setMessage(`${item.name}${item.arm ? ` — ${item.arm}` : ""} ${active ? "reactivated" : "disabled"}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update class status."); }
    finally { setSaving(""); }
  }

  async function deleteClass(item: SchoolClass) {
    const label = `${item.name}${item.arm ? ` — ${item.arm}` : " (main class)"}`;
    if (!window.confirm(`Permanently delete ${label}? This is allowed only if no school records depend on it.`)) return;
    setSaving(item.id); setMessage("");
    try {
      const response = await fetch(`/api/schools/${schoolId}/classes/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Unable to delete this class record.");
      setSections(current => current.map(section => ({ ...section, classes: section.classes.filter(row => row.id !== item.id) })));
      setMessage(`${label} permanently deleted.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete this class record."); }
    finally { setSaving(""); }
  }

  function classRecord(item: SchoolClass, label: string) {
    const active = item.active !== false;
    return <div key={item.id} style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", opacity: active ? 1 : 0.7 }}>
      <div><strong>{label}</strong><p className="muted" style={{ margin: "4px 0 0" }}>{active ? "Active" : "Disabled"}</p></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" disabled={!!saving} onClick={() => void toggleClass(item)}>{saving === item.id ? "Saving..." : active ? "Disable" : "Reactivate"}</button>
        <button type="button" disabled={!!saving} onClick={() => void deleteClass(item)}>Delete</button>
      </div>
    </div>;
  }

  return <main className="workspace-main">
    <div className="workspace-header"><div><p className="muted">Admin</p><h1>Classes</h1><p>Manage main classes and their optional arms in one place.</p></div></div>
    {message && <div role="status" style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "#f3f4f6" }}>{message}</div>}
    {loading ? <p>Loading...</p> : sections.length === 0 ? <section className="workspace-card"><h2>No sections yet</h2><p>Add a section first, then return here to configure its classes.</p></section> : <>
      <section className="workspace-card">
        <label htmlFor="section-select"><strong>Section</strong></label>
        <select id="section-select" value={sectionId} onChange={event => { const id = event.target.value; const section = sections.find(item => item.id === id); setSectionId(id); setClassName(section?.classes?.[0]?.name ?? ""); }} style={{ display: "block", width: "100%", maxWidth: 420, marginTop: 8 }}>
          {sections.map(section => <option key={section.id} value={section.id}>{section.name}</option>)}
        </select>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          <h2>Add main class</h2><p>Create SS1, SS2, Primary 1, or another main class first. Arms are optional.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <input value={newName} onChange={event => setNewName(event.target.value)} placeholder="Main class name (e.g. SS1)" aria-label="Main class name" />
            <button type="button" disabled={!!saving} onClick={() => { if (!newName.trim()) { setMessage("Enter the main class name, for example SS1."); return; } void createClass(newName, null).then(saved => { if (saved) setNewName(""); }); }}>{saving === "create" ? "Saving..." : "Add Class"}</button>
          </div>
        </div>
      </section>
      <section className="workspace-card" style={{ marginTop: 20 }}>
        <label htmlFor="class-select"><strong>Select main class</strong></label>
        <select id="class-select" value={selectedName} onChange={event => setClassName(event.target.value)} disabled={classNames.length === 0} style={{ display: "block", width: "100%", maxWidth: 420, marginTop: 8 }}>
          {classNames.length === 0 ? <option value="">No classes in this section yet</option> : classNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        {selectedName && <>
          {arms.length === 0 && <div style={{ marginTop: 20 }}><h2>{selectedName}</h2>
            {mainClass ? classRecord(mainClass, selectedName) : <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}><p>This class has no arms yet. Add the main class record to use {selectedName} without arms.</p><button type="button" disabled={!!saving} onClick={() => void createClass(selectedName, null)}>Create main class record</button></div>}
          </div>}
          {arms.length > 0 && <p className="muted" style={{ marginTop: 16 }}>This class has arms, so use each arm independently. The standalone {selectedName} is not shown as a separate class.</p>}
          <div style={{ marginTop: 20 }}><h3>Arms</h3>{arms.length ? <div style={{ display: "grid", gap: 10 }}>{arms.map(item => classRecord(item, `${selectedName} — Arm ${item.arm}`))}</div> : <p>No arms added. This class can be used without arms.</p>}</div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}><h3>Add an arm to {selectedName}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <select value={armChoice} onChange={event => setArmChoice(event.target.value)} aria-label="Arm to add"><option value="">Choose arm</option>{standardArms.map(arm => <option key={arm.value} value={arm.value}>{arm.label}</option>)}<option value="CUSTOM">Custom arm...</option></select>
              {armChoice === "CUSTOM" && <input value={customArm} onChange={event => setCustomArm(event.target.value)} placeholder="Custom arm name" aria-label="Custom arm name" />}
              <button type="button" disabled={!!saving} onClick={() => void addArm()}>{saving === "create" ? "Saving..." : "Add Arm"}</button>
            </div>
          </div>
        </>}
      </section>
    </>}
  </main>;
}
