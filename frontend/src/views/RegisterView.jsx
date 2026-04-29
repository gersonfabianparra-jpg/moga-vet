import { useState } from "react";
import VetOSLogo from "../components/ui/VetOSLogo.jsx";
import ECGLine   from "../components/ui/ECGLine.jsx";
import T from "../styles/tokens.js";
import Input  from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Btn    from "../components/ui/Btn.jsx";
import { registerClinic } from "../services/auth.service.js";

const PLANS = ["Starter (Gratis)", "Clínica ($29.990/mes)", "Enterprise (A medida)"];

const emptyForm = {
  clinicName: "", ownerName: "", email: "", password: "", confirmPw: "",
  phone: "", city: "", plan: PLANS[0],
};

export default function RegisterView({ onLogin }) {
  const [step, setStep]     = useState(1); // 1 = datos clínica, 2 = datos acceso, 3 = éxito
  const [form, setForm]     = useState(emptyForm);
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const nextStep = () => {
    setErr("");
    if (step === 1) {
      if (!form.clinicName.trim() || !form.ownerName.trim()) return setErr("Completa el nombre de la clínica y el responsable.");
      setStep(2);
    } else if (step === 2) {
      if (!form.email.trim() || !form.password) return setErr("Correo y contraseña son obligatorios.");
      if (form.password.length < 6) return setErr("La contraseña debe tener al menos 6 caracteres.");
      if (form.password !== form.confirmPw) return setErr("Las contraseñas no coinciden.");
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registerClinic({
        clinicName: form.clinicName,
        ownerName:  form.ownerName,
        email:      form.email,
        password:   form.password,
        phone:      form.phone,
        city:       form.city,
        plan:       form.plan,
      });
      setStep(3);
    } catch (e) {
      setErr(e.response?.data?.message || "Error al crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", fontFamily:T.font }}>

      {/* Panel izquierdo — brand */}
      <div style={{ background:"linear-gradient(160deg,#0F0F1A 0%,#1e1b4b 55%,#312e81 100%)", display:"flex", flexDirection:"column", padding:"48px 52px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"30%", left:"-5%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Logo hero */}
        <div style={{ marginBottom:20, filter:"drop-shadow(0 0 24px rgba(99,102,241,0.45))" }}>
          <VetOSLogo size={72} white hero />
        </div>
        <div style={{ marginBottom:6 }}>
          <div style={{ fontSize:36, fontWeight:900, color:"#fff", letterSpacing:"-0.04em", lineHeight:1 }}>
            Zo<span style={{ color:"#818CF8" }}>VITA</span>
          </div>
          <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", letterSpacing:"0.2em", textTransform:"uppercase", marginTop:4 }}>Platform</div>
        </div>
        <div style={{ width:"100%", maxWidth:300, marginBottom:28, marginTop:10 }}>
          <ECGLine color="rgba(129,140,248,0.45)" height={22} strokeWidth={1.8} />
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", lineHeight:1.12, marginBottom:16, letterSpacing:"-0.03em" }}>
            Tu clínica,<br/>en marcha en minutos.
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:360, marginBottom:40 }}>
            Crea tu cuenta, configura tu equipo y empieza a gestionar pacientes hoy mismo.
          </p>

          {/* Pasos visuales */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { n:1, label:"Datos de tu clínica" },
              { n:2, label:"Acceso y contraseña" },
              { n:3, label:"¡Listo para comenzar!" },
            ].map((s) => (
              <div key={s.n} style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background: step >= s.n ? "linear-gradient(135deg,#6366F1,#818CF8)" : "rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0, transition:"background 0.3s" }}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span style={{ fontSize:14, fontWeight: step===s.n?700:400, color: step>=s.n?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.3)", transition:"color 0.3s" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:"auto", paddingTop:24, opacity:0.3 }}>
          <ECGLine color="rgba(129,140,248,0.8)" height={18} strokeWidth={1.3} />
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:12 }}>
          ¿Ya tienes cuenta?{" "}
          <span onClick={onLogin} style={{ color:"rgba(255,255,255,0.6)", cursor:"pointer", fontWeight:700, textDecoration:"underline" }}>
            Inicia sesión
          </span>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{ background:T.appBg, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div className="fade-up" style={{ width:"100%", maxWidth:440 }}>

          {step === 3 ? (
            /* ── Éxito ── */
            <div style={{ textAlign:"center" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#6366F1,#818CF8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 24px", boxShadow:"0 12px 36px rgba(99,102,241,0.4)" }}>✓</div>
              <h3 style={{ fontSize:26, fontWeight:900, color:T.text, marginBottom:10 }}>¡Clínica registrada!</h3>
              <p style={{ fontSize:15, color:T.textMuted, lineHeight:1.6, marginBottom:8 }}>
                <strong>{form.clinicName}</strong> ya está en ZOVITA.
              </p>
              <p style={{ fontSize:14, color:T.textMuted, marginBottom:32, lineHeight:1.6 }}>
                Recibirás un correo de bienvenida en <strong>{form.email}</strong> con los siguientes pasos.
              </p>
              <Btn style={{ width:"100%", justifyContent:"center" }} onClick={onLogin}>
                Ir al inicio de sesión →
              </Btn>
            </div>

          ) : (
            <>
              <div style={{ marginBottom:28 }}>
                <h3 style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:4 }}>
                  {step === 1 ? "Cuéntanos sobre tu clínica" : "Crea tu acceso"}
                </h3>
                <p style={{ fontSize:14, color:T.textMuted }}>
                  Paso {step} de 2 — {step === 1 ? "Datos del negocio" : "Email y contraseña para entrar"}
                </p>
              </div>

              {/* Barra de progreso */}
              <div style={{ height:4, background:"#E2E8F0", borderRadius:4, marginBottom:28, overflow:"hidden" }}>
                <div style={{ height:"100%", width: step===1?"50%":"100%", background:"linear-gradient(90deg,#4338CA,#6366F1)", borderRadius:4, transition:"width 0.4s ease" }} />
              </div>

              <div style={{ background:"#fff", borderRadius:16, padding:28, boxShadow:"0 4px 20px rgba(99,102,241,0.08)" }}>
                {step === 1 && (
                  <>
                    <Input label="Nombre de la clínica *" value={form.clinicName} onChange={set("clinicName")} placeholder="Ej: Veterinaria El Bosque" />
                    <Input label="Nombre del responsable *" value={form.ownerName} onChange={set("ownerName")} placeholder="Ej: Dra. Carmen López" />
                    <Input label="Teléfono" value={form.phone} onChange={set("phone")} placeholder="+56 9 1234 5678" />
                    <Input label="Ciudad" value={form.city} onChange={set("city")} placeholder="Santiago, Valparaíso..." />
                    <Select label="Plan" value={form.plan} onChange={set("plan")}>
                      {PLANS.map((p) => <option key={p}>{p}</option>)}
                    </Select>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div style={{ background:"#EEF2FF", borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:13, color:"#4338CA" }}>
                      <strong>{form.clinicName}</strong> — {form.plan}
                    </div>
                    <Input label="Correo electrónico *" type="email" value={form.email} onChange={set("email")} placeholder="admin@tuclinica.cl" />
                    <Input label="Contraseña *" type="password" value={form.password} onChange={set("password")} placeholder="Mínimo 6 caracteres" />
                    <Input label="Confirmar contraseña *" type="password" value={form.confirmPw} onChange={set("confirmPw")} placeholder="Repite la contraseña" />
                  </>
                )}

                {err && (
                  <div style={{ color:T.redText, fontSize:13, marginBottom:14, padding:"10px 14px", background:T.red, borderRadius:8 }}>
                    {err}
                  </div>
                )}

                <div style={{ display:"flex", gap:10, justifyContent:"space-between", marginTop:8 }}>
                  {step === 2 && (
                    <Btn v="ghost" onClick={() => { setErr(""); setStep(1); }}>← Atrás</Btn>
                  )}
                  <Btn style={{ flex:1, justifyContent:"center" }} onClick={nextStep} disabled={loading}>
                    {loading ? "Creando cuenta…" : step === 1 ? "Continuar →" : "Crear mi clínica →"}
                  </Btn>
                </div>
              </div>

              <p style={{ textAlign:"center", fontSize:12, color:T.textMuted, marginTop:16 }}>
                Al registrarte aceptas nuestros{" "}
                <span style={{ color:T.brand, cursor:"pointer" }}>Términos de uso</span>{" "}y{" "}
                <span style={{ color:T.brand, cursor:"pointer" }}>Política de privacidad</span>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
