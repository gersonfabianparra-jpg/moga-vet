import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useNotify } from "../../context/NotificationContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import T from "../../styles/tokens.js";
import PageTitle from "../../components/layout/PageTitle.jsx";
import Btn from "../../components/ui/Btn.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Select from "../../components/ui/Select.jsx";

const STATUS_CFG = {
  pendiente:  { label: "Pendiente",  bg: "#FEF3C7", color: "#92400E" },
  confirmada: { label: "Confirmada", bg: "#D1FAE5", color: "#065F46" },
  completada: { label: "Completada", bg: "#DBEAFE", color: "#1E40AF" },
  cancelada:  { label: "Cancelada",  bg: "#FEE2E2", color: "#991B1B" },
};

const TYPE_CFG = {
  consulta:   { label: "Consulta médica",    icon: "🩺" },
  control:    { label: "Control",            icon: "📋" },
  vacuna:     { label: "Vacunación",         icon: "💉" },
  peluqueria: { label: "Peluquería",         icon: "✂️" },
  otro:       { label: "Otro",               icon: "📌" },
};

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ReservationsView() {
  const { appointments, updateAppointment, removeAppointment, currentUser } = useApp();
  const notify = useNotify();
  const { isMobile } = useBreakpoint();

  const tenantId  = currentUser?.tenantId || "";
  const origin    = typeof window !== "undefined" ? window.location.origin : "";
  const pathname  = typeof window !== "undefined" ? window.location.pathname : "/";
  const bookingUrl = tenantId ? `${origin}${pathname}#/reservar/${tenantId}` : "";

  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("pendiente");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const guestAppts = appointments
    .filter((a) => a.guestName)
    .filter((a) => filter === "all" ? true : a.status === filter)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const pendingCount = appointments.filter((a) => a.guestName && a.status === "pendiente").length;

  const handleCopy = () => {
    navigator.clipboard?.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatus = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateAppointment(selected.id, { status });
      notify(`Reserva marcada como ${STATUS_CFG[status]?.label || status}`, "success");
      setSelected(null);
    } catch {
      notify("Error al actualizar la reserva", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await removeAppointment(selected.id);
      notify("Reserva eliminada", "info");
      setSelected(null);
    } catch {
      notify("Error al eliminar", "error");
    } finally { setDeleting(false); }
  };

  return (
    <div style={{ padding: isMobile ? "14px 14px 48px" : "28px 32px 48px", fontFamily: T.font, maxWidth: 960 }}>
      <PageTitle icon="📋" title="Reservas online" sub="Solicitudes de clientes sin cuenta registrada" />

      {/* Enlace de reservas */}
      <div style={{ background: T.panel, borderRadius: 16, border: `1px solid ${T.border}`, padding: "20px 24px", marginBottom: 24, boxShadow: T.sm }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.brand, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          🔗 Tu enlace de reservas públicas
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 14, lineHeight: 1.6 }}>
          Comparte este link con tus clientes para que puedan agendar sin necesidad de tener cuenta.
        </div>
        {bookingUrl ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              flex: 1, minWidth: 180, padding: "10px 14px",
              background: T.appBg, border: `1.5px solid ${T.border}`, borderRadius: 10,
              fontSize: 13, color: T.brand, fontFamily: "monospace", wordBreak: "break-all",
            }}>
              {bookingUrl}
            </div>
            <Btn v="ghost" onClick={handleCopy}>
              {copied ? "✓ Copiado" : "📋 Copiar enlace"}
            </Btn>
            <Btn v="accent" onClick={() => window.open(bookingUrl, "_blank")}>
              🔗 Abrir
            </Btn>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            No se pudo obtener el enlace. Verifica que tu usuario tenga un tenant asignado.
          </div>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Pendientes",  value: appointments.filter((a) => a.guestName && a.status === "pendiente").length,  color: "#F59E0B" },
          { label: "Confirmadas", value: appointments.filter((a) => a.guestName && a.status === "confirmada").length, color: "#10B981" },
          { label: "Total",       value: appointments.filter((a) => a.guestName).length,                              color: T.brand  },
        ].map((k) => (
          <div key={k.label} style={{ background: T.panel, borderRadius: 14, padding: "16px 20px", border: `1px solid ${T.border}`, boxShadow: T.sm, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[
          { key: "pendiente",  label: "Pendientes" },
          { key: "confirmada", label: "Confirmadas" },
          { key: "completada", label: "Completadas" },
          { key: "cancelada",  label: "Canceladas" },
          { key: "all",        label: "Todas" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: T.font, border: `1.5px solid ${filter === f.key ? T.brand : T.border}`,
              background: filter === f.key ? T.brandXLight : T.panel,
              color: filter === f.key ? T.brand : T.textMuted,
              transition: "all 0.15s",
            }}>
            {f.label}
            {f.key === "pendiente" && pendingCount > 0 && (
              <span style={{ marginLeft: 6, background: "#EF4444", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de reservas */}
      {guestAppts.length === 0 ? (
        <div style={{ background: T.panel, borderRadius: 16, border: `1px solid ${T.border}`, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>
            Sin reservas {filter !== "all" ? STATUS_CFG[filter]?.label?.toLowerCase() + "s" : ""}
          </div>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            Las reservas que hagan tus clientes desde el enlace público aparecerán aquí.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {guestAppts.map((appt) => {
            const st  = STATUS_CFG[appt.status] || STATUS_CFG.pendiente;
            const typ = TYPE_CFG[appt.type]     || TYPE_CFG.otro;
            return (
              <div
                key={appt.id}
                onClick={() => setSelected(appt)}
                style={{
                  background: T.panel, borderRadius: 14, border: `1px solid ${T.border}`,
                  padding: "16px 20px", cursor: "pointer", boxShadow: T.sm,
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.md; e.currentTarget.style.borderColor = T.brand + "60"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sm; e.currentTarget.style.borderColor = T.border; }}
              >
                {/* Fecha y hora */}
                <div style={{ minWidth: 90 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{fmtDate(appt.date)}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{appt.time} · {typ.icon} {typ.label}</div>
                </div>

                {/* Cliente */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                    📱 {appt.guestName}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                    {appt.guestEmail}
                    {appt.guestPhone && ` · ${appt.guestPhone}`}
                  </div>
                  {appt.guestPetName && (
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>
                      🐾 {appt.guestPetName} ({appt.guestPetSpecies || "—"})
                    </div>
                  )}
                </div>

                {/* Notas */}
                {appt.notes && (
                  <div style={{ fontSize: 12, color: T.textMuted, maxWidth: 200, fontStyle: "italic" }}>
                    "{appt.notes}"
                  </div>
                )}

                {/* Estado */}
                <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color, flexShrink: 0 }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal detalle */}
      {selected && (
        <Modal
          title="Detalle de reserva"
          sub="Reserva pública — cliente sin cuenta"
          onClose={() => setSelected(null)}
        >
          {/* Info básica */}
          <div style={{ background: "#EEF2FF", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13 }}>
              <div><span style={{ fontWeight: 700, color: "#4338CA" }}>Fecha:</span> <span style={{ color: "#334155" }}>{fmtDate(selected.date)}</span></div>
              <div><span style={{ fontWeight: 700, color: "#4338CA" }}>Hora:</span> <span style={{ color: "#334155" }}>{selected.time}</span></div>
              <div><span style={{ fontWeight: 700, color: "#4338CA" }}>Tipo:</span> <span style={{ color: "#334155" }}>{TYPE_CFG[selected.type]?.icon} {TYPE_CFG[selected.type]?.label}</span></div>
              <div>
                <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: STATUS_CFG[selected.status]?.bg, color: STATUS_CFG[selected.status]?.color }}>
                  {STATUS_CFG[selected.status]?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Datos del cliente */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              Datos del cliente
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13, color: T.text }}>
              <div><span style={{ fontWeight: 700 }}>Nombre:</span> {selected.guestName}</div>
              <div><span style={{ fontWeight: 700 }}>Email:</span> {selected.guestEmail}</div>
              {selected.guestPhone && <div><span style={{ fontWeight: 700 }}>Teléfono:</span> {selected.guestPhone}</div>}
              {selected.guestRut   && <div><span style={{ fontWeight: 700 }}>RUT:</span> {selected.guestRut}</div>}
              {selected.guestPetName && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ fontWeight: 700 }}>Mascota:</span> {selected.guestPetName} ({selected.guestPetSpecies || "—"})
                </div>
              )}
              {selected.notes && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ fontWeight: 700 }}>Notas:</span> <span style={{ fontStyle: "italic" }}>{selected.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones de estado */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              Cambiar estado
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <button key={k} onClick={() => handleStatus(k)} disabled={saving || selected.status === k}
                  style={{
                    padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                    cursor: selected.status === k ? "default" : "pointer", fontFamily: T.font,
                    border: `1.5px solid ${selected.status === k ? v.color : T.border}`,
                    background: selected.status === k ? v.bg : T.panel,
                    color: v.color, opacity: saving ? 0.6 : 1, transition: "all 0.15s",
                  }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <Btn v="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando…" : "Eliminar reserva"}
            </Btn>
            <Btn v="ghost" onClick={() => setSelected(null)}>Cerrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
