import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { spIcon, fmtDate } from "../../styles/helpers.js";

const TYPE_ICON = {
  consulta: "🩺", control: "📋", vacuna: "💉",
  urgencia: "🚨", peluqueria: "✂️", otro: "📌",
};

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#E0E7FF", color: "#4338CA", borderRadius: 3, padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchModal({ onClose, onNavigate }) {
  const { pets, users, appointments } = useApp();
  const [query, setQuery]   = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();

  const results = q.length < 1 ? [] : [
    ...pets
      .filter((p) => p.name.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q) || p.species?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => {
        const owner = users.find((u) => u.id === p.ownerId);
        return {
          key: `pet-${p.id}`, type: "mascota", icon: spIcon(p.species),
          title: p.name, sub: `${p.breed} · ${owner?.name ?? "Sin dueño"}`,
          action: () => onNavigate("pets"),
        };
      }),
    ...users
      .filter((u) => u.role === "client" && (
        u.name.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.rut?.toLowerCase().includes(q)
      ))
      .slice(0, 3)
      .map((u) => ({
        key: `client-${u.id}`, type: "cliente", icon: "👤",
        title: u.name, sub: u.email ?? u.rut ?? "",
        action: () => onNavigate("users"),
      })),
    ...appointments
      .filter((a) => {
        const pet = pets.find((p) => p.id === a.petId);
        return (
          pet?.name.toLowerCase().includes(q) ||
          a.date.includes(q) ||
          a.type?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q)
        );
      })
      .slice(0, 3)
      .map((a) => {
        const pet = pets.find((p) => p.id === a.petId);
        return {
          key: `appt-${a.id}`, type: "cita", icon: TYPE_ICON[a.type] ?? "📌",
          title: `${pet?.name ?? "—"} · ${a.type}`,
          sub: `${fmtDate(a.date)} ${a.time} · ${a.status}`,
          action: () => onNavigate("appointments"),
        };
      }),
  ];

  // Navegación por teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && results[cursor]) { results[cursor].action(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, cursor, onClose]);

  useEffect(() => { setCursor(0); }, [query]);

  // Scroll al item activo
  useEffect(() => {
    const el = listRef.current?.children[cursor];
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const GROUP_LABELS = { mascota: "🐾 Mascotas", cliente: "👥 Clientes", cita: "🗓 Citas" };
  let lastType = null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position:"fixed", inset:0, background:"rgba(15,15,26,0.6)", backdropFilter:"blur(4px)", zIndex:200 }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 580, zIndex: 201,
        background: "#fff", borderRadius: 18,
        boxShadow: "0 32px 80px rgba(99,102,241,0.25), 0 4px 16px rgba(0,0,0,0.1)",
        overflow: "hidden", fontFamily: T.font,
      }}>

        {/* Input */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderBottom:`1px solid ${T.border}` }}>
          <span style={{ fontSize:18, opacity:0.4 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar mascota, cliente o cita…"
            style={{
              flex:1, border:"none", outline:"none", fontSize:16,
              fontFamily:T.font, color:T.text, background:"transparent",
            }}
          />
          <kbd style={{ fontSize:11, color:T.textMuted, background:T.appBg, border:`1px solid ${T.border}`, borderRadius:6, padding:"3px 7px", fontFamily:"monospace" }}>
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div ref={listRef} style={{ maxHeight:380, overflowY:"auto" }}>
          {q.length < 1 && (
            <div style={{ padding:"28px 20px", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
              <div style={{ fontSize:14, color:T.textMuted }}>Escribe para buscar mascotas, clientes o citas</div>
              <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:16, flexWrap:"wrap" }}>
                {["Luna","Ana Torres","consulta"].map((hint) => (
                  <button key={hint} onClick={() => setQuery(hint)} style={{ fontSize:12, color:T.brand, background:T.brandLight, border:"none", borderRadius:20, padding:"4px 12px", cursor:"pointer", fontFamily:T.font, fontWeight:600 }}>
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.length >= 1 && results.length === 0 && (
            <div style={{ padding:"36px 20px", textAlign:"center", color:T.textMuted, fontSize:14 }}>
              Sin resultados para "<strong>{query}</strong>"
            </div>
          )}

          {results.map((r, i) => {
            const showHeader = r.type !== lastType;
            lastType = r.type;
            return (
              <div key={r.key}>
                {showHeader && (
                  <div style={{ padding:"8px 20px 4px", fontSize:11, fontWeight:700, color:T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", background:T.appBg }}>
                    {GROUP_LABELS[r.type]}
                  </div>
                )}
                <button
                  onClick={() => { r.action(); onClose(); }}
                  style={{
                    width:"100%", display:"flex", alignItems:"center", gap:12,
                    padding:"11px 20px", border:"none", cursor:"pointer", textAlign:"left",
                    background: cursor === i ? T.brandXLight : "#fff",
                    borderLeft: cursor === i ? `3px solid ${T.brand}` : "3px solid transparent",
                    fontFamily:T.font, transition:"background 0.1s",
                  }}
                  onMouseEnter={() => setCursor(i)}
                >
                  <div style={{ width:36, height:36, borderRadius:10, background: cursor===i ? T.brandLight : T.appBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, transition:"background 0.1s" }}>
                    {r.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {highlight(r.title, query)}
                    </div>
                    <div style={{ fontSize:12, color:T.textMuted, marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {highlight(r.sub, query)}
                    </div>
                  </div>
                  <span style={{ fontSize:11, color:T.textMuted, background:T.appBg, borderRadius:6, padding:"2px 8px", flexShrink:0 }}>
                    ↵ Ir
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding:"8px 20px", borderTop:`1px solid ${T.border}`, display:"flex", gap:16, background:T.appBg }}>
          {[["↑↓","Navegar"],["↵","Abrir"],["Esc","Cerrar"]].map(([k,l]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <kbd style={{ fontSize:10, color:T.textMuted, background:"#fff", border:`1px solid ${T.border}`, borderRadius:5, padding:"2px 6px", fontFamily:"monospace" }}>{k}</kbd>
              <span style={{ fontSize:11, color:T.textMuted }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
