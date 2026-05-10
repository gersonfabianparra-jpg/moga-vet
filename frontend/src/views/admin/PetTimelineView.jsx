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

const FILTERS = ["all", "record", "vaccine", "grooming", "payment"];
const FILTER_LABEL = { all: "Todo", record: "Consultas", vaccine: "Vacunas", grooming: "Peluquería", payment: "Pagos" };

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
    items.push({ type: "record", date: r.date, id: r.id, title: r.diagnosis || r.reason || "Consulta", sub: r.treatment || r.notes || "" }));
  vaccines.filter((v) => v.petId === petId).forEach((v) =>
    items.push({ type: "vaccine", date: v.dateApplied, id: v.id, title: v.name, sub: v.vet ? `Aplicada por ${v.vet}` : "", extra: v.nextDue ? `Próxima dosis: ${fmtDate(v.nextDue)}` : "" }));
  grooming.filter((g) => g.petId === petId).forEach((g) =>
    items.push({ type: "grooming", date: g.date, id: g.id, title: g.service || "Baño y peluquería", sub: g.notes || "", extra: g.status ? `Estado: ${g.status}` : "" }));
  payments.filter((p) => p.petId === petId).forEach((p) =>
    items.push({ type: "payment", date: p.date, id: p.id, title: p.concept, sub: `${fmtCLP(p.amount)} · ${p.status === "pagado" ? "Pagado" : "Pendiente"}`, extra: p.method || "" }));
  return items.filter((i) => i.date).sort((a, b) => b.date.localeCompare(a.date));
}

function eventCounts(petId, { records, vaccines, grooming, payments }) {
  return {
    record:   records.filter((r) => r.petId === petId).length,
    vaccine:  vaccines.filter((v) => v.petId === petId).length,
    grooming: grooming.filter((g) => g.petId === petId).length,
    payment:  payments.filter((p) => p.petId === petId).length,
  };
}

/* ── Lista de mascotas (panel izquierdo) ── */
function PetListItem({ pet, owner, counts, isSelected, onClick }) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  return (
    <button onClick={onClick}
      style={{
        width: "100%", textAlign: "left", padding: "12px 14px", background: isSelected ? T.brandLight : "none",
        border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center",
        gap: 12, fontFamily: T.font, transition: "background 0.15s",
      }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: isSelected ? T.brand : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {spIcon(pet.species)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? T.brand : T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pet.name}</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}{owner ? ` · ${owner.name}` : ""}
        </div>
      </div>
      {total > 0 && (
        <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? T.brand : T.textMuted, background: isSelected ? "#EEF2FF" : T.border, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
          {total}
        </span>
      )}
    </button>
  );
}

