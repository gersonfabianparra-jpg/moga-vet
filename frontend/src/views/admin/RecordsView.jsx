import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import api from "../../services/api.js";
import T from "../../styles/tokens.js";
import { fmtDate, spIcon } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import { TableWrap, TR, TD } from "../../components/layout/Table.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import TypeBadge from "../../components/ui/badges/TypeBadge.jsx";

/* ── Generador PDF de receta ─────────────────────────────────────────────── */
async function generatePrescriptionPDF({ record, pet, owner, settings, medications, notes, isRetained }) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();

  // ── Cabecera clínica
  let y = 18;
  if (settings?.logoBase64) {
    try { doc.addImage(settings.logoBase64, "PNG", 14, 10, 22, 22); } catch {}
  }
  const nameX = settings?.logoBase64 ? 40 : 14;
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text(settings?.clinicName || "Clínica Veterinaria", nameX, y);
  if (settings?.phone || settings?.address) {
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
    if (settings?.phone) { y += 5; doc.text(`Tel: ${settings.phone}`, nameX, y); }
    if (settings?.address) { y += 5; doc.text(settings.address, nameX, y); }
  }

  // ── Título + badge receta retenida
  y = 40;
  doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5);
  doc.line(14, y, W - 14, y);
  y += 8;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(30);
  doc.text("RECETA MÉDICA VETERINARIA", W / 2, y, { align: "center" });
  if (isRetained) {
    y += 7;
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.setFillColor(220, 38, 38); doc.setTextColor(255);
    doc.roundedRect(W / 2 - 30, y - 5, 60, 8, 2, 2, "F");
    doc.text("RECETA RETENIDA", W / 2, y, { align: "center" });
    doc.setTextColor(30);
  }

  // ── Datos mascota y propietario
  y += 14;
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60);
  const col2 = W / 2 + 4;
  doc.setFont("helvetica", "bold"); doc.text("Paciente", 14, y);
  doc.setFont("helvetica", "bold"); doc.text("Propietario/a", col2, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${pet?.name || "—"}`, 14, y);
  doc.text(`Nombre: ${owner?.name || "—"}`, col2, y);
  y += 5;
  doc.text(`Especie: ${pet?.species || "—"} · ${pet?.breed || ""}`, 14, y);
  doc.text(`Teléfono: ${owner?.phone || "—"}`, col2, y);
  y += 5;
  doc.text(`Edad: ${pet?.age ? `${pet.age} año(s)` : "—"}  Peso: ${record?.weight ? `${record.weight} kg` : "—"}`, 14, y);
  y += 5;
  doc.text(`Fecha: ${record?.date || new Date().toISOString().slice(0,10)}`, 14, y);
  doc.text(`Veterinario/a: ${record?.vet || "—"}`, col2, y);

  // ── Tabla de medicamentos
  y += 10;
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30);
  doc.text("Medicamentos prescritos", 14, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Medicamento", "Dosis", "Frecuencia", "Duración"]],
    body: medications.map((m) => [m.name || "—", m.dose || "—", m.frequency || "—", m.days ? `${m.days} días` : "—"]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: { 0: { fontStyle: "bold" } },
  });

  // ── Notas
  if (notes?.trim()) {
    const ny = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(30);
    doc.text("Indicaciones adicionales:", 14, ny);
    doc.setFont("helvetica", "normal"); doc.setTextColor(60);
    const lines = doc.splitTextToSize(notes.trim(), W - 28);
    doc.text(lines, 14, ny + 6);
  }

  // ── Firma
  const signY = doc.lastAutoTable ? doc.lastAutoTable.finalY + (notes?.trim() ? 30 : 20) : 200;
  doc.setDrawColor(180); doc.setLineWidth(0.3);
  doc.line(W - 80, signY, W - 14, signY);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
  doc.text(record?.vet || "Firma del veterinario/a", W - 47, signY + 5, { align: "center" });

  doc.save(`receta-${pet?.name || "mascota"}-${record?.date || "hoy"}.pdf`);
}

/* ── Modal de receta ─────────────────────────────────────────────────────── */
function PrescriptionModal({ record, pet, owner, settings, onClose }) {
  const emptyMed = () => ({ id: Date.now(), name: "", dose: "", frequency: "", days: "" });
  const [meds, setMeds]         = useState([emptyMed()]);
  const [notes, setNotes]       = useState("");
  const [isRetained, setRetain] = useState(false);
  const [busy, setBusy]         = useState(false);

  const updateMed = (idx, key, val) => setMeds(meds.map((m, i) => i === idx ? { ...m, [key]: val } : m));
  const addMed    = () => setMeds([...meds, emptyMed()]);
  const removeMed = (idx) => meds.length > 1 && setMeds(meds.filter((_, i) => i !== idx));

  const generate = async () => {
    if (!meds[0].name.trim()) return;
    setBusy(true);
    await generatePrescriptionPDF({ record, pet, owner, settings, medications: meds, notes, isRetained });
    setBusy(false);
    onClose();
  };

  const inputStyle = {
    flex: 1, padding: "8px 10px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.input,
    color: T.text, fontSize: 12, fontFamily: T.font, outline: "none",
  };

  return (
    <Modal title={`Receta médica — ${pet?.name || ""}`} onClose={onClose}>
      {/* Datos del paciente (solo lectura) */}
      <div style={{ background: T.panel, borderRadius: 10, padding: "10px 14px", marginBottom: 14,
        border: `1px solid ${T.border}`, fontSize: 12, color: T.textMuted, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <span><strong style={{ color: T.text }}>{pet?.name}</strong> · {pet?.species} · {pet?.age} año(s)</span>
        <span>Vet: <strong style={{ color: T.text }}>{record?.vet || "—"}</strong></span>
        <span>Fecha: <strong style={{ color: T.text }}>{record?.date || "—"}</strong></span>
      </div>

      {/* Lista de medicamentos */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Medicamentos
      </div>
      {meds.map((m, idx) => (
        <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 60px 28px", gap: 6, marginBottom: 8, alignItems: "center" }}>
          <input style={inputStyle} placeholder="Nombre del medicamento *" value={m.name}    onChange={(e) => updateMed(idx, "name",      e.target.value)} />
          <input style={inputStyle} placeholder="Dosis"                    value={m.dose}    onChange={(e) => updateMed(idx, "dose",      e.target.value)} />
          <input style={inputStyle} placeholder="Frecuencia"               value={m.frequency} onChange={(e) => updateMed(idx, "frequency", e.target.value)} />
          <input style={inputStyle} type="number" min="1" placeholder="Días" value={m.days}  onChange={(e) => updateMed(idx, "days",      e.target.value)} />
          <button onClick={() => removeMed(idx)}
            style={{ background: "rgba(220,38,38,0.1)", border: "none", color: "#DC2626", borderRadius: 6, cursor: "pointer", fontSize: 14, padding: "4px 0" }}>✕</button>
        </div>
      ))}
      <button onClick={addMed}
        style={{ fontSize: 12, color: T.brand, background: "transparent", border: `1px dashed ${T.border}`,
          borderRadius: 8, cursor: "pointer", padding: "6px 14px", fontFamily: T.font, width: "100%", marginBottom: 14 }}>
        ＋ Agregar medicamento
      </button>

      <Input label="Indicaciones adicionales" textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Administrar con alimento, reposo 5 días…" />

      {/* Receta retenida */}
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: -4, marginBottom: 8 }}>
        <input type="checkbox" checked={isRetained} onChange={(e) => setRetain(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: "#DC2626", cursor: "pointer" }} />
        <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
          Receta retenida
        </span>
        <span style={{ fontSize: 11, color: T.textMuted }}>(medicamento de control / psicotrópico)</span>
      </label>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="accent" onClick={generate} disabled={busy || !meds[0]?.name?.trim()}>
          {busy ? "Generando PDF…" : "📄 Generar receta PDF"}
        </Btn>
      </div>
    </Modal>
  );
}

const UNLOCK_KEY = "moga_records_unlocked";
const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY = { petId:"", date:TODAY, vet:"", type:"Control", diagnosis:"", treatment:"", weight:"", temperature:"", notes:"", nextVisit:"" };

// ── Pantalla de bloqueo ───────────────────────────────────────────────────────
function LockScreen({ onUnlock }) {
  const { currentUser } = useApp();
  const [pwd, setPwd]     = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  const verify = async () => {
    if (!pwd.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/login/staff", { email: currentUser.email, password: pwd });
      sessionStorage.setItem(UNLOCK_KEY, "1");
      onUnlock();
    } catch {
      setError("Contraseña incorrecta. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ background:T.panel, borderRadius:20, boxShadow:T.md, border:`1px solid ${T.border}`,
        padding:"48px 44px", width:380, textAlign:"center" }}>

        {/* Ícono candado */}
        <div style={{ width:72, height:72, borderRadius:"50%", margin:"0 auto 20px",
          background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, boxShadow:T.md }}>
          🔒
        </div>

        <div style={{ fontSize:20, fontWeight:800, color:T.text, fontFamily:T.font, marginBottom:6 }}>
          Área protegida
        </div>
        <div style={{ fontSize:13, color:T.textMuted, marginBottom:28, lineHeight:1.5 }}>
          Las fichas médicas son confidenciales.<br/>
          Ingresa tu contraseña de administrador para continuar.
        </div>

        <div style={{ textAlign:"left", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            Contraseña
          </div>
          <input
            type="password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            placeholder="••••••••"
            autoFocus
            style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${error ? T.redText : T.border}`,
              borderRadius:10, fontSize:14, color:T.text, background:T.appBg, fontFamily:T.font,
              outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" }}
          />
          {error && (
            <div style={{ fontSize:12, color:T.redText, marginTop:6, fontWeight:500 }}>⚠ {error}</div>
          )}
        </div>

        <button onClick={verify} disabled={busy || !pwd.trim()}
          style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", cursor: busy ? "wait" : "pointer",
            background: busy || !pwd.trim() ? T.border : T.brand,
            color: busy || !pwd.trim() ? T.textMuted : "#fff",
            fontSize:14, fontWeight:700, fontFamily:T.font, transition:"background 0.15s" }}>
          {busy ? "Verificando…" : "Desbloquear fichas"}
        </button>

        <div style={{ marginTop:16, fontSize:12, color:T.textMuted }}>
          Sesión: <span style={{ fontWeight:600, color:T.text }}>{currentUser?.name}</span>
        </div>
      </div>
    </div>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────────
