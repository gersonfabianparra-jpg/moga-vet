import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { loginStaff, loginClient } from "../services/auth.service.js";
import T from "../styles/tokens.js";
import Input from "../components/ui/Input.jsx";
import Btn   from "../components/ui/Btn.jsx";
import VetOSLogo from "../components/ui/VetOSLogo.jsx";

export default function LoginView({ onRegister }) {
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

      {/* Panel izquierdo */}
      <div style={{ background:"linear-gradient(160deg,#0F0F1A 0%,#1e1b4b 55%,#312e81 100%)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"48px 52px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"25%", left:"-5%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div>
          <div style={{ marginBottom:52 }}>
            <VetOSLogo size={36} white />
          </div>
          <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", fontFamily:T.font, lineHeight:1.1, marginBottom:14, letterSpacing:"-0.03em" }}>
            Gestiona tu clínica<br/>desde un solo lugar.
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)", lineHeight:1.7, maxWidth:360 }}>
            La plataforma de gestión veterinaria que crece con tu negocio.
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            ["🗓","Agenda inteligente con tiempo real"],
            ["📋","Fichas médicas y vacunas"],
            ["✂️","Módulo de peluquería"],
            ["💳","Control de pagos y facturación"],
          ].map(([ic,tx]) => (
            <div key={tx} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{ic}</div>
              <span style={{ fontSize:14, color:"rgba(255,255,255,0.45)", fontFamily:T.font }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ background:T.appBg, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div className="fade-up" style={{ width:"100%", maxWidth:400 }}>
          <h3 style={{ fontSize:24, fontWeight:800, color:T.text, fontFamily:T.font, marginBottom:4 }}>Iniciar sesión</h3>
          <p style={{ fontSize:14, color:T.textMuted, marginBottom:24 }}>
            Selecciona tu tipo de acceso
          </p>

          <div style={{ display:"flex", background:"#fff", borderRadius:12, padding:4, marginBottom:24 }}>
            {[ ["staff","👨‍⚕️ Personal clínica"],["client","🐾 Portal cliente"] ].map(([id,lbl]) => (
              <button key={id} onClick={() => { setTab(id); setErr(""); }} style={{
                flex:1, padding:"9px 0", border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
                borderRadius:10, fontFamily:T.font, transition:"all 0.2s",
                background: tab===id ? T.brand : "transparent",
                color: tab===id ? "#fff" : T.textMuted,
              }}>
                {lbl}
              </button>
            ))}
          </div>

          <div style={{ background:"#fff", borderRadius:16, padding:28, boxShadow:"0 4px 20px rgba(99,102,241,0.08)" }}>
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

          {onRegister && (
            <p style={{ textAlign:"center", fontSize:13, color:T.textMuted, marginTop:20 }}>
              ¿No tienes cuenta?{" "}
              <span onClick={onRegister} style={{ color:T.brand, fontWeight:700, cursor:"pointer" }}>
                Registra tu clínica gratis →
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
