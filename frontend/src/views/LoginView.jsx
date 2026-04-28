import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { loginStaff, loginClient } from "../services/auth.service.js";
import T from "../styles/tokens.js";
import Input from "../components/ui/Input.jsx";
import Btn  from "../components/ui/Btn.jsx";

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
      {/* Panel izquierdo */}
      <div style={{ background:"linear-gradient(160deg,#061008 0%,#0d2e1a 50%,#1a4731 100%)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"48px 52px", position:"relative", overflow:"hidden" }}>
        <div>
          <div style={{ marginBottom:60 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:"10px 16px", display:"inline-block" }}>
              <img src="/logo.png" alt="MOGA" style={{ width:140, display:"block" }}/>
            </div>
          </div>
          <h2 style={{ fontSize:38, fontWeight:900, color:"#fff", fontFamily:T.fontDisplay, lineHeight:1.1, marginBottom:16 }}>
            La clínica de tus mascotas,<br/>en un solo lugar.
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.7, maxWidth:380 }}>
            Gestión integral de fichas médicas, vacunas, peluquería y más.
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[ ["📋","Fichas médicas completas"],["💉","Alertas de vacunación"],["✂️","Agenda de peluquería"],["💳","Historial de pagos"] ].map(([ic,tx]) => (
            <div key={tx} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{ic}</div>
              <span style={{ fontSize:14, color:"rgba(255,255,255,0.6)", fontFamily:T.font }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ background:T.appBg, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div className="fade-up" style={{ width:"100%", maxWidth:400 }}>
          <h3 style={{ fontSize:24, fontWeight:800, color:T.text, fontFamily:T.font, marginBottom:6 }}>Iniciar sesión</h3>
          <p style={{ fontSize:14, color:T.textMuted, marginBottom:8 }}>Selecciona tu tipo de acceso</p>

          <div style={{ display:"flex", background:"#fff", borderRadius:12, padding:4, marginBottom:28 }}>
            {[ ["staff","👨‍⚕️ Personal MOGA"],["client","🐾 Mis mascotas"] ].map(([id,lbl]) => (
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

          <div style={{ background:"#fff", borderRadius:16, padding:28, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
            {tab === "staff" ? (
              <>
                <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@moga.cl"/>
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
