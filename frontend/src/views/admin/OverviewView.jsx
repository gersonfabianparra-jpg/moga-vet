import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { fmtCLP, fmtDate, spIcon, vaxStatus } from "../../styles/helpers.js";
import KpiCard    from "../../components/layout/KpiCard.jsx";
import StatusBadge from "../../components/ui/badges/StatusBadge.jsx";
import VaxBadge   from "../../components/ui/badges/VaxBadge.jsx";

export default function OverviewView() {
  const { pets, records, grooming, users, payments, vaccines, currentUser } = useApp();
  const clients   = users.filter((u) => u.role === "client");
  const today     = new Date().toISOString().slice(0, 10);
  const upcoming  = [...grooming]
    .filter((g) => g.date >= today && g.status !== "cancelada")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const totalPaid    = payments.filter((p) => p.status === "pagado").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pendiente").reduce((s, p) => s + p.amount, 0);
  const urgentVax    = vaccines.filter((v) => vaxStatus(v.nextDue).key !== "green");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const firstName = currentUser?.name?.split(" ")[0] ?? "";

  return (
    <div style={{ padding: "0 36px 40px", maxWidth: 1200 }}>

      {/* Hero bienvenida */}
      <div className="fade-up" style={{
        background: `linear-gradient(135deg, ${T.sb} 0%, #162032 60%, #1a3347 100%)`,
        borderRadius: 20, padding: "28px 36px", marginBottom: 24,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", overflow: "hidden",
        boxShadow: "0 12px 36px rgba(15,23,42,0.25)",
      }}>
        {/* Círculos decorativos */}
        <div style={{ position:"absolute", top:-40, right:120, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, right:-20, width:220, height:220, borderRadius:"50%", background:"rgba(5,150,105,0.06)", pointerEvents:"none" }}/>

        <div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", fontFamily:T.font, marginBottom:6, fontWeight:500 }}>
            {fmtDate(today)}
          </div>
          <h2 style={{ fontSize:26, fontWeight:800, color:"#fff", fontFamily:T.font, letterSpacing:"-0.4px", marginBottom:8 }}>
            {greeting}, {firstName} 👋
          </h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", fontFamily:T.font, maxWidth:440, lineHeight:1.6 }}>
            Aquí tienes el resumen del día. {upcoming.length > 0 ? `Tienes ${upcoming.length} cita${upcoming.length > 1 ? "s" : ""} próxima${upcoming.length > 1 ? "s" : ""}.` : "No hay citas pendientes por hoy."}
          </p>
        </div>
        <div style={{
          width:64, height:64, borderRadius:18,
          background:"rgba(5,150,105,0.2)",
          border:"1px solid rgba(5,150,105,0.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:28, flexShrink:0,
        }}>
          🐾
        </div>
      </div>

      {/* Alerta vacunas */}
      {urgentVax.length > 0 && (
        <div className="fade-up" style={{
          background: "linear-gradient(135deg,#7c2d12,#9a3412)",
          borderRadius: 14, padding: "14px 20px", marginBottom: 20,
          display: "flex", gap: 14, alignItems: "center",
          boxShadow: "0 4px 16px rgba(154,52,18,0.3)",
        }}>
          <span style={{ fontSize:22 }}>💉</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:"#fff", fontSize:14, marginBottom:3 }}>
              {urgentVax.length} vacuna{urgentVax.length !== 1 ? "s" : ""} requiere{urgentVax.length === 1 ? "" : "n"} atención
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)" }}>
              {urgentVax.slice(0, 3).map((v) => {
                const pet = pets.find((p) => p.id === v.petId);
                const st  = vaxStatus(v.nextDue);
                return `${pet?.name}: ${v.name} · ${st.short}`;
              }).join(" — ")}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <KpiCard label="Mascotas registradas" value={pets.length}           icon="🐾" gradient={`linear-gradient(135deg,${T.brand},${T.brandMid})`}    delay="2"/>
        <KpiCard label="Clientes activos"      value={clients.length}        icon="👥" gradient="linear-gradient(135deg,#1e3a5f,#2563eb)"               delay="3"/>
        <KpiCard label="Ingresos totales"      value={fmtCLP(totalPaid)}    icon="💵" gradient={`linear-gradient(135deg,#78350f,${T.gold})`}             delay="4"/>
        <KpiCard label="Por cobrar"            value={fmtCLP(totalPending)} icon="⏳" gradient="linear-gradient(135deg,#3b0764,#7c3aed)"                delay="4"/>
      </div>

      {/* Tablas resumen */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

        {/* Próximas citas */}
        <div style={{ background:T.panel, borderRadius:18, boxShadow:T.md, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{
            padding:"18px 22px", borderBottom:`1px solid ${T.border}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background:T.panelAlt,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>✂️</span>
              <span style={{ fontSize:14, fontWeight:700, color:T.text, fontFamily:T.font }}>Próximas citas</span>
            </div>
            <span style={{
              fontSize:11, color:T.brand, fontWeight:700,
              background:T.brandLight, padding:"3px 10px", borderRadius:20,
            }}>
              {upcoming.length} pendientes
            </span>
          </div>
          <div>
            {upcoming.length === 0 && (
              <div style={{ padding:36, textAlign:"center", color:T.textMuted, fontSize:14 }}>
                Sin citas próximas
              </div>
            )}
            {upcoming.map((g) => {
              const pet    = pets.find((p) => p.id === g.petId);
              const client = users.find((u) => u.id === g.clientId);
              return (
                <div key={g.id} className="row-hover" style={{
                  padding:"13px 22px",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  borderBottom:`1px solid ${T.border}`, transition:"background 0.12s",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      width:38, height:38, borderRadius:10,
                      background:T.brandLight,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                    }}>
                      {spIcon(pet?.species)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:T.font }}>
                        {pet?.name} <span style={{ fontWeight:400, color:T.textMuted }}>· {client?.name}</span>
                      </div>
                      <div style={{ fontSize:12, color:T.textMuted, marginTop:2, fontFamily:T.font }}>
                        {g.service} · {fmtDate(g.date)} {g.time}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={g.status}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado vacunas */}
        <div style={{ background:T.panel, borderRadius:18, boxShadow:T.md, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{
            padding:"18px 22px", borderBottom:`1px solid ${T.border}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background:T.panelAlt,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>💉</span>
              <span style={{ fontSize:14, fontWeight:700, color:T.text, fontFamily:T.font }}>Estado vacunas</span>
            </div>
            <span style={{
              fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
              color: urgentVax.length > 0 ? T.amberText : T.greenText,
              background: urgentVax.length > 0 ? T.amber : T.green,
            }}>
              {urgentVax.length === 0 ? "✓ Al día" : `${urgentVax.length} alertas`}
            </span>
          </div>
          <div>
            {urgentVax.length === 0 && (
              <div style={{ padding:36, textAlign:"center", color:T.textMuted, fontSize:14 }}>
                ✅ Todas las vacunas están al día
              </div>
            )}
            {urgentVax.slice(0, 5).map((v) => {
              const pet = pets.find((p) => p.id === v.petId);
              return (
                <div key={v.id} className="row-hover" style={{
                  padding:"13px 22px",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  borderBottom:`1px solid ${T.border}`, transition:"background 0.12s",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      width:38, height:38, borderRadius:10,
                      background:T.brandLight,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                    }}>
                      {spIcon(pet?.species)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:T.font }}>{pet?.name}</div>
                      <div style={{ fontSize:12, color:T.textMuted, marginTop:2, fontFamily:T.font }}>{v.name}</div>
                    </div>
                  </div>
                  <VaxBadge nextDue={v.nextDue}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