/* ── Tarjeta de mascota seleccionada ── */
function PetCard({ pet, owner, counts, vaccines }) {
  const age = calcAge(pet.birthdate);
  const lastVax = vaccines.filter((v) => v.petId === pet.id).sort((a, b) => (b.dateApplied || "").localeCompare(a.dateApplied || ""))[0];
  const vaxSt = lastVax ? vaxStatus(lastVax.nextDue) : null;

  return (
    <div style={{ background: T.panel, borderRadius: 16, border: `1px solid ${T.border}`, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: T.brandLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, flexShrink: 0 }}>
          {spIcon(pet.species)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{pet.name}</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, display: "flex", gap: 14, flexWrap: "wrap" }}>
            {pet.species && <span>🐾 {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</span>}
            {age && <span>🎂 {age}</span>}
            {pet.weight && <span>⚖️ {pet.weight} kg</span>}
            {owner && <span>👤 {owner.name}</span>}
          </div>
          {vaxSt && (
            <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
              background: vaxSt.key === "green" ? "#F0FDF4" : vaxSt.key === "amber" ? "#FEF3C7" : "#FEF2F2",
              color: vaxSt.key === "green" ? "#15803D" : vaxSt.key === "amber" ? "#92400E" : "#DC2626" }}>
              💉 {vaxSt.label}
            </span>
          )}
        </div>
      </div>
      {/* Mini resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {["record","vaccine","grooming","payment"].map((t) => {
          const cfg = TYPE_CONFIG[t];
          return (
            <div key={t} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{cfg.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color }}>{counts[t]}</div>
              <div style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}s</div>
            </div>
          );
        })}
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
        <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, zIndex: 1 }}>
          {cfg.icon}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: T.border, marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
          {cfg.label} · {fmtDate(item.date)}
        </div>
        <div style={{ background: T.appBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.title}</div>
          {item.sub   && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3, lineHeight: 1.5 }}>{item.sub}</div>}
          {item.extra && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3, fontStyle: "italic" }}>{item.extra}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Vista principal ── */
export default function PetTimelineView() {
  const { pets, users, records, vaccines, grooming, payments, addRecord } = useApp();
  const { isMobile } = useBreakpoint();
  const [search, setSearch]           = useState("");
  const [selectedId, setSelectedId]   = useState(null);
  const [typeFilter, setTypeFilter]   = useState("all");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [showTimeline, setShowTimeline]   = useState(false);
  const [recModal, setRecModal]       = useState(false);
  const [recForm, setRecForm]         = useState(EMPTY_REC);
  const [recBusy, setRecBusy]         = useState(false);

  const filteredPets = useMemo(() => {
    let list = [...pets];
    if (speciesFilter) list = list.filter((p) => p.species === speciesFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const owner = users.find((u) => u.id === p.ownerId);
        return p.name?.toLowerCase().includes(q) || owner?.name?.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => a.name?.localeCompare(b.name || ""));
  }, [pets, users, search, speciesFilter]);

  const selectedPet = pets.find((p) => p.id === selectedId);
  const owner = selectedPet ? users.find((u) => u.id === selectedPet.ownerId) : null;

  const counts = useMemo(() =>
    selectedId ? eventCounts(selectedId, { records, vaccines, grooming, payments }) : { record: 0, vaccine: 0, grooming: 0, payment: 0 },
    [selectedId, records, vaccines, grooming, payments]);

  const timeline = useMemo(() =>
    selectedId ? buildTimeline(selectedId, { records, vaccines, grooming, payments }) : [],
    [selectedId, records, vaccines, grooming, payments]);

  const filtered = typeFilter === "all" ? timeline : timeline.filter((i) => i.type === typeFilter);

  const selectPet = (id) => {
    setSelectedId(id);
    setTypeFilter("all");
    if (isMobile) setShowTimeline(true);
  };

  const totalEvents = Object.values(counts).reduce((s, n) => s + n, 0);
  const vets = users.filter((u) => u.role !== "client");

  const saveRecord = async () => {
    if (!recForm.diagnosis || recBusy) return;
    setRecBusy(true);
    try {
      await addRecord({ ...recForm, petId: selectedId, weight: +recForm.weight || null });
      setRecModal(false);
      setRecForm(EMPTY_REC);
      setTypeFilter("record");
    } finally { setRecBusy(false); }
  };

  /* ── layout ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: isMobile ? "16px 14px 0" : "0 36px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: T.text }}>📋 Ficha clínica</div>
            <div style={{ fontSize: 13, color: T.textMuted }}>{pets.length} mascotas · selecciona una para ver su historial</div>
          </div>
          {isMobile && selectedPet && showTimeline && (
            <button onClick={() => setShowTimeline(false)}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel, color: T.text, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>
              ← Lista
            </button>
          )}
        </div>
      </div>

      {/* Body split */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, gap: 0 }}>

        {/* ── Panel izquierdo: lista de mascotas ── */}
        {(!isMobile || !showTimeline) && (
          <div style={{
            width: isMobile ? "100%" : 300, flexShrink: 0,
            display: "flex", flexDirection: "column",
            borderRight: isMobile ? "none" : `1px solid ${T.border}`,
            background: T.panel,
          }}>
            {/* Búsqueda y filtros */}
            <div style={{ padding: "14px 12px 10px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.textMuted }}>🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar mascota o dueño…"
                  className="moga-input"
                  style={{ width: "100%", padding: "8px 10px 8px 30px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: T.appBg, fontFamily: T.font, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["", "Perro", "Gato"].map((s) => (
                  <button key={s} onClick={() => setSpeciesFilter(s)}
                    style={{ flex: 1, padding: "5px 0", borderRadius: 8, border: `1px solid ${speciesFilter === s ? T.brand : T.border}`, background: speciesFilter === s ? T.brandLight : T.appBg, color: speciesFilter === s ? T.brand : T.textMuted, fontSize: 12, fontWeight: speciesFilter === s ? 700 : 400, cursor: "pointer", fontFamily: T.font }}>
                    {s === "" ? "Todos" : s === "Perro" ? "🐕 Perros" : "🐈 Gatos"}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 8, textAlign: "center" }}>
                {filteredPets.length} mascota{filteredPets.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Lista scrollable */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredPets.length === 0 ? (
                <div style={{ padding: "30px 16px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>Sin resultados.</div>
              ) : (
                filteredPets.map((p) => {
                  const own = users.find((u) => u.id === p.ownerId);
                  const cnt = eventCounts(p.id, { records, vaccines, grooming, payments });
                  return (
                    <PetListItem key={p.id} pet={p} owner={own} counts={cnt}
                      isSelected={p.id === selectedId} onClick={() => selectPet(p.id)} />
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Panel derecho: timeline ── */}
        {(!isMobile || showTimeline) && (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px 14px 32px" : "20px 32px 32px", background: T.appBg }}>
            {!selectedPet ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: T.textMuted, gap: 12 }}>
                <div style={{ fontSize: 52 }}>🐾</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Selecciona una mascota</div>
                <div style={{ fontSize: 13 }}>Ver su historial clínico completo</div>
              </div>
            ) : (
              <>
                <PetCard pet={selectedPet} owner={owner} counts={counts} vaccines={vaccines} />

                {/* Acción rápida */}
                <div style={{ marginBottom: 16 }}>
                  <button onClick={() => { setRecForm(EMPTY_REC); setRecModal(true); }}
                    style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: T.brand, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
                    📋 + Nueva consulta
                  </button>
                </div>

                {/* Filtros */}
                <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
                  {FILTERS.map((f) => (
                    <button key={f} onClick={() => setTypeFilter(f)}
                      style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${typeFilter === f ? T.brand : T.border}`, background: typeFilter === f ? T.brandLight : T.panel, color: typeFilter === f ? T.brand : T.textMuted, fontSize: 12, fontWeight: typeFilter === f ? 700 : 400, cursor: "pointer", fontFamily: T.font }}>
                      {FILTER_LABEL[f]}{f !== "all" && counts[f] > 0 ? ` (${counts[f]})` : ""}
                    </button>
                  ))}
                  <span style={{ marginLeft: "auto", fontSize: 12, color: T.textMuted, alignSelf: "center" }}>
                    {totalEvents} evento{totalEvents !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Timeline */}
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted, fontSize: 14 }}>
                    Sin registros para este filtro.
                  </div>
                ) : (
                  filtered.map((item, i) => (
                    <TimelineItem key={`${item.type}-${item.id}`} item={item} isLast={i === filtered.length - 1} />
                  ))
                )}
              </>
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
          <Input label="Tratamiento" value={recForm.treatment} onChange={(e) => setRecForm({ ...recForm, treatment: e.target.value })} placeholder="Ej: Vacuna antirrábica" />
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
