import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { fmtCLP, fmtDate, spIcon, vaxStatus } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import KpiCard    from "../../components/layout/KpiCard.jsx";
import StatusBadge from "../../components/ui/badges/StatusBadge.jsx";
import VaxBadge   from "../../components/ui/badges/VaxBadge.jsx";

export default function OverviewView() {
  const { pets, records, grooming, users, payments, vaccines } = useApp();
  const clients  = users.filter((u) => u.role === "client");
  const today    = new Date().toISOString().slice(0, 10);
  const upcoming = [...grooming]
    .filter((g) => g.date >= today && g.status !== "cancelada")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const totalPaid    = payments.filter((p) => p.status === "pagado").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pendiente").reduce((s, p) => s + p.amount, 0);
  const urgentVax    = vaccines.filter((v) => vaxStatus(v.nextDue).key !== "green");

  return (
    <div style={{ padding:"0 36px 36px" }}>
      <PageTitle icon="⬡" title="Panel principal" sub={`${fmtDate(today)} — Bienvenido a MOGA`}/>

      {urgentVax.length > 0 && (
        <div style={{ background:"linear-gradient(135deg,#7c2d12,#9a3412)", borderRadius:14, padding:"14px 20px", marginBottom:20, display:"flex", gap:14, alignItems:"center", boxShadow:"0 4px 16px rgba(154,52,18,0.3)" }}>
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

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        <KpiCard label="Mascotas registradas" value={pets.length}           icon="🐾" gradient={`linear-gradient(135deg,${T.brand},${T.brandMid})`} delay="2"/>
        <KpiCard label="Clientes activos"      value={clients.length}        icon="👥" gradient="linear-gradient(135deg,#1e3a5f,#2563eb)"           delay="3"/>
        <KpiCard label="Ingresos totales"      value={fmtCLP(totalPaid)}    icon="💵" gradient={`linear-gradient(135deg,#78350f,${T.gold})`}         delay="4"/>
        <KpiCard label="Por cobrar"            value={fmtCLP(totalPending)} icon="⏳" gradient="linear-gradient(135deg,#3b0764,#7c3aed)"            delay="4"/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {/* Próximas citas */}
        <div style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{ padding:"18px 22px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:T.text, fontFamily:T.font }}>✂️ Próximas citas</div>
            <span style={{ fontSize:12, color:T.textMuted }}>{upcoming.length} pendientes</span>
          </div>
          <div style={{ padding:"8px 0" }}>
            {upcoming.length === 0 && <div style={{ padding:24, textAlign:"center", color:T.textMuted, fontSize:14 }}>Sin citas próximas</div>}
            {upcoming.map((g) => {
              const pet    = pets.find((p) => p.id === g.petId);
              const client = users.find((u) => u.id === g.clientId);
              return (
                <div key={g.id} style={{ padding:"12px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:T.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{spIcon(pet?.species)}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{pet?.name} <span style={{ fontWeight:400, color:T.textMuted }}>· {client?.name}</span></div>
                      <div style={{ fontSize:12, color:T.textMuted, marginTop:1 }}>{g.service} · {fmtDate(g.date)} {g.time}</div>
                    </div>
                  </div>
                  <StatusBadge status={g.status}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado vacunas */}
        <div style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{ padding:"18px 22px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:T.text }}>💉 Estado vacunas</div>
            <span style={{ fontSize:12, color:urgentVax.length > 0 ? T.amberText : T.greenText, fontWeight:600 }}>
              {urgentVax.length === 0 ? "✓ Todas al día" : `${urgentVax.length} alertas`}
            </span>
          </div>
          <div style={{ padding:"8px 0" }}>
            {urgentVax.length === 0 && <div style={{ padding:24, textAlign:"center", color:T.textMuted, fontSize:14 }}>✅ Todas las vacunas están al día</div>}
            {urgentVax.slice(0, 5).map((v) => {
              const pet = pets.find((p) => p.id === v.petId);
              return (
                <div key={v.id} style={{ padding:"11px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:T.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{spIcon(pet?.species)}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700 }}>{pet?.name}</div>
                      <div style={{ fontSize:12, color:T.textMuted }}>{v.name}</div>
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
