import T from "../../styles/tokens.js";
import Avatar from "../ui/Avatar.jsx";

const NAV = [
  { id:"overview",  icon:"⬡",  label:"Inicio" },
  { id:"pets",      icon:"🐾", label:"Mascotas" },
  { id:"records",   icon:"📋", label:"Fichas médicas" },
  { id:"grooming",  icon:"✂️", label:"Peluquería" },
  { id:"vaccines",  icon:"💉", label:"Vacunas" },
  { id:"payments",  icon:"💳", label:"Pagos" },
  { id:"users",     icon:"👥", label:"Clientes" },
];

export default function Sidebar({ user, activeTab, onTab, onLogout, badges = {} }) {
  return (
    <div style={{
      width:230, background:T.sb, display:"flex", flexDirection:"column",
      flexShrink:0, height:"100vh", position:"sticky", top:0,
    }}>
      <div style={{ padding:"18px 18px 16px", borderBottom:`1px solid ${T.sbBorder}` }}>
        <div style={{ background:"#fff", borderRadius:12, padding:"10px 14px", display:"inline-block" }}>
          <img src="/logo.png" alt="MOGA" style={{ width:130, display:"block" }}/>
        </div>
        <div style={{ fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", marginTop:8, paddingLeft:4 }}>
          VETERINARIA
        </div>
      </div>

      <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto", display:"flex", flexDirection:"column", gap:2 }}>
        {NAV.map((n) => {
          const active = activeTab === n.id;
          return (
            <button
              key={n.id}
              className="nav-item"
              onClick={() => onTab(n.id)}
              style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"9px 12px", border:"none", cursor:"pointer",
                borderRadius:10, fontFamily:T.font, fontSize:13.5,
                fontWeight: active ? 700 : 400, textAlign:"left",
                background: active ? "rgba(255,255,255,0.1)" : "transparent",
                color: active ? "#fff" : T.sbText,
                justifyContent:"space-between",
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16, width:20, textAlign:"center" }}>{n.icon}</span>
                {n.label}
              </div>
              {badges[n.id] > 0 && (
                <span style={{
                  background:"#dc2626", color:"#fff", borderRadius:10,
                  fontSize:11, fontWeight:700, padding:"1px 7px",
                  minWidth:20, textAlign:"center",
                }}>
                  {badges[n.id]}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"14px 14px 18px", borderTop:`1px solid ${T.sbBorder}` }}>
        <div style={{
          display:"flex", alignItems:"center", gap:10, marginBottom:12,
          padding:"8px 10px", borderRadius:10, background:"rgba(255,255,255,0.05)",
        }}>
          <Avatar name={user.name} size={34} bg={T.gold}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:"#fff", fontSize:13, fontWeight:700, fontFamily:T.font, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {user.name.split(" ")[0]} {user.name.split(" ").slice(-1)[0]}
            </div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, textTransform:"capitalize", fontFamily:T.font }}>
              {user.role === "admin" ? "Administrador" : "Veterinario/a"}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width:"100%", padding:8, background:"transparent",
            border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)",
            borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:T.font,
            transition:"all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor="rgba(255,255,255,0.25)"; e.currentTarget.style.color="rgba(255,255,255,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
