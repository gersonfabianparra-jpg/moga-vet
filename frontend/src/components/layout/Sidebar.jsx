import T from "../../styles/tokens.js";
import Avatar   from "../ui/Avatar.jsx";
import VetOSLogo from "../ui/VetOSLogo.jsx";
import ECGLine   from "../ui/ECGLine.jsx";

const NAV = [
  { id:"overview",      icon:"▦",  label:"Inicio" },
  { id:"pets",          icon:"🐾", label:"Mascotas" },
  { id:"records",       icon:"📋", label:"Fichas médicas" },
  { id:"grooming",      icon:"✂️", label:"Peluquería" },
  { id:"vaccines",      icon:"💉", label:"Vacunas" },
  { id:"payments",      icon:"💳", label:"Pagos" },
  { id:"appointments",  icon:"🗓", label:"Agenda" },
  { id:"users",         icon:"👥", label:"Clientes" },
];

export default function Sidebar({ user, activeTab, onTab, onLogout, onSearch, badges = {} }) {
  return (
    <div style={{
      width: 248,
      background: T.sb,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      borderRight: "1px solid rgba(255,255,255,0.05)",
    }}>

      {/* ── Bloque de marca ────────────────────────────────────────── */}
      <div style={{
        padding: "24px 20px 0",
        background: "linear-gradient(180deg, rgba(99,102,241,0.12) 0%, transparent 100%)",
      }}>
        {/* Logo ícono grande */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
          <div style={{
            borderRadius: 14,
            boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 8px 24px rgba(99,102,241,0.35)",
          }}>
            <VetOSLogo size={46} white hero />
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{
              fontSize: 22, fontWeight: 900, color: "#fff",
              letterSpacing: "-0.04em", fontFamily: T.font,
            }}>
              Vet<span style={{ color: "#818CF8" }}>OS</span>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 3,
            }}>
              Platform
            </div>
          </div>
        </div>

        {/* Línea ECG decorativa */}
        <ECGLine color="rgba(99,102,241,0.4)" height={20} strokeWidth={1.8} />

        {/* Divisor */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />
      </div>

      {/* ── Buscador ────────────────────────────────────────────────── */}
      <div style={{ padding: "0 12px 10px" }}>
        <button
          onClick={onSearch}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            cursor: "pointer", fontFamily: T.font,
            color: "rgba(255,255,255,0.35)", fontSize: 13, textAlign: "left",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          <span style={{ fontSize: 14, opacity: 0.6 }}>🔍</span>
          <span style={{ flex: 1 }}>Buscar…</span>
          <kbd style={{
            fontSize: 10, background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5,
            padding: "2px 6px", color: "rgba(255,255,255,0.28)",
            fontFamily: "monospace",
          }}>⌘K</kbd>
        </button>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: "2px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const active = activeTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onTab(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 12px",
                border: "none", cursor: "pointer", borderRadius: 10,
                fontFamily: T.font, fontSize: 13.5, fontWeight: active ? 600 : 400,
                textAlign: "left", justifyContent: "space-between",
                background: active ? "rgba(99,102,241,0.18)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                boxShadow: active ? "inset 3px 0 0 #818CF8" : "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: active ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, transition: "background 0.15s",
                  boxShadow: active ? "0 0 12px rgba(99,102,241,0.4)" : "none",
                }}>
                  {n.icon}
                </span>
                {n.label}
              </div>
              {badges[n.id] > 0 && (
                <span style={{
                  background: "#EF4444", color: "#fff", borderRadius: 20,
                  fontSize: 10, fontWeight: 700, padding: "2px 7px",
                  minWidth: 20, textAlign: "center",
                }}>
                  {badges[n.id]}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── ECG decorativa al pie ────────────────────────────────────── */}
      <div style={{ padding: "0 12px", opacity: 0.4 }}>
        <ECGLine color="rgba(129,140,248,0.6)" height={18} strokeWidth={1.2} />
      </div>

      {/* ── Usuario ──────────────────────────────────────────────────── */}
      <div style={{ padding: "10px 12px 16px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
          padding: "10px 12px", borderRadius: 10,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <Avatar name={user.name} size={32} bg={T.brand} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: "#fff", fontSize: 12.5, fontWeight: 700, fontFamily: T.font,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user.name.split(" ")[0]} {user.name.split(" ").slice(-1)[0]}
            </div>
            <div style={{
              color: "#818CF8", fontSize: 10.5, fontWeight: 600,
              fontFamily: T.font, textTransform: "capitalize", marginTop: 1,
            }}>
              {user.role === "admin" ? "Administrador" : "Veterinario/a"}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: "100%", padding: "8px 0",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.3)",
            borderRadius: 8, cursor: "pointer",
            fontSize: 12, fontFamily: T.font, transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
