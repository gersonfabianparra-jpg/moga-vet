import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useNotify } from "../../context/NotificationContext.jsx";
import T from "../../styles/tokens.js";
import { fmtDate, spIcon } from "../../styles/helpers.js";
import Modal from "../../components/ui/Modal.jsx";
import Btn   from "../../components/ui/Btn.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import PageTitle from "../../components/layout/PageTitle.jsx";

// ── Constantes del calendario ─────────────────────────────────────────────
const HOUR_START    = 0;
const HOUR_END      = 24;
const BASE_HOUR_H   = 64;   // px por hora al zoom 1x
const HOURS         = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i);
const DAYS          = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Ventana de atención al cliente
const CLIENT_START_MIN = 10 * 60;       // 10:00
const CLIENT_END_MIN   = 19 * 60 + 30;  // 19:30

// ── Config de tipos ───────────────────────────────────────────────────────
const TYPE_CFG = {
  consulta:   { label: "Consulta",   color: "#3B82F6", bg: "#DBEAFE", icon: "🩺" },
  control:    { label: "Control",    color: "#8B5CF6", bg: "#F3E8FF", icon: "📋" },
  vacuna:     { label: "Vacuna",     color: "#10B981", bg: "#D1FAE5", icon: "💉" },
  urgencia:   { label: "Urgencia",   color: "#EF4444", bg: "#FEE2E2", icon: "🚨" },
  peluqueria: { label: "Peluquería", color: "#F59E0B", bg: "#FEF3C7", icon: "✂️" },
  otro:       { label: "Otro",       color: "#64748B", bg: "#F1F5F9", icon: "📌" },
};

const STATUS_CFG = {
  pendiente:  { label: "Pendiente",  bg: "#FEF3C7", color: "#92400E" },
  confirmada: { label: "Confirmada", bg: "#D1FAE5", color: "#065F46" },
  completada: { label: "Completada", bg: "#DBEAFE", color: "#1E40AF" },
  cancelada:  { label: "Cancelada",  bg: "#FEE2E2", color: "#991B1B" },
};

const ZOOM_OPTS = [
  { value: 0.5, label: "Compacto" },
  { value: 0.8, label: "Normal" },
  { value: 1.2, label: "Amplio" },
  { value: 1.8, label: "Detallado" },
];

