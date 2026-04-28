import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import T from "../../styles/tokens.js";
import { fmtDate, spIcon } from "../../styles/helpers.js";
import Modal from "../../components/ui/Modal.jsx";
import Btn   from "../../components/ui/Btn.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import PageTitle from "../../components/layout/PageTitle.jsx";

// ── Constantes del calendario ──────────────────────────────────────────────
const HOUR_START = 8;
const HOUR_END   = 20;
const HOUR_H     = 72; // px por hora
const TOTAL_H    = (HOUR_END - HOUR_START) * HOUR_H;
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const DAYS       = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAYS_FULL  = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// ── Config de tipos ────────────────────────────────────────────────────────
const TYPE_CFG = {
  consulta:   { label: "Consulta",    color: "#3B82F6", bg: "#DBEAFE", icon: "🩺" },
  control:    { label: "Control",     color: "#8B5CF6", bg: "#F3E8FF", icon: "📋" },
  vacuna:     { label: "Vacuna",      color: "#10B981", bg: "#D1FAE5", icon: "💉" },
  urgencia:   { label: "Urgencia",    color: "#EF4444", bg: "#FEE2E2", icon: "🚨" },
  peluqueria: { label: "Peluquería",  color: "#F59E0B", bg: "#FEF3C7", icon: "✂️" },
  otro:       { label: "Otro",        color: "#64748B", bg: "#F1F5F9", icon: "📌" },
};

const STATUS_CFG = {
  pendiente:  { label: "Pendiente",  bg: "#FEF3C7", color: "#92400E" },
  confirmada: { label: "Confirmada", bg: "#D1FAE5", color: "#065F46" },
  completada: { label: "Completada", bg: "#DBEAFE", color: "#1E40AF" },
  cancelada:  { label: "Cancelada",  bg: "#FEE2E2", color: "#991B1B" },
};