export default function RecordsView() {
  const { records, pets, users, settings, addRecord, recordsLoaded } = useApp();
  const { isMobile } = useBreakpoint();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === "1");
  const [search, setSearch]     = useState("");
  const [petFilter, setPetFilter] = useState("");
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [rxTarget, setRxTarget] = useState(null);

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  const vets = users.filter((u) => u.role !== "client");
  const filtered = records
    .filter((r) => {
      const pet = pets.find((p) => p.id === r.petId);
      const q   = search.toLowerCase();
      return (!q || pet?.name.toLowerCase().includes(q) || (r.diagnosis || "").toLowerCase().includes(q))
          && (!petFilter || r.petId === +petFilter);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const save = async () => {
    if (!form.petId || !form.diagnosis) return;
    await addRecord({ ...form, petId:+form.petId, weight:+form.weight });
    setModal(false);
    setForm(EMPTY);
  };

  return (
    <div style={{ padding: isMobile ? "0 14px 32px" : "0 36px 36px" }}>
      <PageTitle icon="📋" title="Fichas médicas"
        sub={recordsLoaded ? `${records.length} registros clínicos` : "Cargando fichas…"}
        action={<Btn v="accent" onClick={() => setModal(true)}>+ Nueva ficha</Btn>}/>

      {!recordsLoaded && (
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, padding:"10px 16px",
          background:"rgba(99,102,241,0.08)", borderRadius:10, fontSize:13, color:"#6366f1" }}>
          <span>⏳</span> Cargando historial clínico en segundo plano…
        </div>
      )}

      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.textMuted }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por mascota o diagnóstico…" className="moga-input"
            style={{ padding:"10px 14px 10px 36px", border:`1.5px solid ${T.border}`, borderRadius:10,
              fontSize:14, color:T.text, background:T.panel, fontFamily:T.font, width: isMobile ? "100%" : 280 }}/>
        </div>
        <select value={petFilter} onChange={(e) => setPetFilter(e.target.value)} className="moga-input"
          style={{ padding:"10px 14px", border:`1.5px solid ${T.border}`, borderRadius:10,
            fontSize:14, color:T.text, background:T.panel, fontFamily:T.font }}>
          <option value="">Todas las mascotas</option>
          {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{ marginLeft:"auto", fontSize:13, color:T.textMuted, alignSelf:"center" }}>
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <TableWrap
        heads={["Mascota","Fecha","Tipo","Diagnóstico","Tratamiento","Veterinario/a",""]}
        empty={filtered.length === 0 && recordsLoaded ? "Sin registros encontrados." : undefined}>
        {filtered.map((r) => {
          const pet   = pets.find((p) => p.id === r.petId);
          const owner = users.find((u) => u.id === pet?.ownerId);
          return (
            <TR key={r.id}>
              <TD bold>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:T.brandLight,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                    {spIcon(pet?.species)}
                  </div>
                  {pet?.name ?? "—"}
                </div>
              </TD>
              <TD>{fmtDate(r.date)}</TD>
              <TD><TypeBadge type={r.type}/></TD>
              <TD>
                <div style={{ maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:T.textMid }}>
                  {r.diagnosis || "—"}
                </div>
              </TD>
              <TD>
                <div style={{ maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:T.textMuted }}>
                  {r.treatment || "—"}
                </div>
              </TD>
              <TD muted>{(r.vet || "").replace("Dra. ","").replace("Dr. ","")}</TD>
              <TD>
                <button
                  onClick={() => setRxTarget({ record: r, pet, owner })}
                  title="Generar receta médica"
                  style={{ padding:"5px 10px", borderRadius:8, border:"none", background:"rgba(99,102,241,0.15)",
                    color:"#818CF8", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:T.font,
                    whiteSpace:"nowrap" }}>
                  📋 Receta
                </button>
              </TD>
            </TR>
          );
        })}
      </TableWrap>

      {rxTarget && (
        <PrescriptionModal
          record={rxTarget.record}
          pet={rxTarget.pet}
          owner={rxTarget.owner}
          settings={settings}
          onClose={() => setRxTarget(null)}
        />
      )}

      {modal && (
        <Modal title="Nueva ficha médica" onClose={() => setModal(false)}>
          <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({...form, petId:e.target.value})}>
            <option value="">Seleccionar...</option>
            {pets.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
          </Select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Input label="Fecha *" type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})}/>
            <Select label="Tipo" value={form.type} onChange={(e) => setForm({...form, type:e.target.value})}>
              {["Control","Urgencia","Cirugía","Vacunación"].map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Input label="Peso (kg)" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({...form, weight:e.target.value})} placeholder="25.5"/>
            <Input label="Temperatura (°C)" value={form.temperature} onChange={(e) => setForm({...form, temperature:e.target.value})} placeholder="38.5"/>
          </div>
          <Select label="Veterinario/a" value={form.vet} onChange={(e) => setForm({...form, vet:e.target.value})}>
            <option value="">Seleccionar...</option>
            {vets.map((v) => <option key={v.id}>{v.name}</option>)}
          </Select>
          <Input label="Diagnóstico *" value={form.diagnosis} onChange={(e) => setForm({...form, diagnosis:e.target.value})} placeholder="Ej: Control rutinario. Animal sano."/>
          <Input label="Tratamiento" value={form.treatment} onChange={(e) => setForm({...form, treatment:e.target.value})} placeholder="Ej: Vacuna antirrábica"/>
          <Input label="Notas" textarea value={form.notes} onChange={(e) => setForm({...form, notes:e.target.value})} placeholder="Observaciones adicionales..."/>
          <Input label="Próxima visita" type="date" value={form.nextVisit} onChange={(e) => setForm({...form, nextVisit:e.target.value})}/>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={save}>Guardar ficha</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
