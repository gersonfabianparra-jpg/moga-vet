import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import T from "../../styles/tokens.js";
import PageTitle from "../../components/layout/PageTitle.jsx";
import Btn   from "../../components/ui/Btn.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";

function compressLogo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 400;
        const scale = img.width > MAX ? MAX / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png", 0.9));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

const DURATIONS = [
  { label: "15 minutos", value: 15 },
  { label: "20 minutos", value: 20 },
  { label: "30 minutos", value: 30 },
  { label: "45 minutos", value: 45 },
  { label: "60 minutos", value: 60 },
  { label: "90 minutos", value: 90 },
];

const EMPTY_FORM = {
  clinicName:          "",
  rutClinica:          "",
  slogan:              "",
  address:             "",
  phone:               "",
  email:               "",
  website:             "",
  instagram:           "",
  facebook:            "",
  openTime:            "09:00",
  closeTime:           "18:00",
  appointmentDuration: 30,
  logoBase64:          "",
};

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize:13, fontWeight:700, color:T.brand, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:18 }}>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: T.panel, borderRadius: 18, boxShadow: T.md,
      border: `1px solid ${T.border}`, padding: "26px 26px 22px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function SettingsView() {
  const { settings, updateSettings, currentUser } = useApp();
  const { isMobile } = useBreakpoint();
  const tenantId = currentUser?.tenantId || "";
  const bookingUrl = tenantId
    ? `${window.location.origin}${window.location.pathname}#/reservar/${tenantId}`
    : "";

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (settings) {
      setForm({
        clinicName:          settings.clinicName          || "",
        rutClinica:          settings.rutClinica          || "",
        slogan:              settings.slogan              || "",
        address:             settings.address             || "",
        phone:               settings.phone               || "",
        email:               settings.email               || "",
        website:             settings.website             || "",
        instagram:           settings.instagram           || "",
        facebook:            settings.facebook            || "",
        openTime:            settings.openTime            || "09:00",
        closeTime:           settings.closeTime           || "18:00",
        appointmentDuration: settings.appointmentDuration || 30,
        logoBase64:          settings.logoBase64          || "",
      });
    }
  }, [settings]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const [busy,    setBusy]    = useState(false);
  const [ok,      setOk]      = useState(false);
  const [err,     setErr]     = useState("");
  const [logoErr, setLogoErr] = useState("");
  const fileRef = useRef();

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setLogoErr("Solo se admiten imágenes."); return; }
    setLogoErr("");
    try {
      const b64 = await compressLogo(file);
      setForm((f) => ({ ...f, logoBase64: b64 }));
    } catch { setLogoErr("No se pudo procesar la imagen."); }
  };

  const save = async () => {
    if (!form.clinicName.trim()) { setErr("El nombre de la clínica es obligatorio."); return; }
    setBusy(true); setErr(""); setOk(false);
    try {
      await updateSettings(form);
      setOk(true);
      setTimeout(() => setOk(false), 3000);
    } catch { setErr("No se pudo guardar. Intenta de nuevo."); }
    finally { setBusy(false); }
  };

  const col2 = { display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:"0 18px" };

  return (
    <div style={{ padding: isMobile ? "0 14px 36px" : "0 36px 48px", maxWidth: 960 }}>
      <PageTitle icon="⚙️" title="Configuración" sub="Datos de la clínica e identidad visual" />

      {/* ── Fila 1: info básica + logo ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:24, marginBottom:24 }}>

        {/* Información básica */}
        <Card>
          <SectionTitle>Información de la clínica</SectionTitle>
          <Input label="Nombre de la clínica *"
            value={form.clinicName} onChange={set("clinicName")}
            placeholder="Clínica Veterinaria ZOVITA" />
          <Input label="RUT de la clínica"
            value={form.rutClinica} onChange={set("rutClinica")}
            placeholder="76.543.210-K" />
          <Input label="Slogan / descripción corta"
            value={form.slogan} onChange={set("slogan")}
            placeholder="Cuidamos a tu mejor amigo" />
          <Input label="Dirección"
            value={form.address} onChange={set("address")}
            placeholder="Av. Ejemplo 1234, Santiago" />
          <div style={col2}>
            <Input label="Teléfono"
              value={form.phone} onChange={set("phone")}
              placeholder="+56 9 1234 5678" />
            <Input label="Correo electrónico" type="email"
              value={form.email} onChange={set("email")}
              placeholder="contacto@miveterinaria.cl" />
          </div>

          {err && <div style={{ fontSize:13, color:T.redText, marginBottom:10 }}>⚠ {err}</div>}
          {ok  && <div style={{ fontSize:13, color:T.vet,     marginBottom:10 }}>✓ Configuración guardada</div>}

          <Btn v="accent" onClick={save} disabled={busy} style={{ width:"100%", marginTop:4 }}>
            {busy ? "Guardando…" : "Guardar cambios"}
          </Btn>
        </Card>

        {/* Logo */}
        <Card>
          <SectionTitle>Logo de la clínica</SectionTitle>
          <div style={{ fontSize:12.5, color:T.textMuted, lineHeight:1.6, marginBottom:16 }}>
            El logo aparece en todos los informes PDF. Usa PNG con fondo blanco o transparente (recomendado 400×400 px).
          </div>
          <div style={{
            width:"100%", height:130, borderRadius:12, background:T.appBg,
            border:`2px dashed ${T.border}`, display:"flex", alignItems:"center",
            justifyContent:"center", marginBottom:14, overflow:"hidden",
          }}>
            {form.logoBase64 ? (
              <img src={form.logoBase64} alt="Logo" style={{ maxHeight:120, maxWidth:"90%", objectFit:"contain" }} />
            ) : (
              <div style={{ textAlign:"center", color:T.textMuted }}>
                <div style={{ fontSize:30, marginBottom:6 }}>🏥</div>
                <div style={{ fontSize:13 }}>Sin logo cargado</div>
              </div>
            )}
          </div>
          {logoErr && <div style={{ fontSize:12.5, color:T.redText, marginBottom:10 }}>⚠ {logoErr}</div>}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display:"none" }} />
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <Btn v="ghost" onClick={() => fileRef.current?.click()} style={{ flex:1 }}>📁 Subir logo</Btn>
            {form.logoBase64 && (
              <Btn v="sm_red" onClick={() => setForm((f) => ({ ...f, logoBase64:"" }))}>✕ Eliminar</Btn>
            )}
          </div>
          <div style={{ padding:"10px 14px", background:T.brandXLight, borderRadius:10, fontSize:12, color:T.brand, lineHeight:1.5 }}>
            <strong>Tip:</strong> Imagen cuadrada PNG con fondo blanco = mejor resultado en PDF.
          </div>
        </Card>
      </div>

      {/* ── Fila 2: presencia digital + horarios ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:24, marginBottom:24 }}>

        {/* Presencia digital */}
        <Card>
          <SectionTitle>Presencia digital</SectionTitle>
          <Input label="Sitio web"
            value={form.website} onChange={set("website")}
            placeholder="https://www.miveterinaria.cl" />
          <div style={col2}>
            <Input label="Instagram"
              value={form.instagram} onChange={set("instagram")}
              placeholder="@miveterinaria" />
            <Input label="Facebook"
              value={form.facebook} onChange={set("facebook")}
              placeholder="fb.com/miveterinaria" />
          </div>
          <div style={{ marginTop:8, padding:"10px 14px", background:T.brandXLight, borderRadius:10, fontSize:12, color:T.brand, lineHeight:1.5 }}>
            Estos datos aparecerán en el pie de página de los informes PDF generados.
          </div>
        </Card>

        {/* Horario y citas */}
        <Card>
          <SectionTitle>Horario y citas</SectionTitle>
          <div style={col2}>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Apertura</div>
              <select value={form.openTime} onChange={set("openTime")} className="moga-input"
                style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font }}>
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Cierre</div>
              <select value={form.closeTime} onChange={set("closeTime")} className="moga-input"
                style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font }}>
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:T.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Duración por defecto de cita</div>
            <select value={form.appointmentDuration} onChange={(e) => setForm((f) => ({ ...f, appointmentDuration: +e.target.value }))}
              className="moga-input"
              style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font }}>
              {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div style={{ padding:"10px 14px", background:T.brandXLight, borderRadius:10, fontSize:12, color:T.brand, lineHeight:1.5 }}>
            El horario y duración controlan las franjas disponibles en la agenda pública de reservas online.
          </div>
        </Card>
      </div>

      {/* ── Vista previa encabezado PDF ── */}
      <Card style={{ marginBottom:24 }}>
        <SectionTitle>Vista previa del encabezado PDF</SectionTitle>
        <div style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${T.border}` }}>
          <div style={{
            background:"linear-gradient(90deg,#6366F1,#4338CA)",
            padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:17, fontFamily:T.font }}>
                {form.clinicName || "ZOVITA"}
              </div>
              {form.slogan && (
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:1, fontStyle:"italic" }}>
                  {form.slogan}
                </div>
              )}
              <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11, marginTop:2 }}>
                {form.address || "Plataforma de gestión veterinaria"}
              </div>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:10, marginTop:2 }}>
                {[form.phone, form.email, form.website].filter(Boolean).join("  ·  ") || "Sin datos de contacto"}
              </div>
            </div>
            {form.logoBase64 && (
              <img src={form.logoBase64} alt="Logo preview" style={{ height:46, width:46, objectFit:"contain", borderRadius:8 }} />
            )}
          </div>
        </div>
      </Card>

      {/* ── Enlace de reservas online ── */}
      {bookingUrl && (
        <Card>
          <SectionTitle>Enlace de reservas online</SectionTitle>
          <div style={{ fontSize:13, color:T.textMuted, marginBottom:16, lineHeight:1.6 }}>
            Comparte este enlace con tus clientes para que puedan agendar citas sin iniciar sesión. Solo ven horarios disponibles u ocupados.
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{
              flex:1, minWidth:200, padding:"10px 14px", background:T.appBg,
              border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:13,
              color:T.brand, fontFamily:"monospace", wordBreak:"break-all",
            }}>
              {bookingUrl}
            </div>
            <Btn v="ghost" onClick={() => { navigator.clipboard?.writeText(bookingUrl); alert("Enlace copiado al portapapeles."); }}>
              📋 Copiar enlace
            </Btn>
            <Btn v="accent" onClick={() => window.open(bookingUrl, "_blank")}>
              🔗 Abrir
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
