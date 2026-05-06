import { useState } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { useApp } from "../../context/AppContext.jsx";
import { useNotify } from "../../context/NotificationContext.jsx";
import T from "../../styles/tokens.js";
import { fmtDate, spIcon, vaxStatus, VACCINES_LIST } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import { TableWrap, TR, TD } from "../../components/layout/Table.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import VaxBadge from "../../components/ui/badges/VaxBadge.jsx";

const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY = { petId: "", name: "", dateApplied: TODAY, nextDue: "", vet: "", lot: "" };

function VaxForm({ form, setForm, pets, vets }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
          <option value="">Seleccionar...</option>
          {pets.map((p) => <option key={p.id} value={p.id}>{spIcon(p.species)} {p.name}</option>)}
        </Select>
        <Select label="Vacuna *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}>
          <option value="">Seleccionar...</option>
          {VACCINES_LIST.map((v) => <option key={v}>{v}</option>)}
        </Select>
        <Input label="Fecha aplicación *" type="date" value={form.dateApplied} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })} />
        <Input label="Próxima dosis *"    type="date" value={form.nextDue}     onChange={(e) => setForm({ ...form, nextDue: e.target.value })} />
      </div>
      <Select label="Veterinario/a" value={form.vet} onChange={(e) => setForm({ ...form, vet: e.target.value })}>
        <option value="">Seleccionar...</option>
        {vets.map((v) => <option key={v.id}>{v.name}</option>)}
      </Select>
      <Input label="N° de lote" value={form.lot} onChange={(e) => setForm({ ...form, lot: e.target.value })} placeholder="VR2026-XXX" />
    </>
  );
}

