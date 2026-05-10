import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import T from "../../styles/tokens.js";
import { fmtDate, fmtCLP, spIcon, vaxStatus } from "../../styles/helpers.js";
import Modal  from "../../components/ui/Modal.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Btn    from "../../components/ui/Btn.jsx";

const TODAY = new Date().toISOString().slice(0, 10);
const RECORD_TYPES = ["Consulta","Control","Urgencia","Cirugía","Vacunación","Otro"];
const EMPTY_REC = { date: TODAY, type: "Consulta", vet: "", diagnosis: "", treatment: "", weight: "", temperature: "", notes: "", nextVisit: "" };

const TYPE_CONFIG = {
  record:   { icon: "📋", label: "Consulta",    bg: "#EEF2FF", color: "#4338CA", border: "#A5B4FC" },
  vaccine:  { icon: "💉", label: "Vacuna",      bg: "#F0FDF4", color: "#15803D", border: "#86EFAC" },
  grooming: { icon: "✂️", label: "Peluquería",  bg: "#FAF5FF", color: "#7E22CE", border: "#D8B4FE" },
  payment:  { icon: "💳", label: "Pago",        bg: "#FFF7ED", color: "#C2410C", border: "#FDBA74" },
};

function calcAge(birthdate) {
  if (!birthdate) return null;
  const diff = Date.now() - new Date(birthdate);
  const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  const months = Math.floor((diff % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000));
  return years > 0 ? `${years} año${years > 1 ? "s" : ""}` : `${months} mes${months !== 1 ? "es" : ""}`;
}

function buildTimeline(petId, { records, vaccines, grooming, payments }) {
  const items = [];
  records.filter((r) => r.petId === petId).forEach((r) =>
    items.push({ type: "record", date: r.date, id: r.id, title: r.diagnosis || r.reason || "Consulta", sub: r.treatment || "", extra: r.notes || "" }));
  vaccines.filter((v) => v.petId === petId).forEach((v) =>
    items.push({ type: "vaccine", date: v.dateApplied, id: v.id, title: v.name, sub: v.vet ? `Aplicada por ${v.vet}` : "", extra: v.nextDue ? `Próxima dosis: ${fmtDate(v.nextDue)}` : "" }));
  grooming.filter((g) => g.petId === petId).forEach((g) =>
    items.push({ type: "grooming", date: g.date, id: g.id, title: g.service || "Baño y peluquería", sub: g.notes || "", extra: g.status ? `Estado: ${g.status}` : "" }));
  payments.filter((p) => p.petId === petId).forEach((p) =>
    items.push({ type: "payment", date: p.date, id: p.id, title: p.concept, sub: `${fmtCLP(p.amount)} · ${p.status === "pagado" ? "Pagado" : "Pendiente"}`, extra: p.method || "" }));
  return items.filter((i) => i.date).sort((a, b) => b.date.localeCompare(a.date));
}

/* ── Lista de mascotas (panel izquierdo) ── */
function PetListItem({ pet, owner, total, isSelected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "11px 14px", background: isSelected ? T.brandLight : "none",
      border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer", display: "flex",
      alignItems: "center", gap: 10, fontFamily: T.font,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: isSelected ? T.brand : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {spIcon(pet.species)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? T.brand : T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pet.name}</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}{owner ? ` · ${owner.name}` : ""}
        </div>
      </div>
      {total > 0 && (
        <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? T.brand : T.textMuted, background: isSelected ? "#DBEAFE" : "#F3F4F6", padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>
          {total}
        </span>
      )}
    </button>
  );
}

