import VetOSLogo from "../components/ui/VetOSLogo.jsx";

const F = "'Plus Jakarta Sans', system-ui, sans-serif";

const FEATURES = [
  { icon: "🗓", title: "Agenda inteligente",     desc: "Calendario semanal con barra de tiempo real. Crea, mueve y confirma citas en segundos." },
  { icon: "📋", title: "Fichas médicas",          desc: "Historial clínico completo por paciente. Diagnósticos, tratamientos y seguimiento." },
  { icon: "💉", title: "Control de vacunas",      desc: "Alertas automáticas de vacunas vencidas o próximas para cada mascota." },
  { icon: "✂️", title: "Módulo de peluquería",    desc: "Gestiona servicios de grooming con estados y agenda separada." },
  { icon: "💳", title: "Pagos y facturación",     desc: "Registra cobros y métodos de pago. Mantén el flujo de caja bajo control." },
  { icon: "🐾", title: "Portal del cliente",      desc: "Tus clientes acceden a sus mascotas, historial y citas desde cualquier dispositivo." },
];

export default function LandingView({ onLogin }) {
  return (
    <div style={{ fontFamily: F, color: "#0F172A", background: "#fff", overflowX: "hidden" }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(99,102,241,0.1)",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <VetOSLogo size={34} />
        <button onClick={onLogin} style={primaryBtn}>Iniciar sesión →</button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(160deg, #0F0F1A 0%, #1e1b4b 50%, #312e81 100%)",
        padding: "100px 40px 120px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:"20%", left:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"8%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.4)", borderRadius:100, padding:"6px 16px", marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#818CF8", display:"inline-block" }} />
            <span style={{ fontSize:13, fontWeight:600, color:"#c7d2fe", letterSpacing:"0.04em" }}>Plataforma de gestión veterinaria</span>
          </div>

          <h1 style={{ fontSize:56, fontWeight:900, color:"#fff", lineHeight:1.08, marginBottom:20, letterSpacing:"-0.03em" }}>
            El sistema operativo<br/>
            <span style={{ background:"linear-gradient(90deg,#818CF8,#a5b4fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              para tu veterinaria
            </span>
          </h1>

          <p style={{ fontSize:18, color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:44, maxWidth:520, margin:"0 auto 44px" }}>
            Gestiona pacientes, citas, vacunas, peluquería y pagos en una sola plataforma. Diseñada para clínicas que quieren crecer.
          </p>

          <button onClick={onLogin} style={{ ...primaryBtn, fontSize:16, padding:"14px 36px", borderRadius:12 }}>
            Iniciar sesión en mi clínica →
          </button>
        </div>

        {/* Mock dashboard preview */}
        <div style={{ maxWidth:900, margin:"64px auto 0", background:"rgba(255,255,255,0.05)", borderRadius:16, border:"1px solid rgba(255,255,255,0.1)", overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.4)" }}>
          <div style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"10px 16px", display:"flex", alignItems:"center", gap:6 }}>
            {["#EF4444","#F59E0B","#22C55E"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
            <div style={{ flex:1, margin:"0 12px", background:"rgba(255,255,255,0.06)", borderRadius:6, height:20, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>app.zovita.cl · Panel de gestión</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", height:280 }}>
            <div style={{ background:"#0F0F1A", padding:"16px 12px", display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{ marginBottom:12 }}><VetOSLogo size={22} white showText={false} /></div>
              {["▦ Inicio","🗓 Agenda","🐾 Mascotas","📋 Fichas","💉 Vacunas","💳 Pagos"].map((l,i) => (
                <div key={l} style={{ padding:"7px 10px", borderRadius:7, background: i===1 ? "rgba(99,102,241,0.25)" : "transparent", color: i===1 ? "#a5b4fc" : "rgba(255,255,255,0.35)", fontSize:11, fontWeight: i===1?700:400, display:"flex", alignItems:"center", gap:6 }}>{l}</div>
              ))}
            </div>
            <div style={{ background:"#F5F7FF", padding:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                {[["📅","Hoy","4 citas","#6366F1"],["🐾","Pacientes","1.196 activos","#059669"],["⏳","Pendientes","3 pagos","#F59E0B"]].map(([ic,lb,val,c]) => (
                  <div key={lb} style={{ background:"#fff", borderRadius:10, padding:"10px 12px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize:16 }}>{ic}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:c, marginTop:2 }}>{val}</div>
                    <div style={{ fontSize:10, color:"#64748B" }}>{lb}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff", borderRadius:10, padding:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#0F172A", marginBottom:8 }}>🗓 Agenda — hoy</div>
                {[["09:00","Luna · Labrador","Consulta","#E0E7FF","#6366F1"],["11:00","Rocky · Bulldog","Vacuna","#D1FAE5","#059669"],["14:30","Michi · Siamés","Peluquería","#FEF3C7","#F59E0B"]].map(([t,p,s,bg,c]) => (
                  <div key={t} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderTop:"1px solid #F1F5F9" }}>
                    <span style={{ fontSize:10, color:"#64748B", minWidth:36 }}>{t}</span>
                    <div style={{ flex:1, fontSize:10, fontWeight:600 }}>{p}</div>
                    <span style={{ fontSize:9, padding:"2px 8px", borderRadius:20, background:bg, color:c, fontWeight:700 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section style={{ padding:"80px 40px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ display:"inline-block", background:"#EEF2FF", color:"#6366F1", fontSize:12, fontWeight:700, padding:"6px 16px", borderRadius:100, marginBottom:16, letterSpacing:"0.06em", textTransform:"uppercase" }}>
            Todo lo que necesitas
          </div>
          <h2 style={{ fontSize:40, fontWeight:900, color:"#0F172A", letterSpacing:"-0.03em", lineHeight:1.1 }}>
            Una plataforma, todas las herramientas
          </h2>
          <p style={{ fontSize:16, color:"#64748B", marginTop:12, maxWidth:520, margin:"12px auto 0" }}>
            Diseñada específicamente para el flujo de trabajo de una clínica veterinaria moderna.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:24 }}>
          {FEATURES.map((f) => (
            <div key={f.title}
              style={{ background:"#fff", borderRadius:16, padding:"28px 28px", border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(99,102,241,0.06)", transition:"transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(99,102,241,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 1px 4px rgba(99,102,241,0.06)"; }}
            >
              <div style={{ width:48, height:48, borderRadius:13, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:16 }}>{f.icon}</div>
              <div style={{ fontSize:17, fontWeight:800, marginBottom:8, color:"#0F172A" }}>{f.title}</div>
              <div style={{ fontSize:14, color:"#64748B", lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA login ──────────────────────────────────────────────── */}
      <section style={{ background:"linear-gradient(135deg,#0F0F1A,#1e1b4b)", padding:"72px 40px", textAlign:"center" }}>
        <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", letterSpacing:"-0.03em", marginBottom:14 }}>
          ¿Ya tienes tu clínica en ZOVITA?
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.4)", marginBottom:32 }}>
          Accede a tu panel y empieza a gestionar hoy.
        </p>
        <button onClick={onLogin} style={{ ...primaryBtn, fontSize:16, padding:"14px 36px", borderRadius:12 }}>
          Iniciar sesión →
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ background:"#0F0F1A", padding:"24px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <VetOSLogo size={28} white />
        <span style={{ fontSize:13, color:"rgba(255,255,255,0.25)" }}>© 2026 ZOVITA · Todos los derechos reservados</span>
        <span style={{ fontSize:13, color:"rgba(255,255,255,0.2)" }}>Contacto: hola@zovita.cl</span>
      </footer>
    </div>
  );
}

const primaryBtn = {
  background: "linear-gradient(135deg,#4338CA,#6366F1)",
  color: "#fff",
  border: "none",
  padding: "11px 24px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: F,
  boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
};
