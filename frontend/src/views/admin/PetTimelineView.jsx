import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import T from "../../styles/tokens.js";
import { fmtDate, fmtCLP, spIcon } from "../../styles/helpers.js";
import PageTitle from "../../components/layout/PageTitle.jsx";

const TYPE_CONFIG = {
  record:   { icon: "📋", label: "Consulta",    bg: "#EEF2FF", color: "#4338CA", border: "#A5B4FC" },
  vaccine:  { icon: "💉", label: "Vacuna",      bg: "#F0FDF4", color: "#15803D", border: "#86EFAC" },
  grooming: { icon: "✂️", label: "Peluquería",  bg: "#FAF5FF", color: "#7E22CE", border: "#D8B4FE" },
  payment:  { icon: "💳", label: "Pago",        bg: "#FFF7ED", color: "#C2410C", border: "#FDBA74" },
};

const FILTERS = ["all", "record", "vaccine", "grooming", "payment"];
const FILTER_LABEL = { all: "Todo", record: "Consultas", vaccine: "Vacunas", grooming: "Peluquería", payment: "Pagos" };

function buildTimeline(petId, { records, vaccines, grooming, payments }) {
  const items = [];
  records.filter((r) => r.petId === petId).forEach((r) =>
    items.push({ type: "record", date: r.date, id: r.id, title: r.diagnosis || r.reason || "Consulta", sub: r.treatment || r.notes || "", raw: r }));
  vaccines.filter((v) => v.petId === petId).forEach((v) =>
    items.push({ type: "vaccine", date: v.dateApplied, id: v.id, title: v.name, sub: v.vet ? `Aplicada por ${v.vet}` : "", extra: v.nextDue ? `Próxima dosis: ${fmtDate(v.nextDue)}` : "", raw: v }));
  grooming.filter((g) => g.petId === petId).forEach((g) =>
    items.push({ type: "grooming", date: g.date, id: g.id, title: g.service || "Baño y peluquería", sub: g.notes || "", extra: g.status ? `Estado: ${g.status}` : "", raw: g }));
  payments.filter((p) => p.petId === petId).forEach((p) =>
    items.push({ type: "payment", date: p.date, id: p.id, title: p.concept, sub: `${fmtCLP(p.amount)} · ${p.status === "pagado" ? "Pagado" : "Pendiente"}`, extra: p.method || "", raw: p }));
  return items.filter((i) => i.date).sort((a, b) => b.date.localeCompare(a.date));
}

function PetCard({ pet, owner }) {
  const age = pet.birthdate
    ? (() => {
        const diff = Date.now() - new Date(pet.birthdate);
        const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
        const months = Math.floor((diff % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000));
        return years > 0 ? `${years} año${years > 1 ? "s" : ""}` : `${months} mes${months !== 1 ? "es" : ""}`;
      })()
    : null;

  return (
    <div style={{ background: T.panel, borderRadius: 16, border: `1px solid ${T.border}`, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: T.brandLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, flexShrink: 0 }}>
        {spIcon(pet.species)}
      </div>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{pet.name}</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {pet.species && <span>🐾 {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</span>}
          {age && <span>🎂 {age}</span>}
          {owner && <span>👤 {owner.name}</span>}
          {pet.weight && <span>⚖️ {pet.weight} kg</span>}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ item, isLast }) {
  const cfg = TYPE_CONFIG[item.type];
  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      {/* línea vertical */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, zIndex: 1 }}>
          {cfg.icon}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 24, background: T.border, marginTop: 4 }} />}
      </div>
      {/* contenido */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          {cfg.label} · {fmtDate(item.date)}
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: item.sub ? 4 : 0 }}>{item.title}</div>
          {item.sub && <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{item.sub}</div>}
          {item.extra && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4, fontStyle: "italic" }}>{item.extra}</div>}
        </div>
      </div>
    </div>
  );
}

export default function PetTimelineView() {
  const { pets, users, records, vaccines, grooming, payments } = useApp();
  const { isMobile } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const matchingPets = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return pets.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [pets, search]);

  const selectedPet = pets.find((p) => p.id === selectedId);
  const owner = selectedPet ? users.find((u) => u.id === selectedPet.ownerId) : null;

  const timeline = useMemo(() => {
    if (!selectedId) return [];
    return buildTimeline(selectedId, { records, vaccines, grooming, payments });
  }, [selectedId, records, vaccines, grooming, payments]);

  const filtered = typeFilter === "all" ? timeline : timeline.filter((i) => i.type === typeFilter);

  const counts = useMemo(() => {
    const c = { record: 0, vaccine: 0, grooming: 0, payment: 0 };
    timeline.forEach((i) => { c[i.type] = (c[i.type] || 0) + 1; });
    return c;
  }, [timeline]);

  return (
    <div style={{ padding: isMobile ? "0 14px 32px" : "0 36px 36px" }}>
      <PageTitle icon="📋" title="Ficha clínica" sub="Historial completo por mascota" />

      {/* Buscador de mascota */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 480 }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: T.textMuted }}>🔍</span>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (selectedId) setSelectedId(null); }}
          placeholder="Buscar mascota por nombre…"
          className="moga-input"
          style={{ width: "100%", padding: "11px 14px 11px 38px", border: `1.5px solid ${T.border}`, borderRadius: 12, fontSize: 14, color: T.text, background: T.panel, fontFamily: T.font, boxSizing: "border-box" }}
        />
        {matchingPets.length > 0 && !selectedPet && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.sm, zIndex: 50, overflow: "hidden" }}>
            {matchingPets.map((p) => {
              const own = users.find((u) => u.id === p.ownerId);
              return (
                <button key={p.id} onClick={() => { setSelectedId(p.id); setSearch(p.name); setTypeFilter("all"); }}
                  style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontFamily: T.font, borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 20 }}>{spIcon(p.species)}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.name}</div>
                    {own && <div style={{ fontSize: 12, color: T.textMuted }}>👤 {own.name}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!selectedPet && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted, fontSize: 15 }}>
          Busca una mascota para ver su historial clínico completo
        </div>
      )}

      {selectedPet && (
        <>
          <PetCard pet={selectedPet} owner={owner} />

          {/* Resumen de eventos */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 22 }}>
            {["record","vaccine","grooming","payment"].map((t) => {
              const cfg = TYPE_CONFIG[t];
              return (
                <div key={t} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{cfg.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{counts[t]}</div>
                  <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{cfg.label}s</div>
                </div>
              );
            })}
          </div>

          {/* Filtros por tipo */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setTypeFilter(f)}
                style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${typeFilter === f ? T.brand : T.border}`, background: typeFilter === f ? T.brandLight : T.panel, color: typeFilter === f ? T.brand : T.textMuted, fontSize: 13, fontWeight: typeFilter === f ? 700 : 400, cursor: "pointer", fontFamily: T.font }}>
                {FILTER_LABEL[f]}{f !== "all" ? ` (${counts[f] || 0})` : ""}
              </button>
            ))}
          </div>

          {/* Timeline */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted, fontSize: 14 }}>
              Sin registros para este filtro.
            </div>
          ) : (
            <div style={{ maxWidth: 680 }}>
              {filtered.map((item, i) => (
                <TimelineItem key={`${item.type}-${item.id}`} item={item} isLast={i === filtered.length - 1} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