// ── Helpers de fecha ───────────────────────────────────────────────────────
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function toISO(date) {
  return date.toISOString().slice(0, 10);
}
function timeToMins(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function minsToTop(mins) {
  return ((mins - HOUR_START * 60) / 60) * HOUR_H;
}
function formatWeekRange(monday) {
  const sunday = addDays(monday, 6);
  const opts = { day: "numeric", month: "short" };
  return `${monday.toLocaleDateString("es-CL", opts)} — ${sunday.toLocaleDateString("es-CL", opts)}`;
}
function dayLabel(date) {
  return date.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
}

// ── Formulario vacío ───────────────────────────────────────────────────────
const emptyForm = (date = "", time = "") => ({
  petId: "", clientId: "", staffId: "", date, time, duration: 30,
  type: "consulta", status: "confirmada", notes: "",
});

// ─────────────────────────────────────────────────────────────────────────────
export default function AppointmentsView() {
  const { appointments, pets, users, addAppointment, updateAppointment, removeAppointment } = useApp();
  const { notify } = useNotification();

  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const [nowTop, setNowTop]       = useState(null);
  const [todayCol, setTodayCol]   = useState(-1);
  const [modal, setModal]         = useState(null); // null | { mode:"create"|"edit", appt?, date?, time? }
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const gridRef = useRef(null);

  // ── Barra de tiempo real ─────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const todayISO = toISO(now);
      const weekDays = Array.from({ length: 7 }, (_, i) => toISO(addDays(weekStart, i)));
      const col = weekDays.indexOf(todayISO);
      setTodayCol(col);

      const totalMins = now.getHours() * 60 + now.getMinutes();
      if (totalMins < HOUR_START * 60 || totalMins > HOUR_END * 60) {
        setNowTop(null);
      } else {
        setNowTop(minsToTop(totalMins));
      }
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [weekStart]);

  // ── Navegación de semana ─────────────────────────────────────────────────
  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToday  = () => setWeekStart(getMondayOf(new Date()));

  // ── Citas por día ────────────────────────────────────────────────────────
  const apptsByDay = Array.from({ length: 7 }, (_, i) => {
    const iso = toISO(addDays(weekStart, i));
    return appointments.filter((a) => a.date === iso);
  });

  // ── Handlers modal ───────────────────────────────────────────────────────
  const openCreate = (date, time) => {
    setForm(emptyForm(date, time));
    setModal({ mode: "create" });
  };

  const openEdit = (appt) => {
    setForm({ ...appt });
    setModal({ mode: "edit", appt });
  };

  const closeModal = () => { setModal(null); setForm(emptyForm()); };

  const handleSave = async () => {
    if (!form.petId || !form.date || !form.time) return;
    setSaving(true);
    try {
      const payload = { ...form, petId: +form.petId, clientId: +form.clientId || null, staffId: +form.staffId || null, duration: +form.duration };
      if (modal.mode === "create") {
        await addAppointment(payload);
        notify("Cita creada", "success");
      } else {
        await updateAppointment(modal.appt.id, payload);
        notify("Cita actualizada", "success");
      }
      closeModal();
    } catch { notify("Error al guardar", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!modal?.appt) return;
    setDeleting(true);
    try {
      await removeAppointment(modal.appt.id);
      notify("Cita eliminada", "info");
      closeModal();
    } catch { notify("Error al eliminar", "error"); }
    finally { setDeleting(false); }
  };

  const handleStatusChange = async (appt, status) => {
    try {
      await updateAppointment(appt.id, { status });
      notify(`Cita ${STATUS_CFG[status].label.toLowerCase()}`, "success");
    } catch { notify("Error al actualizar estado", "error"); }
  };

  // ── Contadores para KPIs ─────────────────────────────────────────────────
  const todayISO = toISO(new Date());
  const todayAppts   = appointments.filter((a) => a.date === todayISO);
  const pendingAppts = appointments.filter((a) => a.status === "pendiente");
  const weekAppts    = appointments.filter((a) => {
    const d = a.date;
    return d >= toISO(weekStart) && d <= toISO(addDays(weekStart, 6));
  });

  // ── Clientes y mascotas filtrados para el form ───────────────────────────
  const clients = users.filter((u) => u.role === "client");
  const staff   = users.filter((u) => u.role === "admin" || u.role === "vet");
  const clientPets = form.clientId
    ? pets.filter((p) => p.ownerId === +form.clientId)
    : pets;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "28px 32px 48px", fontFamily: T.font }}>
      <PageTitle
        icon="🗓"
        title="Agenda"
        sub={`${weekAppts.length} cita${weekAppts.length !== 1 ? "s" : ""} esta semana`}
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Hoy", value: todayAppts.length, icon: "📅", color: T.brand },
          { label: "Pendientes", value: pendingAppts.length, icon: "⏳", color: "#F59E0B" },
          { label: "Esta semana", value: weekAppts.length, icon: "🗓", color: "#3B82F6" },
        ].map((k) => (
          <div key={k.label} style={{ background: T.panel, borderRadius: 14, padding: "18px 22px", boxShadow: T.sm, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de semana */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={prevWeek} style={navBtn}>‹</button>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, minWidth: 220, textAlign: "center" }}>
            {formatWeekRange(weekStart)}
          </div>
          <button onClick={nextWeek} style={navBtn}>›</button>
          <button onClick={goToday} style={{ ...navBtn, fontSize: 12, padding: "7px 14px", marginLeft: 6, color: T.brand, borderColor: T.brand }}>Hoy</button>
        </div>
        <Btn v="accent" onClick={() => openCreate(todayISO, "09:00")}>+ Nueva cita</Btn>
      </div>

      {/* Leyenda de tipos */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(TYPE_CFG).map(([k, v]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: v.bg, fontSize: 11.5, fontWeight: 600, color: v.color }}>
            {v.icon} {v.label}
          </span>
        ))}
      </div>

      {/* Calendario semanal */}
      <div style={{ background: T.panel, borderRadius: 16, boxShadow: T.md, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        {/* Header de días */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7,1fr)", borderBottom: `1px solid ${T.border}` }}>
          <div />
          {Array.from({ length: 7 }, (_, i) => {
            const d = addDays(weekStart, i);
            const iso = toISO(d);
            const isToday = iso === todayISO;
            return (
              <div key={i} style={{ padding: "12px 8px", textAlign: "center", borderLeft: `1px solid ${T.border}`, background: isToday ? T.brandXLight : "transparent" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{DAYS[i]}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isToday ? T.brand : T.text, marginTop: 2 }}>{d.getDate()}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{d.toLocaleDateString("es-CL", { month: "short" })}</div>
              </div>
            );
          })}
        </div>

        {/* Grid de horas */}
        <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "60px repeat(7,1fr)", height: TOTAL_H, position: "relative", overflowY: "auto" }}>
          {/* Líneas de hora */}
          {HOURS.map((h) => (
            <div key={h} style={{ gridColumn: "1 / -1", display: "contents" }}>
              <div style={{ gridColumn: 1, position: "relative" }}>
                <div style={{ position: "absolute", top: (h - HOUR_START) * HOUR_H - 8, right: 6, fontSize: 10, color: T.textMuted, fontWeight: 600 }}>
                  {String(h).padStart(2, "0")}:00
                </div>
              </div>
            </div>
          ))}

          {/* Filas de fondo */}
          {HOURS.map((h) => (
            <div key={`row-${h}`} style={{ gridColumn: "1 / -1", position: "absolute", top: (h - HOUR_START) * HOUR_H, left: 60, right: 0, height: 1, background: T.border, zIndex: 0 }} />
          ))}

          {/* Columnas de días con citas */}
          {Array.from({ length: 7 }, (_, dayIdx) => {
            const dayDate = toISO(addDays(weekStart, dayIdx));
            const isToday = dayDate === todayISO;
            const dayAppts = apptsByDay[dayIdx];

            return (
              <div
                key={dayIdx}
                onClick={(e) => {
                  if (e.target !== e.currentTarget) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relY = e.clientY - rect.top;
                  const totalMins = Math.round((relY / HOUR_H) * 60 / 15) * 15 + HOUR_START * 60;
                  const h = Math.floor(totalMins / 60);
                  const m = totalMins % 60;
                  openCreate(dayDate, `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
                }}
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: "1 / -1",
                  position: "relative",
                  borderLeft: `1px solid ${T.border}`,
                  height: TOTAL_H,
                  background: isToday ? "rgba(5,150,105,0.03)" : "transparent",
                  cursor: "default",
                }}
              >
                {/* Citas del día */}
                {dayAppts.map((appt) => {
                  const cfg  = TYPE_CFG[appt.type] || TYPE_CFG.otro;
                  const pet  = pets.find((p) => p.id === appt.petId);
                  const top  = minsToTop(timeToMins(appt.time));
                  const h    = Math.max(((appt.duration || 30) / 60) * HOUR_H, 28);
                  const cancelled = appt.status === "cancelada";
                  return (
                    <div
                      key={appt.id}
                      onClick={(e) => { e.stopPropagation(); openEdit(appt); }}
                      title={`${appt.time} · ${cfg.label} · ${pet?.name}`}
                      style={{
                        position: "absolute",
                        top: top + 2,
                        left: 3,
                        right: 3,
                        height: h - 4,
                        background: cancelled ? "#F1F5F9" : cfg.bg,
                        border: `1.5px solid ${cancelled ? T.border : cfg.color}`,
                        borderLeft: `4px solid ${cancelled ? T.borderMid : cfg.color}`,
                        borderRadius: 7,
                        padding: "4px 7px",
                        cursor: "pointer",
                        overflow: "hidden",
                        zIndex: 2,
                        opacity: cancelled ? 0.55 : 1,
                        transition: "transform 0.1s, box-shadow 0.1s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = T.md; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                    >
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: cfg.color, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {cfg.icon} {appt.time} · {pet?.name ?? "—"}
                      </div>
                      {h > 36 && (
                        <div style={{ fontSize: 10, color: cfg.color, opacity: 0.75, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cfg.label}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Slot clickable transparent overlay for each half-hour */}
                {HOURS.map((h) => (
                  <div
                    key={`slot-${h}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreate(dayDate, `${String(h).padStart(2,"0")}:00`);
                    }}
                    style={{ position: "absolute", top: (h - HOUR_START) * HOUR_H, left: 0, right: 0, height: HOUR_H / 2, zIndex: 1 }}
                  />
                ))}
              </div>
            );
          })}

          {/* ── Barra de tiempo real ─────────────────────────────────────── */}
          {nowTop !== null && todayCol >= 0 && (
            <div
              style={{
                position: "absolute",
                top: nowTop,
                left: `calc(60px + ${todayCol} * ((100% - 60px) / 7))`,
                width: "calc((100% - 60px) / 7)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <div style={{
                position: "absolute",
                left: -5,
                top: -5,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#EF4444",
                boxShadow: "0 0 0 3px rgba(239,68,68,0.25)",
              }} />
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: "#EF4444",
                opacity: 0.85,
              }} />
            </div>
          )}
        </div>
      </div>

      {/* ── Modal crear/editar ───────────────────────────────────────────── */}
      {modal && (
        <Modal
          title={modal.mode === "create" ? "Nueva cita" : "Editar cita"}
          sub={modal.mode === "create" ? "Completa los datos para agendar" : "Modifica los datos de la cita"}
          onClose={closeModal}
        >
          {/* Tipo + estado */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Select label="Tipo *" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </Select>
            <Select label="Estado" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>

          {/* Cliente + mascota */}
          <Select label="Cliente" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value, petId: "" })}>
            <option value="">— Sin cliente —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
            <option value="">— Seleccionar —</option>
            {clientPets.map((p) => <option key={p.id} value={p.id}>{spIcon(p.species)} {p.name}</option>)}
          </Select>

          {/* Staff */}
          <Select label="Veterinario/a" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}>
            <option value="">— Sin asignar —</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>

          {/* Fecha, hora, duración */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <Input label="Fecha *"    type="date"   value={form.date}     onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Hora *"     type="time"   value={form.time}     onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <Select label="Duración"  value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })}>
              {[15,30,45,60,90,120].map((m) => <option key={m} value={m}>{m} min</option>)}
            </Select>
          </div>

          <Input label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones, instrucciones…" />

          {/* Estado rápido (solo editar) */}
          {modal.mode === "edit" && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, alignSelf: "center", marginRight: 4 }}>Cambiar estado:</span>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setForm({ ...form, status: k })}
                  style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${form.status === k ? v.color : T.border}`, background: form.status === k ? v.bg : "transparent", color: v.color, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 8 }}>
            <div>
              {modal.mode === "edit" && (
                <Btn v="danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Eliminando…" : "Eliminar"}
                </Btn>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn v="ghost" onClick={closeModal}>Cancelar</Btn>
              <Btn v="accent" onClick={handleSave} disabled={saving || !form.petId || !form.date || !form.time}>
                {saving ? "Guardando…" : modal.mode === "create" ? "Crear cita" : "Guardar"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const navBtn = {
  width: 34,
  height: 34,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: T.textMid,
  fontFamily: T.font,
  padding: 0,
  lineHeight: 1,
};
