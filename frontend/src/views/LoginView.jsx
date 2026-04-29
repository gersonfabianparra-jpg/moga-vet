import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { loginStaff, loginClient } from "../services/auth.service.js";
import T from "../styles/tokens.js";
import Input    from "../components/ui/Input.jsx";
import Btn      from "../components/ui/Btn.jsx";
import VetOSLogo from "../components/ui/VetOSLogo.jsx";
import ECGLine   from "../components/ui/ECGLine.jsx";

export default function LoginView() {
  const { login } = useApp();
  const [tab, setTab]       = useState("staff");
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [rut, setRut]       = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const doStaff = async () => {
    setErr(""); setLoading(true);
    try {
      const { token, user } = await loginStaff(email, pw);
      login(user, token);
    } catch (e) {
      setErr(e.response?.data?.message || "Credenciales incorrectas.");
    } finally { setLoading(false); }
  };

  const doClient = async () => {
    setErr(""); setLoading(true);
    try {
      const { token, user } = await loginClient(rut.trim());
      login(user, token);
    } catch (e) {
      setErr(e.response?.data?.message || "Sin resultados para ese RUT o correo.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", fontFamily:T.font }}>

      {/* ── Panel izquierdo — identidad ZOVITA ──────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg,#0F0F1A 0%,#1a1740 50%,#2d2a7a 100%)",
        display: "flex", flexDirection: "column",
        padding: "48px 52px", position: "relative", overflow: "hidden",
      }}>
        {/* Orbes de fondo */}
        <div style={{ position:"absolute", top:"15%", left:"-10%", width:450, height:450, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"5%", right:"-5%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 65%)", pointerEvents:"none" }} />

        {/* Logo hero — protagonista */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"flex-start" }}>
          {/* Ícono grande */}
          <div style={{
            marginBottom: 24,
            filter: "drop-shadow(0 0 32px rgba(99,102,241,0.5))",
          }}>
            <VetOSLogo size={88} white hero />
          </div>

          {/* Nombre */}
          <div style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 48, fontWeight: 900, color: "#fff",
              letterSpacing: "-0.04em", lineHeight: 1, fontFamily: T.font,
            }}>
              Zo<span style={{ color: "#818CF8" }}>VITA</span>
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 6,
            }}>
              Platform
            </div>
          </div>

          {/* ECG decorativa */}
          <div style={{ width:"100%", maxWidth:320, marginBottom:28, marginTop:12 }}>
            <ECGLine color="rgba(129,140,248,0.5)" height={28} strokeWidth={2} />
          </div>

          <p style={{ fontSize:16, color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:340, marginBottom:36 }}>
            La plataforma que cuida lo que más importa. Gestión completa de pacientes, citas y más.
          </p>

          {/* Features pill badges */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {["🗓 Agenda","🐾 Mascotas","💉 Vacunas","💳 Pagos","✂️ Peluquería"].map((f) => (
              <span key={f} style={{
                fontSize:12, fontWeight:600,
                color:"rgba(255,255,255,0.55)",
                background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:100, padding:"5px 12px",
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* ECG footer */}
        <div style={{ marginTop:32, opacity:0.35 }}>
          <ECGLine color="rgba(129,140,248,0.8)" height={20} strokeWidth={1.5} />
        </div>
      </div>

      {/* ── Panel derecho — formulario ───────────────────────────────── */}
      <div style={{ background:T.appBg, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div className="fade-up" style={{ width:"100%", maxWidth:400 }}>

          <h3 style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:4 }}>
            Iniciar sesión
          </h3>
          <p style={{ fontSize:14, color:T.textMuted, marginBottom:24 }}>
            Selecciona tu tipo de acceso
          </p>

          <div style={{ display:"flex", background:"#fff", borderRadius:12, padding:4, marginBottom:24, boxShadow:T.sm }}>
            {[["staff","👨‍⚕️ Personal clínica"],["client","🐾 Portal cliente"]].map(([id,lbl]) => (
              <button key={id} onClick={() => { setTab(id); setErr(""); }} style={{
                flex:1, padding:"9px 0", border:"none", cursor:"pointer",
                fontSize:13, fontWeight:600, borderRadius:10, fontFamily:T.font,
                transition:"all 0.2s",
                background: tab===id ? T.brand : "transparent",
                color: tab===id ? "#fff" : T.textMuted,
                boxShadow: tab===id ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
              }}>
                {lbl}
              </button>
            ))}
          </div>

          <div style={{ background:"#fff", borderRadius:16, padding:28, boxShadow:"0 4px 24px rgba(99,102,241,0.1)" }}>
            {tab === "staff" ? (
              <>
                <Input label="Correo o usuario" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@tuclinica.cl"/>
                <Input label="Contraseña" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••"/>
                {err && <div style={{ color:T.redText, fontSize:13, marginBottom:14, padding:"10px 14px", background:T.red, borderRadius:8 }}>{err}</div>}
                <Btn style={{ width:"100%", justifyContent:"center" }} onClick={doStaff} disabled={loading}>
                  {loading ? "Cargando..." : "Iniciar sesión →"}
                </Btn>
              </>
            ) : (
              <>
                <p style={{ fontSize:14, color:T.textMuted, marginBottom:16, lineHeight:1.6 }}>
                  Ingresa tu RUT o correo para ver el historial de tus mascotas.
                </p>
                <Input label="RUT o correo" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9"/>
                {err && <div style={{ color:T.redText, fontSize:13, marginBottom:14, padding:"10px 14px", background:T.red, borderRadius:8 }}>{err}</div>}
                <Btn style={{ width:"100%", justifyContent:"center" }} onClick={doClient} disabled={loading}>
                  {loading ? "Buscando..." : "Buscar mis mascotas →"}
                </Btn>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