export default function VaccinesView() {
  const { vaccines, pets, users, appointments, addVaccine, updateVaccine, removeVaccine, updateAppointment } = useApp();
  const notify = useNotify();
  const { isMobile } = useBreakpoint();

  const [petFilter, setPetFilter] = useState("");
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(false);       // new vaccine modal
  const [editTarget, setEditTarget] = useState(null);      // vaccine object being edited
  const [deleteTarget, setDeleteTarget] = useState(null);  // vaccine to delete
  const [form, setForm]           = useState(EMPTY);
  const [editForm, setEditForm]   = useState(EMPTY);
  const [applying, setApplying]   = useState(null);
  const [busy, setBusy]           = useState(false);

  const vets    = users.filter((u) => u.role !== "client");
  const overdue  = vaccines.filter((v) => vaxStatus(v.nextDue).key === "red");
  const upcoming = vaccines.filter((v) => vaxStatus(v.nextDue).key === "amber");

  const pendingVaxAppts = appointments
    .filter((a) => a.type === "vacuna" && (a.status === "confirmada" || a.status === "pendiente"))
    .sort((a, b) => a.date.localeCompare(b.date));

  const applyVaccine = async (appt) => {
    setApplying(appt.id);
    try {
      await addVaccine({ petId: appt.petId || null, name: appt.notes || "Vacuna (reserva online)", dateApplied: appt.date, nextDue: "", vet: appt.guestName || "", lot: "" });
      await updateAppointment(appt.id, { status: "completada" });
      notify("Vacuna registrada y cita completada.", "success");
    } catch { notify("Error al registrar la vacuna.", "error"); }
    finally { setApplying(null); }
  };

  const filtered = vaccines
    .filter((v) => {
      if (petFilter && v.petId !== +petFilter) return false;
      if (search) {
        const pet  = pets.find((p) => p.id === v.petId);
        const q    = search.toLowerCase();
        if (!(v.name?.toLowerCase().includes(q) || pet?.name?.toLowerCase().includes(q) || v.vet?.toLowerCase().includes(q))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const o = { red: 0, amber: 1, green: 2 };
      return (o[vaxStatus(a.nextDue).key] || 0) - (o[vaxStatus(b.nextDue).key] || 0);
    });

  const save = async () => {
    if (!form.petId || !form.name) return;
    setBusy(true);
    try {
      await addVaccine({ ...form, petId: +form.petId });
      setModal(false);
      setForm(EMPTY);
      notify("Vacuna registrada.", "success");
    } catch { notify("Error al registrar la vacuna.", "error"); }
    finally { setBusy(false); }
  };

  const openEdit = (v) => {
    setEditForm({ petId: String(v.petId || ""), name: v.name || "", dateApplied: v.dateApplied || TODAY, nextDue: v.nextDue || "", vet: v.vet || "", lot: v.lot || "" });
    setEditTarget(v);
  };

  const saveEdit = async () => {
    if (!editForm.petId || !editForm.name) return;
    setBusy(true);
    try {
      await updateVaccine(editTarget.id, { ...editForm, petId: +editForm.petId });
      setEditTarget(null);
      notify("Vacuna actualizada.", "success");
    } catch { notify("Error al actualizar la vacuna.", "error"); }
    finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await removeVaccine(deleteTarget.id);
      setDeleteTarget(null);
      notify("Vacuna eliminada.", "info");
    } catch { notify("Error al eliminar.", "error"); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ padding: isMobile ? "0 14px 32px" : "0 36px 36px" }}>
      <PageTitle icon="💉" title="Vacunas & Recordatorios"
        sub={`${vaccines.length} registros · ${overdue.length} vencidas · ${upcoming.length} próximas`}
        action={<Btn v="accent" onClick={() => setModal(true)}>+ Registrar vacuna</Btn>} />

      {/* Vacunaciones agendadas */}
      {pendingVaxAppts.length > 0 && (
        <div style={{ background: T.panel, borderRadius: 16, border: "1.5px solid #6366F1", boxShadow: T.sm, padding: "18px 22px", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>📅</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Vacunaciones agendadas</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Citas reservadas online — pendientes de aplicar</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingVaxAppts.map((a) => {
              const pet = pets.find((p) => p.id === a.petId);
              const SC  = { confirmada: { bg: "#D1FAE5", color: "#065F46" }, pendiente: { bg: "#FEF3C7", color: "#92400E" } };
              const sc  = SC[a.status] || SC.pendiente;
              return (
                <div key={a.id} style={{ background: T.appBg, borderRadius: 12, border: `1px solid ${T.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 22 }}>💉</span>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{a.guestPetName || pet?.name || "Mascota"}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                      {a.guestName ? `📱 ${a.guestName}` : `👤 ${users.find((u) => u.id === a.clientId)?.name || "—"}`}
                      {a.guestPhone ? ` · ${a.guestPhone}` : ""}
                    </div>
                    {a.notes && <div style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic", marginTop: 2 }}>📝 {a.notes}</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>📅 {a.date} · {a.time}</div>
                    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color }}>
                      {a.status === "confirmada" ? "Confirmada" : "Pendiente"}
                    </span>
                  </div>
                  {a.status === "confirmada" ? (
                    <button onClick={() => applyVaccine(a)} disabled={applying === a.id}
                      style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "#4F46E5", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: T.font, opacity: applying === a.id ? 0.7 : 1 }}>
                      {applying === a.id ? "Registrando…" : "✓ Marcar aplicada"}
                    </button>
                  ) : (
                    <button onClick={() => updateAppointment(a.id, { status: "confirmada" })}
                      style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "#D1FAE5", color: "#065F46", fontSize: 12, fontWeight: 700, fontFamily: T.font }}>
                      ✓ Confirmar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas */}
      {(overdue.length > 0 || upcoming.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: overdue.length && upcoming.length ? "1fr 1fr" : "1fr", gap: 14, marginBottom: 22 }}>
          {overdue.length > 0 && (
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #fca5a5" }}>
              <div style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", padding: "14px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>🚨 Vencidas — {overdue.length}</div>
              </div>
              <div style={{ background: "#fff" }}>
                {overdue.map((v) => { const pet = pets.find((p) => p.id === v.petId); return (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                    <div><span style={{ fontWeight: 700, color: T.text }}>{spIcon(pet?.species)} {pet?.name}</span> — {v.name}</div>
                    <span style={{ color: T.redText, fontWeight: 600, fontSize: 12 }}>{vaxStatus(v.nextDue).label}</span>
                  </div>
                );})}
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #fcd34d" }}>
              <div style={{ background: "linear-gradient(135deg,#78350f,#d97706)", padding: "14px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>⏰ Próximas a vencer — {upcoming.length}</div>
              </div>
              <div style={{ background: "#fff" }}>
                {upcoming.map((v) => { const pet = pets.find((p) => p.id === v.petId); return (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                    <div><span style={{ fontWeight: 700, color: T.text }}>{spIcon(pet?.species)} {pet?.name}</span> — {v.name}</div>
                    <span style={{ color: T.amberText, fontWeight: 600, fontSize: 12 }}>{vaxStatus(v.nextDue).label}</span>
                  </div>
                );})}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 14 }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar vacuna, mascota o vet…"
            className="moga-input"
            style={{ padding: "9px 13px 9px 32px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: T.panel, fontFamily: T.font, width: isMobile ? "100%" : 240 }} />
        </div>
        <select value={petFilter} onChange={(e) => setPetFilter(e.target.value)} className="moga-input"
          style={{ padding: "9px 12px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: T.panel, fontFamily: T.font }}>
          <option value="">Todas las mascotas</option>
          {pets.map((p) => <option key={p.id} value={p.id}>{spIcon(p.species)} {p.name}</option>)}
        </select>
        <div style={{ marginLeft: "auto", fontSize: 13, color: T.textMuted }}>{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Tabla */}
      <TableWrap
        heads={["Mascota", "Vacuna", "Aplicada", "Próxima dosis", "Veterinario/a", "Lote", "Estado", ""]}
        empty={filtered.length === 0 ? "Sin registros." : undefined}>
        {filtered.map((v) => {
          const pet = pets.find((p) => p.id === v.petId);
          const vs  = vaxStatus(v.nextDue);
          return (
            <TR key={v.id}>
              <TD bold>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: T.brandLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                    {spIcon(pet?.species)}
                  </div>
                  {pet?.name ?? "—"}
                </div>
              </TD>
              <TD bold>{v.name}</TD>
              <TD>{fmtDate(v.dateApplied)}</TD>
              <TD>
                <span style={{ fontWeight: 600, color: vs.key === "red" ? T.redText : vs.key === "amber" ? T.amberText : T.text }}>
                  {fmtDate(v.nextDue)}
                </span>
              </TD>
              <TD muted>{v.vet || "—"}</TD>
              <TD><span style={{ fontFamily: "monospace", fontSize: 12, color: T.textMuted }}>{v.lot || "—"}</span></TD>
              <TD><VaxBadge nextDue={v.nextDue} /></TD>
              <TD>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(v)}
                    style={{ padding: "4px 9px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.brandLight, color: T.brand, cursor: "pointer", fontSize: 13, fontFamily: T.font }}
                    title="Editar">✏</button>
                  <button onClick={() => setDeleteTarget(v)}
                    style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 13, fontFamily: T.font }}
                    title="Eliminar">🗑</button>
                </div>
              </TD>
            </TR>
          );
        })}
      </TableWrap>

      {/* Modal: nueva vacuna */}
      {modal && (
        <Modal title="Registrar vacuna" onClose={() => { setModal(false); setForm(EMPTY); }}>
          <VaxForm form={form} setForm={setForm} pets={pets} vets={vets} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={save} disabled={busy || !form.petId || !form.name}>
              {busy ? "Guardando…" : "Registrar"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Modal: editar vacuna */}
      {editTarget && (
        <Modal title="Editar vacuna" sub={editTarget.name} onClose={() => setEditTarget(null)}>
          <VaxForm form={editForm} setForm={setEditForm} pets={pets} vets={vets} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={() => setEditTarget(null)}>Cancelar</Btn>
            <Btn v="accent" onClick={saveEdit} disabled={busy || !editForm.petId || !editForm.name}>
              {busy ? "Guardando…" : "Guardar cambios"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Modal: confirmar eliminación */}
      {deleteTarget && (
        <Modal title="Eliminar vacuna" onClose={() => setDeleteTarget(null)}>
          <p style={{ fontSize: 14, color: T.text, marginBottom: 20, lineHeight: 1.6 }}>
            ¿Eliminar el registro de <strong>{deleteTarget.name}</strong> de{" "}
            <strong>{pets.find((p) => p.id === deleteTarget.petId)?.name || "esta mascota"}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Btn>
            <Btn v="danger" onClick={confirmDelete} disabled={busy}>{busy ? "Eliminando…" : "Sí, eliminar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