/* ── Sección con título ── */
function Section({ icon, title, action, children, empty }) {
  return (
    <div style={{ background: T.panel, borderRadius: 14, border: `1px solid ${T.border}`, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.border}`, background: T.appBg }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{icon} {title}</div>
        {action}
      </div>
      <div style={{ padding: "14px 18px" }}>
        {empty
          ? <div style={{ fontSize: 13, color: T.textMuted, textAlign: "center", padding: "12px 0" }}>{empty}</div>
          : children}
      </div>
    </div>
  );
}

/* ── Item del timeline ── */
function TimelineItem({ item, isLast }) {
  const cfg = TYPE_CONFIG[item.type];
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg.bg, border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, zIndex: 1 }}>
          {cfg.icon}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 18, background: T.border, marginTop: 3 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
          {cfg.label} · {fmtDate(item.date)}
        </div>
        <div style={{ background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 13px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.title}</div>
          {item.sub   && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, lineHeight: 1.5 }}>{item.sub}</div>}
          {item.extra && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, fontStyle: "italic" }}>{item.extra}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Panel derecho: ficha completa ── */
function PetRecord({ pet, owner, records, vaccines, grooming, payments, users, onNewRecord }) {
  const age = calcAge(pet.birthdate);
  const petId = pet.id;

  const petRecords  = records.filter((r) => r.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
  const petVaccines = vaccines.filter((v) => v.petId === petId).sort((a, b) => (b.dateApplied || "").localeCompare(a.dateApplied || ""));
  const petGrooming = grooming.filter((g) => g.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
  const petPayments = payments.filter((p) => p.petId === petId).sort((a, b) => b.date.localeCompare(a.date));

  const pendingPayments  = petPayments.filter((p) => p.status === "pendiente");
  const overdueVaccines  = petVaccines.filter((v) => vaxStatus(v.nextDue).key === "red");
  const upcomingVaccines = petVaccines.filter((v) => vaxStatus(v.nextDue).key === "amber");

  // Historial de peso desde records
  const weightHistory = petRecords.filter((r) => r.weight).map((r) => ({ date: r.date, weight: r.weight }));

  const timeline = buildTimeline(petId, { records, vaccines, grooming, payments });

  return (
    <div>
      {/* ── TARJETA PACIENTE ── */}
      <div style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brandMid})`, borderRadius: 16, padding: "20px 24px", marginBottom: 16, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 68, height: 68, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, flexShrink: 0 }}>
          {spIcon(pet.species)}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{pet.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {pet.species && <span>🐾 {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</span>}
            {pet.gender && <span>♂♀ {pet.gender}</span>}
            {age && <span>🎂 {age}</span>}
            {pet.weight && <span>⚖️ {pet.weight} kg</span>}
            {pet.color && <span>🎨 {pet.color}</span>}
          </div>
          {owner && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>👤 Dueño: <strong style={{ color: "#fff" }}>{owner.name}</strong>{owner.phone ? ` · ${owner.phone}` : ""}</div>}
        </div>
        <button onClick={onNewRecord}
          style={{ padding: "10px 20px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font, flexShrink: 0 }}>
          📋 + Nueva consulta
        </button>
      </div>

      {/* ── ALERTAS ── */}
      {(overdueVaccines.length > 0 || pendingPayments.length > 0) && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {overdueVaccines.length > 0 && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>🚨</span>
              <div style={{ fontSize: 13, color: "#DC2626" }}>
                <strong>{overdueVaccines.length} vacuna{overdueVaccines.length > 1 ? "s" : ""} vencida{overdueVaccines.length > 1 ? "s" : ""}:</strong>{" "}
                {overdueVaccines.map((v) => v.name).join(", ")}
              </div>
            </div>
          )}
          {upcomingVaccines.length > 0 && (
            <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>⏰</span>
              <div style={{ fontSize: 13, color: "#92400E" }}>
                <strong>{upcomingVaccines.length} vacuna{upcomingVaccines.length > 1 ? "s" : ""} próxima{upcomingVaccines.length > 1 ? "s" : ""} a vencer:</strong>{" "}
                {upcomingVaccines.map((v) => v.name).join(", ")}
              </div>
            </div>
          )}
          {pendingPayments.length > 0 && (
            <div style={{ background: "#EFF6FF", border: "1px solid #93C5FD", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>💳</span>
              <div style={{ fontSize: 13, color: "#1D4ED8" }}>
                <strong>Deuda pendiente:</strong> {fmtCLP(pendingPayments.reduce((s, p) => s + p.amount, 0))} ({pendingPayments.length} pago{pendingPayments.length > 1 ? "s" : ""})
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GRID: contadores ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { key: "record",   count: petRecords.length },
          { key: "vaccine",  count: petVaccines.length },
          { key: "grooming", count: petGrooming.length },
          { key: "payment",  count: petPayments.length },
        ].map(({ key, count }) => {
          const cfg = TYPE_CONFIG[key];
          return (
            <div key={key} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{cfg.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{cfg.label}s</div>
            </div>
          );
        })}
      </div>

      {/* ── ÚLTIMAS CONSULTAS ── */}
      <Section icon="📋" title="Consultas médicas"
        action={<button onClick={onNewRecord} style={{ fontSize: 12, fontWeight: 700, color: T.brand, background: T.brandLight, border: "none", padding: "4px 12px", borderRadius: 8, cursor: "pointer", fontFamily: T.font }}>+ Nueva</button>}
        empty={petRecords.length === 0 ? "Sin consultas registradas aún. Haz clic en '+ Nueva' para agregar." : null}>
        {petRecords.slice(0, 5).map((r, i) => (
          <div key={r.id} style={{ padding: "12px 0", borderBottom: i < Math.min(petRecords.length, 5) - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{fmtDate(r.date)}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#EEF2FF", color: "#4338CA", fontWeight: 700 }}>{r.type || "Consulta"}</span>
              </div>
              {r.vet && <span style={{ fontSize: 11, color: T.textMuted }}>👩‍⚕️ {r.vet}</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: r.treatment ? 4 : 0 }}>
              {r.diagnosis || "Sin diagnóstico"}
            </div>
            {r.treatment && <div style={{ fontSize: 12, color: T.textMuted }}>💊 {r.treatment}</div>}
            <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11, color: T.textMuted }}>
              {r.weight      && <span>⚖️ {r.weight} kg</span>}
              {r.temperature && <span>🌡️ {r.temperature}°C</span>}
              {r.nextVisit   && <span style={{ color: "#7C3AED", fontWeight: 700 }}>🗓 Próxima: {fmtDate(r.nextVisit)}</span>}
            </div>
            {r.notes && <div style={{ fontSize: 11, marginTop: 6, color: T.textMuted, background: T.appBg, padding: "6px 10px", borderRadius: 8, borderLeft: `3px solid ${T.brand}` }}>📝 {r.notes}</div>}
          </div>
        ))}
        {petRecords.length > 5 && (
          <div style={{ fontSize: 12, color: T.textMuted, textAlign: "center", marginTop: 8 }}>
            + {petRecords.length - 5} consultas más (ver en el timeline)
          </div>
        )}
      </Section>

      {/* ── VACUNAS ── */}
      <Section icon="💉" title="Vacunas"
        empty={petVaccines.length === 0 ? "Sin vacunas registradas." : null}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {petVaccines.map((v) => {
            const st = vaxStatus(v.nextDue);
            const stColor = st.key === "green" ? "#15803D" : st.key === "amber" ? "#92400E" : "#DC2626";
            const stBg    = st.key === "green" ? "#F0FDF4" : st.key === "amber" ? "#FFFBEB" : "#FEF2F2";
            return (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: T.appBg, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>💉</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                    Aplicada: {fmtDate(v.dateApplied)}{v.vet ? ` · ${v.vet}` : ""}
                    {v.lot ? ` · Lote: ${v.lot}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: stBg, color: stColor }}>
                    {st.label}
                  </span>
                  {v.nextDue && <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>Próxima: {fmtDate(v.nextDue)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── HISTORIAL DE PESO ── */}
      {weightHistory.length > 0 && (
        <Section icon="⚖️" title="Historial de peso">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {weightHistory.map((w, i) => (
              <div key={i} style={{ background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{w.weight} kg</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{fmtDate(w.date)}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── PELUQUERÍA ── */}
      {petGrooming.length > 0 && (
        <Section icon="✂️" title="Peluquería">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {petGrooming.slice(0, 4).map((g) => (
              <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: T.appBg, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13 }}>
                <span>{g.service || "Baño y peluquería"}{g.notes ? ` · ${g.notes}` : ""}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{fmtDate(g.date)}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: g.status === "completado" ? "#F0FDF4" : "#FFFBEB",
                    color: g.status === "completado" ? "#15803D" : "#92400E", fontWeight: 700 }}>
                    {g.status || "pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── PAGOS ── */}
      {petPayments.length > 0 && (
        <Section icon="💳" title="Pagos">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {petPayments.slice(0, 4).map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: T.appBg, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{p.concept}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontWeight: 700, color: p.status === "pagado" ? "#15803D" : "#C2410C" }}>{fmtCLP(p.amount)}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: p.status === "pagado" ? "#F0FDF4" : "#FFF7ED",
                    color: p.status === "pagado" ? "#15803D" : "#C2410C", fontWeight: 700 }}>
                    {p.status === "pagado" ? "Pagado" : "Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── TIMELINE CRONOLÓGICO ── */}
      {timeline.length > 0 && (
        <Section icon="🕐" title={`Historial cronológico completo (${timeline.length} eventos)`}>
          {timeline.map((item, i) => (
            <TimelineItem key={`${item.type}-${item.id}`} item={item} isLast={i === timeline.length - 1} />
          ))}
        </Section>
      )}
    </div>
  );
}

/* ── Vista principal ── */
export default function PetTimelineView() {
  const { pets, users, records, vaccines, grooming, payments, addRecord } = useApp();
  const { isMobile } = useBreakpoint();
  const [search, setSearch]             = useState("");
  const [selectedId, setSelectedId]     = useState(null);
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [showDetail, setShowDetail]     = useState(false);
  const [recModal, setRecModal]         = useState(false);
  const [recForm, setRecForm]           = useState(EMPTY_REC);
  const [recBusy, setRecBusy]           = useState(false);

  const filteredPets = useMemo(() => {
    let list = [...pets];
    if (speciesFilter) list = list.filter((p) => p.species === speciesFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const own = users.find((u) => u.id === p.ownerId);
        return p.name?.toLowerCase().includes(q) || own?.name?.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [pets, users, search, speciesFilter]);

  const selectedPet = pets.find((p) => p.id === selectedId);
  const owner = selectedPet ? users.find((u) => u.id === selectedPet.ownerId) : null;
  const vets  = users.filter((u) => u.role !== "client");

  const selectPet = (id) => { setSelectedId(id); if (isMobile) setShowDetail(true); };

  const saveRecord = async () => {
    if (!recForm.diagnosis || recBusy) return;
    setRecBusy(true);
    try {
      await addRecord({ ...recForm, petId: selectedId, weight: +recForm.weight || null });
      setRecModal(false);
      setRecForm(EMPTY_REC);
    } finally { setRecBusy(false); }
  };

  const totalOf = (petId) => {
    return records.filter((r) => r.petId === petId).length
      + vaccines.filter((v) => v.petId === petId).length
      + grooming.filter((g) => g.petId === petId).length
      + payments.filter((p) => p.petId === petId).length;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: isMobile ? "14px 14px 0" : "0 36px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6 }}>
          <div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: T.text }}>📋 Ficha clínica</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{pets.length} pacientes registrados</div>
          </div>
          {isMobile && selectedPet && showDetail && (
            <button onClick={() => setShowDetail(false)}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel, color: T.text, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>
              ← Lista
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* ── Lista izquierda ── */}
        {(!isMobile || !showDetail) && (
          <div style={{ width: isMobile ? "100%" : 290, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, background: T.panel }}>
            <div style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.textMuted }}>🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar mascota o dueño…" className="moga-input"
                  style={{ width: "100%", padding: "7px 9px 7px 28px", border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 12, color: T.text, background: T.appBg, fontFamily: T.font, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {["", "Perro", "Gato"].map((s) => (
                  <button key={s} onClick={() => setSpeciesFilter(s)}
                    style={{ flex: 1, padding: "4px 0", borderRadius: 7, border: `1px solid ${speciesFilter === s ? T.brand : T.border}`, background: speciesFilter === s ? T.brandLight : T.appBg, color: speciesFilter === s ? T.brand : T.textMuted, fontSize: 11, fontWeight: speciesFilter === s ? 700 : 400, cursor: "pointer", fontFamily: T.font }}>
                    {s === "" ? "Todos" : s === "Perro" ? "🐕" : "🐈"}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center", marginTop: 6 }}>
                {filteredPets.length} mascota{filteredPets.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredPets.length === 0
                ? <div style={{ padding: "24px", textAlign: "center", color: T.textMuted, fontSize: 12 }}>Sin resultados.</div>
                : filteredPets.map((p) => {
                    const own = users.find((u) => u.id === p.ownerId);
                    return (
                      <PetListItem key={p.id} pet={p} owner={own} total={totalOf(p.id)}
                        isSelected={p.id === selectedId} onClick={() => selectPet(p.id)} />
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* ── Panel derecho: ficha ── */}
        {(!isMobile || showDetail) && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px 14px 32px" : "20px 28px 40px", background: T.appBg }}>
            {!selectedPet ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: T.textMuted, gap: 10 }}>
                <div style={{ fontSize: 56 }}>🐾</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Selecciona una mascota</div>
                <div style={{ fontSize: 13 }}>Verás su ficha clínica completa aquí</div>
              </div>
            ) : (
              <PetRecord
                pet={selectedPet} owner={owner}
                records={records} vaccines={vaccines} grooming={grooming} payments={payments} users={users}
                onNewRecord={() => { setRecForm(EMPTY_REC); setRecModal(true); }}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal nueva consulta */}
      {recModal && selectedPet && (
        <Modal title={`Nueva consulta — ${selectedPet.name}`} onClose={() => setRecModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input label="Fecha *" type="date" value={recForm.date} onChange={(e) => setRecForm({ ...recForm, date: e.target.value })} />
            <Select label="Tipo" value={recForm.type} onChange={(e) => setRecForm({ ...recForm, type: e.target.value })}>
              {RECORD_TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Input label="Peso (kg)" type="number" step="0.1" value={recForm.weight} onChange={(e) => setRecForm({ ...recForm, weight: e.target.value })} placeholder="25.5" />
            <Input label="Temperatura (°C)" value={recForm.temperature} onChange={(e) => setRecForm({ ...recForm, temperature: e.target.value })} placeholder="38.5" />
          </div>
          <Select label="Veterinario/a" value={recForm.vet} onChange={(e) => setRecForm({ ...recForm, vet: e.target.value })}>
            <option value="">Seleccionar...</option>
            {vets.map((v) => <option key={v.id}>{v.name}</option>)}
          </Select>
          <Input label="Diagnóstico *" value={recForm.diagnosis} onChange={(e) => setRecForm({ ...recForm, diagnosis: e.target.value })} placeholder="Ej: Control rutinario. Animal sano." />
          <Input label="Tratamiento / Medicación" value={recForm.treatment} onChange={(e) => setRecForm({ ...recForm, treatment: e.target.value })} placeholder="Ej: Amoxicilina 250mg por 7 días" />
          <Input label="Notas internas" value={recForm.notes} onChange={(e) => setRecForm({ ...recForm, notes: e.target.value })} placeholder="Observaciones adicionales…" />
          <Input label="Próxima visita" type="date" value={recForm.nextVisit} onChange={(e) => setRecForm({ ...recForm, nextVisit: e.target.value })} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={() => setRecModal(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={saveRecord} disabled={recBusy || !recForm.diagnosis}>
              {recBusy ? "Guardando…" : "Guardar consulta"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
