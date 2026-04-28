import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import VetOSLogo from "../../components/ui/VetOSLogo.jsx";
import Btn from "../../components/ui/Btn.jsx";
import api from "../../services/api.js";

const STATUS_CFG = {
  active:    { label: "Activa",    bg: T.green,  color: T.greenText },
  suspended: { label: "Suspendida",bg: T.amber,  color: T.amberText },
  cancelled: { label: "Cancelada", bg: T.red,    color: T.redText   },
};

const PLAN_COLOR = {
  "Starter":   { bg: T.blue,   color: T.blueText },
  "Clínica":   { bg: T.purple, color: T.purpleText },
  "Enterprise":{ bg: "#FEF3C7", color: "#92400E" },
};

export default function SuperAdminDashboard() {
  const { currentUser, logout } = useApp();
  const [tenants, setTenants]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    api.get("/tenants")
      .then((r) => setTenants(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (t) => {
    const newStatus = t.status === "active" ? "suspended" : "active";
    try {
      await api.patch(`/tenants/${t.id}`, { status: newStatus });
      setTenants((prev) => prev.map((x) => x.id === t.id ? { ...x, status: newStatus } : x));
    } catch {}
  };

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
    (t.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount    = tenants.filter((t) => t.status === "active").length;
  const suspendedCount = tenants.filter((t) => t.status === "suspended").length;

  return (
    <div style={{ minHeight:"100vh", background:"#0F0F1A", fontFamily:T.font }}>

      {/* Topbar */}
      <div style={{ background:"#0F0F1A", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 36px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <VetOSLogo size={30} white />
          <div style={{ width:1, height:20, background:"rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            Panel VetOS
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.45)" }}>{currentUser.name}</span>
          <Btn v="ghost" style={{ fontSize:12, padding:"7px 14px", color:"rgba(255,255,255,0.45)", borderColor:"rgba(255,255,255,0.1)" }} onClick={logout}>
            Salir
          </Btn>
        </div>
      </div>

      <div style={{ padding:"36px 40px" }}>
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:"-0.03em", marginBottom:4 }}>Clínicas registradas</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)" }}>Gestiona todas las clínicas en la plataforma VetOS</p>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {[
            { label:"Total clínicas",  value:tenants.length,  icon:"🏥", color:"#818CF8" },
            { label:"Activas",         value:activeCount,     icon:"✅", color:"#34D399" },
            { label:"Suspendidas",     value:suspendedCount,  icon:"⏸️", color:"#FBBF24" },
            { label:"Nuevas este mes", value:tenants.filter((t) => t.createdAt >= "2026-04-01").length, icon:"🆕", color:"#60A5FA" },
          ].map((k) => (
            <div key={k.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:"18px 20px", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:22 }}>{k.icon}</div>
              <div style={{ fontSize:26, fontWeight:900, color:k.color, marginTop:6, lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4, fontWeight:600 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div style={{ marginBottom:16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o ciudad…"
            style={{ width:"100%", maxWidth:400, padding:"10px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, fontFamily:T.font, outline:"none" }}
          />
        </div>

        {/* Tabla */}
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, border:"1px solid rgba(255,255,255,0.07)", overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr auto", padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            {["Clínica","Email admin","Ciudad","Plan","Estado","Acción"].map((h) => (
              <span key={h} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14 }}>Cargando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14 }}>No hay clínicas registradas aún.</div>
          ) : filtered.map((t, i) => {
            const sc = STATUS_CFG[t.status] || STATUS_CFG.active;
            const pc = PLAN_COLOR[t.plan?.split(" ")[0]] || PLAN_COLOR["Starter"];
            return (
              <div key={t.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr auto", padding:"14px 20px", borderTop: i===0?"none":"1px solid rgba(255,255,255,0.04)", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{t.name}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>Desde {t.createdAt}</div>
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>{t.adminEmail}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{t.city || "—"}</div>
                <span style={{ display:"inline-flex", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:pc.bg, color:pc.color, width:"fit-content" }}>
                  {t.plan?.split(" ")[0] || "Starter"}
                </span>
                <span style={{ display:"inline-flex", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:sc.bg, color:sc.color, width:"fit-content" }}>
                  {sc.label}
                </span>
                <button
                  onClick={() => toggleStatus(t)}
                  style={{ fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.45)", cursor:"pointer", fontFamily:T.font }}
                >
                  {t.status === "active" ? "Suspender" : "Activar"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
