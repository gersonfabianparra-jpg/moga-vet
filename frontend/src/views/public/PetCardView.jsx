import { useEffect, useState } from "react";
import { vaxStatus, spIcon } from "../../styles/helpers.js";

const API = import.meta.env.VITE_API_URL || "/api";

function fmtDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${+day} ${months[+m - 1]} ${y}`;
}

export default function PetCardView({ petId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`${API}/public/pet-card/${petId}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(() => setError("No se pudo cargar la información de esta mascota."))
      .finally(() => setLoading(false));
  }, [petId]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0F172A", color:"#fff", fontFamily:"system-ui, sans-serif", fontSize:16 }}>
      Cargando cartola…
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0F172A", color:"#EF4444", fontFamily:"system-ui, sans-serif", fontSize:15 }}>
      {error || "Mascota no encontrada."}
    </div>
  );

  const { pet, owner, vaccines, settings } = data;
  const vaxOk  = vaccines.filter((v) => vaxStatus(v.nextDue).key !== "red").length;
  const vaxBad = vaccines.filter((v) => vaxStatus(v.nextDue).key === "red").length;

  return (
    <div style={{ minHeight:"100vh", background:"#0F172A", fontFamily:"system-ui, -apple-system, sans-serif", padding:"0 0 40px" }}>

      {/* Header clínica */}
      <div style={{ background:"linear-gradient(135deg,#4F46E5,#6366F1)", padding:"20px 24px", display:"flex", alignItems:"center", gap:14 }}>
        {settings?.logoBase64 && (
          <img src={settings.logoBase64} alt="logo" style={{ width:44, height:44, objectFit:"contain", borderRadius:10, background:"#fff", padding:2 }}/>
        )}
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{settings?.clinicName || "Clínica Veterinaria"}</div>
          {settings?.phone && <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>{settings.phone}</div>}
        </div>
        <div style={{ marginLeft:"auto", fontSize:11, color:"rgba(255,255,255,0.5)", textAlign:"right" }}>
          Cartola Sanitaria<br/>Digital
        </div>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"0 16px" }}>

        {/* Perfil mascota */}
        <div style={{ background:"#1E293B", borderRadius:16, padding:"20px", margin:"20px 0 16px", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:16, background:"linear-gradient(135deg,#4F46E5,#818CF8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 }}>
              {spIcon(pet.species)}
            </div>
            <div>
              <div style={{ fontSize:24, fontWeight:900, color:"#fff", letterSpacing:"-0.03em" }}>{pet.name}</div>
              <div style={{ fontSize:13, color:"#94A3B8", marginTop:2 }}>{pet.species} · {pet.breed || "Raza no especificada"}</div>
              {owner && <div style={{ fontSize:12, color:"#64748B", marginTop:4 }}>Propietario/a: {owner.name}</div>}
            </div>
          </div>
          {/* Ficha rápida */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:16 }}>
            {[
              { label:"Edad",  value: pet.age ? `${pet.age} año(s)` : "—" },
              { label:"Peso",  value: pet.weight ? `${pet.weight} kg` : "—" },
              { label:"Sexo",  value: pet.gender || "—" },
            ].map((d) => (
              <div key={d.label} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.06em" }}>{d.label}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginTop:4 }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado vacunación resumen */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          <div style={{ background:"#14532D22", border:"1px solid #22c55e44", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:900, color:"#22C55E" }}>{vaxOk}</div>
            <div style={{ fontSize:12, color:"#86EFAC" }}>Vacunas al día</div>
          </div>
          <div style={{ background: vaxBad > 0 ? "#7F1D1D22" : "#1E293B", border:`1px solid ${vaxBad > 0 ? "#ef444444" : "rgba(255,255,255,0.06)"}`, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:900, color: vaxBad > 0 ? "#EF4444" : "#64748B" }}>{vaxBad}</div>
            <div style={{ fontSize:12, color: vaxBad > 0 ? "#FCA5A5" : "#64748B" }}>Vacunas vencidas</div>
          </div>
        </div>

        {/* Tabla de vacunas */}
        <div style={{ background:"#1E293B", borderRadius:16, border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>💉 Historial de vacunas</div>
          </div>
          {vaccines.length === 0 ? (
            <div style={{ padding:"24px", textAlign:"center", fontSize:13, color:"#64748B" }}>Sin vacunas registradas.</div>
          ) : vaccines.map((v, i) => {
            const st = vaxStatus(v.nextDue);
            const colors = { green:"#22C55E", yellow:"#F59E0B", red:"#EF4444" };
            const color  = colors[st.key] || "#64748B";
            return (
              <div key={v.id} style={{ padding:"12px 18px", borderBottom: i < vaccines.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{v.name}</div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>Aplicada: {fmtDate(v.dateApplied)} · Lote: {v.lot || "—"}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"#64748B" }}>Próxima dosis</div>
                  <div style={{ fontSize:13, fontWeight:700, color }}>{fmtDate(v.nextDue)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de página */}
        <div style={{ marginTop:20, textAlign:"center", fontSize:11, color:"#334155" }}>
          Documento generado por {settings?.clinicName || "la clínica"} · Powered by ZoVITA
        </div>
      </div>
    </div>
  );
}