// ── Helpers ───────────────────────────────────────────────────────────────
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
function toISO(date) { return date.toISOString().slice(0, 10); }
function timeToMins(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function minsToTop(mins, hourH) { return (mins / 60) * hourH; }
function formatWeekRange(monday) {
  const sunday = addDays(monday, 6);
  const opts = { day: "numeric", month: "short" };
  return `${monday.toLocaleDateString("es-CL", opts)} — ${sunday.toLocaleDateString("es-CL", opts)}`;
}
function minsToTimeStr(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// ── Formulario vacío ──────────────────────────────────────────────────────
const emptyForm = (date = "", time = "") => ({
  petId: "", clientId: "", staffId: "", date, time, duration: 30,
  type: "consulta", status: "confirmada", notes: "",
});
const emptyBlock = (date = "", startTime = "") => ({
  date, startTime, endTime: "", reason: "",
});

// ─────────────────────────────────────────────────────────────────────────
export default function AppointmentsView() {
  const {
    appointments, pets, users,
    addAppointment, updateAppointment, removeAppointment,
    blockedSlots, addBlockedSlot, removeBlockedSlot,
    currentUser,
  } = useApp();
  const notify = useNotify();

  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const [nowTop, setNowTop]       = useState(null);
  const [todayCol, setTodayCol]   = useState(-1);
  const [zoom, setZoom]           = useState(0.8);
  const [blockMode, setBlockMode] = useState(false);

  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const [blockModal, setBlockModal] = useState(null);
  const [blockForm, setBlockForm]   = useState(emptyBlock());
  const [savingBlock, setSavingBlock] = useState(false);

  const gridRef = useRef(null);

  const HOUR_H   = Math.round(BASE_HOUR_H * zoom);
  const TOTAL_H  = HOUR_END * HOUR_H;
  const isAdmin  = currentUser?.role === "admin" || currentUser?.role === "vet" || currentUser?.role === "superadmin";

  // ── Barra de tiempo real ──────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const todayISO  = toISO(now);
      const weekDays  = Array.from({ length: 7 }, (_, i) => toISO(addDays(weekStart, i)));
      const col = weekDays.indexOf(todayISO);
      setTodayCol(col);
      const totalMins = now.getHours() * 60 + now.getMinutes();
      setNowTop(minsToTop(totalMins, HOUR_H));
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [weekStart, HOUR_H]);

  // ── Scroll al inicio de jornada al montar ─────────────────────────────
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = minsToTop(CLIENT_START_MIN - 60, HOUR_H);
    }
  }, []);

  // ── Navegación ────────────────────────────────────────────────────────
  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToday  = () => setWeekStart(getMondayOf(new Date()));

  const todayISO = toISO(new Date());
  const apptsByDay = Array.from({ length: 7 }, (_, i) => {
    const iso = toISO(addDays(weekStart, i));
    return appointments.filter((a) => a.date === iso);
  });
  const blocksByDay = Array.from({ length: 7 }, (_, i) => {
    const iso = toISO(addDays(weekStart, i));
    return blockedSlots.filter((b) => b.date === iso);
  });

  // ── Handlers de citas ─────────────────────────────────────────────────
  const openCreate = (date, time) => {
    if (blockMode) return;
    setForm(emptyForm(date, time));
    setModal({ mode: "create" });
  };
  const openEdit = (appt) => {
    if (blockMode) return;
    setForm({ ...appt });
    setModal({ mode: "edit", appt });
  };
  const closeModal = () => { setModal(null); setForm(emptyForm()); };

  const handleSave = async () => {
    if ((!form.petId && !form.guestName) || !form.date || !form.time) return;
    // Verificar si el horario está bloqueado
    const apptMins = timeToMins(form.time);
    const apptEnd  = apptMins + (+form.duration || 30);
    const conflict = blockedSlots.find((b) =>
      b.date === form.date &&
      timeToMins(b.startTime) < apptEnd &&
      timeToMins(b.endTime) > apptMins
    );
    if (conflict && modal.mode === "create") {
      notify(`Horario bloqueado: ${conflict.reason || "sin disponibilidad"}`, "error");
      return;
    }
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

  // ── Handlers de bloqueos ──────────────────────────────────────────────
  const openBlock = (date, startTime) => {
    const startMins = timeToMins(startTime);
    const endMins   = Math.min(startMins + 60, 24 * 60);
    setBlockForm({ date, startTime, endTime: minsToTimeStr(endMins), reason: "" });
    setBlockModal(true);
  };
  const closeBlockModal = () => { setBlockModal(null); setBlockForm(emptyBlock()); };

  const handleSaveBlock = async () => {
    if (!blockForm.date || !blockForm.startTime || !blockForm.endTime) return;
    if (timeToMins(blockForm.endTime) <= timeToMins(blockForm.startTime)) {
      notify("La hora de fin debe ser posterior al inicio", "error");
      return;
    }
    setSavingBlock(true);
    try {
      await addBlockedSlot(blockForm);
      notify("Horario bloqueado", "success");
      closeBlockModal();
    } catch { notify("Error al bloquear", "error"); }
    finally { setSavingBlock(false); }
  };

  const handleRemoveBlock = async (id) => {
    try {
      await removeBlockedSlot(id);
      notify("Bloqueo eliminado", "info");
    } catch { notify("Error al eliminar bloqueo", "error"); }
  };

  // ── KPIs ──────────────────────────────────────────────────────────────
  const todayAppts   = appointments.filter((a) => a.date === todayISO);
  const pendingAppts = appointments.filter((a) => a.status === "pendiente");
  const weekAppts    = appointments.filter((a) => {
    const d = a.date;
    return d >= toISO(weekStart) && d <= toISO(addDays(weekStart, 6));
  });

  const clients    = users.filter((u) => u.role === "client");
  const staff      = users.filter((u) => u.role === "admin" || u.role === "vet");
  const clientPets = form.clientId ? pets.filter((p) => p.ownerId === +form.clientId) : pets;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "28px 32px 48px", fontFamily: T.font }}>
      <PageTitle icon="🗓" title="Agenda" sub={`${weekAppts.length} cita${weekAppts.length !== 1 ? "s" : ""} esta semana`} />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Hoy",          value: todayAppts.length,   icon: "📅", color: T.brand },
          { label: "Pendientes",   value: pendingAppts.length, icon: "⏳", color: "#F59E0B" },
          { label: "Esta semana",  value: weekAppts.length,    icon: "🗓", color: "#3B82F6" },
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

      {/* Controles */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        {/* Navegación semana */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={prevWeek} style={navBtn}>‹</button>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, minWidth: 220, textAlign: "center" }}>
            {formatWeekRange(weekStart)}
          </div>
          <button onClick={nextWeek} style={navBtn}>›</button>
          <button onClick={goToday} style={{ ...navBtn, fontSize: 12, padding: "7px 14px", marginLeft: 6, color: T.brand, borderColor: T.brand }}>Hoy</button>
        </div>

        {/* Zoom + bloqueo + nueva cita */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Zoom */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: "4px 10px" }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Vista</span>
            {ZOOM_OPTS.map((z) => (
              <button
                key={z.value}
                onClick={() => setZoom(z.value)}
                style={{
                  padding: "4px 9px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, fontFamily: T.font,
                  background: zoom === z.value ? T.brand : "transparent",
                  color: zoom === z.value ? "#fff" : T.textMuted,
                  transition: "all 0.15s",
                }}
              >{z.label}</button>
            ))}
          </div>

          {/* Bloquear horarios (solo staff) */}
          {isAdmin && (
            <button
              onClick={() => setBlockMode((v) => !v)}
              style={{
                padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${blockMode ? "#EF4444" : T.border}`,
                background: blockMode ? "#FEE2E2" : "#fff", cursor: "pointer",
                fontSize: 12, fontWeight: 700, color: blockMode ? "#DC2626" : T.textMid,
                fontFamily: T.font, display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}
              title="Activar modo bloqueo de horarios"
            >
              🔒 {blockMode ? "Modo bloqueo activo" : "Bloquear horario"}
            </button>
          )}

          <Btn v="accent" onClick={() => openCreate(todayISO, "10:00")}>+ Nueva cita</Btn>
        </div>
      </div>

      {blockMode && (
        <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
          🔒 Modo bloqueo activo — haz clic en cualquier horario del calendario para bloquearlo. Clic de nuevo para desactivar.
        </div>
      )}

      {/* Panel de bloqueos rápidos */}
      {isAdmin && blockMode && (
        <div style={{ background: T.panel, borderRadius: 14, border: `1.5px solid #FCD34D`, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            🔒 Bloqueos rápidos para hoy ({todayISO})
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { label: "🌅 Mañana", start: "09:00", end: "13:00" },
              { label: "☀️ Tarde",  start: "13:00", end: "18:00" },
              { label: "📅 Día completo", start: "09:00", end: "19:00" },
              { label: "🍽 Almuerzo", start: "13:00", end: "14:00" },
            ].map((q) => (
              <button key={q.label}
                onClick={() => { setBlockForm({ date: todayISO, startTime: q.start, endTime: q.end, reason: "" }); setBlockModal(true); }}
                style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid #FCD34D`, background: "#FEF3C7",
                  color: "#92400E", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.font }}>
                {q.label}
              </button>
            ))}
            <button
              onClick={() => { setBlockForm({ date: todayISO, startTime: "", endTime: "", reason: "" }); setBlockModal(true); }}
              style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${T.brand}`, background: T.brandXLight,
                color: T.brand, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.font }}>
              ✏️ Personalizado
            </button>
          </div>

          {/* Lista de bloqueos activos esta semana */}
          {blockedSlots.filter((b) => b.date >= toISO(weekStart) && b.date <= toISO(addDays(weekStart, 6))).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Bloqueos activos esta semana
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {blockedSlots
                  .filter((b) => b.date >= toISO(weekStart) && b.date <= toISO(addDays(weekStart, 6)))
                  .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                  .map((b) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10,
                      background: "#FEF3C7", borderRadius: 8, padding: "7px 12px", fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: "#92400E" }}>
                        {new Date(b.date + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                      <span style={{ color: "#92400E" }}>{b.startTime} – {b.endTime}</span>
                      {b.reason && <span style={{ color: T.textMuted, fontStyle: "italic" }}>· {b.reason}</span>}
                      <button onClick={() => handleRemoveBlock(b.id)}
                        style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 6, border: "none",
                          background: "#FEE2E2", color: "#DC2626", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                        ✕ Quitar
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {blockedSlots.filter((b) => b.date >= toISO(weekStart) && b.date <= toISO(addDays(weekStart, 6))).length === 0 && (
            <div style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>Sin bloqueos esta semana.</div>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {Object.entries(TYPE_CFG).map(([k, v]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: v.bg, fontSize: 11.5, fontWeight: 600, color: v.color }}>
            {v.icon} {v.label}
          </span>
        ))}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "#FEE2E2", fontSize: 11.5, fontWeight: 600, color: "#DC2626" }}>
          🔒 Bloqueado
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: T.textMuted, fontWeight: 500 }}>
          Atención clientes: <strong>10:00 — 19:30</strong>
        </span>
      </div>

      {/* Calendario */}
      <div style={{ background: T.panel, borderRadius: 16, boxShadow: T.md, border: `1px solid ${T.border}`, overflow: "hidden" }}>

        {/* Header días */}
        <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7,1fr)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 20, background: T.panel }}>
          <div style={{ borderRight: `1px solid ${T.border}` }} />
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

        {/* Body scrollable */}
        <div style={{ display: "flex", overflowY: "auto", maxHeight: 580 }} ref={gridRef}>

          {/* Columna de horas */}
          <div style={{ width: 56, flexShrink: 0, position: "relative", height: TOTAL_H, borderRight: `1px solid ${T.border}`, background: T.panel }}>
            {HOURS.map((h) => (
              <div key={h} style={{
                position: "absolute",
                top: h * HOUR_H - 9,
                right: 6,
                fontSize: 9.5,
                fontWeight: 600,
                color: T.textMuted,
                userSelect: "none",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}>
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Zona de días */}
          <div style={{ flex: 1, position: "relative", height: TOTAL_H }}>

            {/* Zonas fuera de horario de atención (fondo gris) */}
            {/* Antes de 10:00 */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: minsToTop(CLIENT_START_MIN, HOUR_H),
              background: "rgba(148,163,184,0.07)",
              borderBottom: "1px dashed rgba(148,163,184,0.4)",
              zIndex: 0, pointerEvents: "none",
            }} />
            {/* Después de 19:30 */}
            <div style={{
              position: "absolute",
              top: minsToTop(CLIENT_END_MIN, HOUR_H), left: 0, right: 0,
              bottom: 0,
              background: "rgba(148,163,184,0.07)",
              borderTop: "1px dashed rgba(148,163,184,0.4)",
              zIndex: 0, pointerEvents: "none",
            }} />

            {/* Líneas horizontales de cada hora */}
            {HOURS.map((h) => (
              <div key={h} style={{
                position: "absolute",
                top: h * HOUR_H,
                left: 0, right: 0, height: 1,
                background: T.border, zIndex: 0,
              }} />
            ))}

            {/* Líneas de media hora */}
            {HOURS.map((h) => (
              <div key={`half-${h}`} style={{
                position: "absolute",
                top: h * HOUR_H + HOUR_H / 2,
                left: 0, right: 0, height: 1,
                background: T.border, opacity: 0.35, zIndex: 0,
              }} />
            ))}

            {/* Columnas de días */}
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const dayDate  = toISO(addDays(weekStart, dayIdx));
              const isToday  = dayDate === todayISO;
              const dayAppts = apptsByDay[dayIdx];
              const dayBlocks = blocksByDay[dayIdx];

              return (
                <div
                  key={dayIdx}
                  onClick={(e) => {
                    if (e.target !== e.currentTarget) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relY = e.clientY - rect.top;
                    const totalMins = Math.round((relY / HOUR_H) * 60 / 15) * 15;
                    const clickedTime = minsToTimeStr(Math.min(totalMins, 23 * 60 + 45));
                    if (blockMode && isAdmin) {
                      openBlock(dayDate, clickedTime);
                    } else {
                      openCreate(dayDate, clickedTime);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: 0, bottom: 0,
                    left: `${dayIdx * 100 / 7}%`,
                    width: `${100 / 7}%`,
                    borderLeft: dayIdx > 0 ? `1px solid ${T.border}` : "none",
                    background: isToday ? "rgba(99,102,241,0.025)" : "transparent",
                    cursor: blockMode ? "crosshair" : "default",
                  }}
                >
                  {/* Bloqueados */}
                  {dayBlocks.map((b) => {
                    const top  = minsToTop(timeToMins(b.startTime), HOUR_H);
                    const hpx  = minsToTop(timeToMins(b.endTime) - timeToMins(b.startTime), HOUR_H);
                    return (
                      <div
                        key={b.id}
                        onClick={(e) => { e.stopPropagation(); if (isAdmin) handleRemoveBlock(b.id); }}
                        title={`Bloqueado: ${b.startTime}–${b.endTime}${b.reason ? ` · ${b.reason}` : ""}${isAdmin ? "\nClic para desbloquear" : ""}`}
                        style={{
                          position: "absolute",
                          top: top + 1, left: 2, right: 2,
                          height: Math.max(hpx - 2, 14),
                          background: "repeating-linear-gradient(45deg, rgba(220,38,38,0.08) 0px, rgba(220,38,38,0.08) 4px, rgba(220,38,38,0.18) 4px, rgba(220,38,38,0.18) 8px)",
                          border: "1.5px solid rgba(220,38,38,0.35)",
                          borderRadius: 5,
                          zIndex: 3,
                          cursor: isAdmin ? "pointer" : "not-allowed",
                          overflow: "hidden",
                          display: "flex", alignItems: "flex-start",
                          padding: "3px 5px",
                        }}
                      >
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: "#DC2626", lineHeight: 1.2, userSelect: "none" }}>
                          🔒 {b.startTime}–{b.endTime}
                          {b.reason && ` · ${b.reason}`}
                        </span>
                        {isAdmin && (
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "#DC2626", opacity: 0.6 }}>✕</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Citas */}
                  {dayAppts.map((appt) => {
                    const cfg       = TYPE_CFG[appt.type] || TYPE_CFG.otro;
                    const pet       = pets.find((p) => p.id === appt.petId);
                    const isGuest   = !!appt.guestName;
                    const label     = isGuest ? appt.guestName : (pet?.name ?? "—");
                    const top       = minsToTop(timeToMins(appt.time), HOUR_H);
                    const h         = Math.max(((appt.duration || 30) / 60) * HOUR_H, 22);
                    const cancelled = appt.status === "cancelada";
                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => { e.stopPropagation(); openEdit(appt); }}
                        title={`${appt.time} · ${cfg.label} · ${label}${isGuest ? " (reserva pública)" : ""}`}
                        style={{
                          position: "absolute",
                          top: top + 2, left: 3, right: 3,
                          height: h - 4,
                          background: cancelled ? "#F1F5F9" : cfg.bg,
                          border: `1.5px solid ${cancelled ? T.border : cfg.color}`,
                          borderLeft: `4px solid ${cancelled ? T.borderMid : cfg.color}`,
                          borderRadius: 7,
                          padding: "3px 6px",
                          cursor: "pointer",
                          overflow: "hidden",
                          zIndex: 4,
                          opacity: cancelled ? 0.55 : 1,
                          transition: "transform 0.1s, box-shadow 0.1s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = T.md; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 800, color: cfg.color, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {isGuest ? "📱" : cfg.icon} {appt.time} · {label}
                        </div>
                        {h > 32 && (
                          <div style={{ fontSize: 9.5, color: cfg.color, opacity: 0.75, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {isGuest ? "Reserva pública" : cfg.label}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Slots clickeables por hora */}
                  {HOURS.map((h) => (
                    <div
                      key={`slot-${h}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const t = minsToTimeStr(h * 60);
                        if (blockMode && isAdmin) openBlock(dayDate, t);
                        else openCreate(dayDate, t);
                      }}
                      style={{ position: "absolute", top: h * HOUR_H, left: 0, right: 0, height: HOUR_H / 2, zIndex: 1 }}
                    />
                  ))}
                </div>
              );
            })}

            {/* Barra de tiempo real */}
            {nowTop !== null && todayCol >= 0 && (
              <div style={{
                position: "absolute",
                top: nowTop,
                left: 0, right: 0,
                zIndex: 10,
                pointerEvents: "none",
              }}>
                <div style={{
                  position: "absolute",
                  left: `calc(${todayCol} / 7 * 100% - 5px)`,
                  top: -5,
                  width: 10, height: 10,
                  borderRadius: "50%",
                  background: "#EF4444",
                  boxShadow: "0 0 0 3px rgba(239,68,68,0.3)",
                }} />
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 2,
                  background: "#EF4444",
                  opacity: 0.75,
                }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal crear/editar cita ──────────────────────────────────────── */}
      {modal && (
        <Modal
          title={modal.mode === "create" ? "Nueva cita" : "Editar cita"}
          sub={modal.mode === "create" ? "Completa los datos para agendar" : "Modifica los datos de la cita"}
          onClose={closeModal}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Select label="Tipo *" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </Select>
            <Select label="Estado" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>

          <Select label="Cliente" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value, petId: "" })}>
            <option value="">— Sin cliente —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
            <option value="">— Seleccionar —</option>
            {clientPets.map((p) => <option key={p.id} value={p.id}>{spIcon(p.species)} {p.name}</option>)}
          </Select>
          <Select label="Veterinario/a" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}>
            <option value="">— Sin asignar —</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <Input label="Fecha *"   type="date" value={form.date}     onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Hora *"    type="time" value={form.time}     onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <Select label="Duración" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })}>
              {[15,30,45,60,90,120].map((m) => <option key={m} value={m}>{m} min</option>)}
            </Select>
          </div>

          <Input label="Notas" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones, instrucciones…" />

          {/* Panel de reserva pública */}
          {form.guestName && (
            <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 10, padding: "12px 16px", marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4338CA", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                📱 Reserva pública — cliente sin cuenta
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 13, color: "#334155" }}>
                <div><span style={{ fontWeight: 700 }}>Nombre:</span> {form.guestName}</div>
                <div><span style={{ fontWeight: 700 }}>Email:</span> {form.guestEmail}</div>
                {form.guestPhone && <div><span style={{ fontWeight: 700 }}>Teléfono:</span> {form.guestPhone}</div>}
                {form.guestRut   && <div><span style={{ fontWeight: 700 }}>RUT:</span> {form.guestRut}</div>}
                {form.guestPetName && (
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ fontWeight: 700 }}>Mascota:</span> {form.guestPetName} ({form.guestPetSpecies || "—"})
                  </div>
                )}
              </div>
            </div>
          )}

          {modal.mode === "edit" && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, alignSelf: "center", marginRight: 4 }}>Cambiar estado:</span>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <button key={k} onClick={() => setForm({ ...form, status: k })}
                  style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${form.status === k ? v.color : T.border}`, background: form.status === k ? v.bg : "transparent", color: v.color, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
                  {v.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 8 }}>
            <div>
              {modal.mode === "edit" && (
                <Btn v="danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Eliminando…" : "Eliminar"}</Btn>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn v="ghost" onClick={closeModal}>Cancelar</Btn>
              <Btn v="accent" onClick={handleSave} disabled={saving || (!form.petId && !form.guestName) || !form.date || !form.time}>
                {saving ? "Guardando…" : modal.mode === "create" ? "Crear cita" : "Guardar"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal bloquear horario ───────────────────────────────────────── */}
      {blockModal && (
        <Modal title="Bloquear horario" sub="Los clientes no podrán agendar en este rango" onClose={closeBlockModal}>
          <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#92400E" }}>
            🔒 Bloquear un horario impide que los clientes agenden citas en ese tramo.
          </div>
          <Input label="Fecha" type="date" value={blockForm.date} onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input label="Desde *" type="time" value={blockForm.startTime} onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })} />
            <Input label="Hasta *" type="time" value={blockForm.endTime}   onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })} />
          </div>
          <Input label="Motivo (opcional)" value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="Ej: Almuerzo, Capacitación, Mantenimiento…" />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn v="ghost" onClick={closeBlockModal}>Cancelar</Btn>
            <Btn v="accent" onClick={handleSaveBlock} disabled={savingBlock || !blockForm.date || !blockForm.startTime || !blockForm.endTime}>
              {savingBlock ? "Bloqueando…" : "Bloquear horario"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const navBtn = {
  width: 34, height: 34,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  fontSize: 18,
  display: "flex", alignItems: "center", justifyContent: "center",
  color: T.textMid,
  fontFamily: T.font,
  padding: 0, lineHeight: 1,
};
