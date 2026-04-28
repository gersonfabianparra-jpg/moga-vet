import T from "../../styles/tokens.js";
import Avatar from "../ui/Avatar.jsx";

const NAV = [
  { id:"overview",  icon:"▦",  label:"Inicio" },
  { id:"pets",      icon:"🐾", label:"Mascotas" },
  { id:"records",   icon:"📋", label:"Fichas médicas" },
  { id:"grooming",  icon:"✂️", label:"Peluquería" },
  { id:"vaccines",  icon:"💉", label:"Vacunas" },
  { id:"payments",  icon:"💳", label:"Pagos" },
  { id:"appointments", icon:"🗓", label:"Agenda" },
  { id:"users",        icon:"👥", label:"Clientes" },
];

export default function Sidebar({ user, activeTab, onTab, onLogout, badges = {} }) {
  return (
    <div style={{
      width: 240,
      background: T.sb,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      borderRight: "1px solid rgba(255,255,255,0.05)",
    }}>

      {/* Logo */}
      <div style={{ padding: "22px 20px 18px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 10,
          padding: "9px 14px",
          display: "inline-flex",
          alignItems: "center",
        }}>
          <img src="/logo.png" alt="MOGA" style={{ width: 110, display: "block" }} />
        </div>
        <div style={{
          fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.2em", marginTop: 10, paddingLeft: 2, fontFamily: T.font,
          textTransform: "uppercase",
        }}>
          Sistema Veterinario
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "6px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const active = activeTab === n.id;
          return (
            <button
              key={n.id}
              className="nav-item"
              onClick={() => onTab(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 12px",
                border: "none", cursor: "pointer", borderRadius: 10,
                fontFamily: T.font, fontSize: 13.5, fontWeight: active ? 600 : 400,
                textAlign: "left", justifyContent: "space-between",
                background: active ? "rgba(255,255,255,0.09)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.48)",
                boxShadow: active ? "inset 3px 0 0 " + T.brand : "none",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: active ? T.brand : "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, transition: "background 0.15s",
                  flexShrink: 0,
                }}>
                  {n.icon}
                </span>
                {n.label}
              </div>
              {badges[n.id] > 0 && (
                <span style={{
                  background: "#ef4444", color: "#fff", borderRadius: 20,
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

      {/* User */}
      <div style={{ padding: "12px 12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
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
              color: T.brand, fontSize: 10.5, fontWeight: 600,
              fontFamily: T.font, textTransform: "capitalize",
              marginTop: 1,
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
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.35)",
            borderRadius: 8, cursor: "pointer",
            fontSize: 12, fontFamily: T.font,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
