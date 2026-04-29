import { useState, useEffect } from "react";
import { getClinicInfo, getSlots, createBooking } from "../../services/publicBooking.service.js";
import { validateRut, formatRut } from "../../utils/rut.js";
import VetOSLogo from "../../components/ui/VetOSLogo.jsx";
import T from "../../styles/tokens.js";

const TYPES = [
  { value:"consulta",   label:"🩺 Consulta médica" },
  { value:"control",    label:"📋 Control / seguimiento" },
  { value:"vacuna",     label:"💉 Vacunación" },
  { value:"peluqueria", label:"✂️ Peluquería" },
  { value:"otro",       label:"📌 Otro" },
];

const SPECIES = ["Perro","Gato","Conejo","Ave","Otro"];

const EMPTY_FORM = {
  clientName:"", clientEmail:"", clientPhone:"", clientRut:"",
  petName:"", petSpecies:"Perro",
  date:"", time:"", type:"consulta", notes:"",
};

function SlotGrid({ slots, selected, onSelect }) {
  if (!slots) return <div style={{ textAlign:"center", padding:24, color:"#94a3b8" }}>Cargando horarios…</div>;
  if (slots.length === 0) return null;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))", gap:8 }}>
      {slots.map(({ time, available }) => (
        <button
          key={time}
          disabled={!available}
          onClick={() => available && onSelect(time)}
          style={{
            padding:"10px 0", borderRadius:10, fontSize:13, fontWeight:700,
            fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
            cursor: available ? "pointer" : "not-allowed",
            border: selected === time ? "2px solid #6366F1" : "1.5px solid #E2E8F0",
            background: !available
              ? "#F1F5F9"
              : selected === time
                ? "#EEF2FF"
                : "#fff",
            color: !available
              ? "#CBD5E1"
              : selected === time
                ? "#4338CA"
                : "#334155",
            transition:"all 0.15s",
            position:"relative",
          }}
        >
          {time}
          {!available && (
            <span style={{
              position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
              fontSize:9, color:"#94a3b8", fontWeight:500, letterSpacing:"0.04em",
            }}>OCUPADO</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function PublicBookView({ tenantId }) {
  const [clinic,    setClinic]    = useState(null);
  const [clinicErr, setClinicErr] = useState("");
  const [slots,     setSlots]     = useState(null);
  const [slotsDate, setSlotsDate] = useState("");
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [rutErr,    setRutErr]    = useState("");
  const [step,      setStep]      = useState(1); // 1=fecha/hora, 2=datos cliente, 3=confirmado
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState("");

  useEffect(() => {
    if (!tenantId) { setClinicErr("Enlace de reserva inválido."); return; }
    getClinicInfo(tenantId)
      .then(setClinic)
      .catch(() => setClinicErr("No se encontró la clínica. Verifica el enlace."));
  }, [tenantId]);

  useEffect(() => {
    if (!form.date || form.date === slotsDate) return;
    setSlots(null);
    setSlotsDate(form.date);
    getSlots(tenantId, form.date)
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [form.date]);

  const today = new Date().toISOString().slice(0,10);

  const nextStep = () => {
    if (step === 1) {
      if (!form.date) { setErr("Selecciona una fecha."); return; }
      if (!form.time) { setErr("Selecciona un horario."); return; }
    }
    setErr("");
    setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!form.clientName.trim()) { setErr("El nombre es obligatorio."); return; }
    if (!form.clientEmail.trim()) { setErr("El correo es obligatorio."); return; }
    if (form.clientRut && !validateRut(form.clientRut)) { setRutErr("RUT inválido."); return; }
    setErr(""); setRutErr(""); setSaving(true);
    try {
      const payload = {
        ...form,
        clientRut: form.clientRut ? formatRut(form.clientRut) : "",
      };
      await createBooking(tenantId, payload);
      setStep(3);
    } catch (e) {
      setErr(e.response?.data?.message || "Error al reservar. Intenta de nuevo.");
    } finally { setSaving(false); }
  };

  // ── Estados de carga/error de clínica ──────────────────────────────────────
  if (clinicErr) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        background:"#F5F7FF", fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif", padding:24 }}>
        <div style={{ textAlign:"center", maxWidth:380 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#0F172A", marginBottom:8 }}>Enlace no válido</div>
          <div style={{ fontSize:14, color:"#64748B" }}>{clinicErr}</div>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        background:"#F5F7FF" }}>
        <div style={{ fontSize:14, color:"#64748B", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Cargando…</div>
      </div>
    );
  }

  const Brand = T.brand;

  return (
    <div style={{ minHeight:"100vh", background:"#F5F7FF",
      fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── Encabezado ── */}
      <div style={{ background:`linear-gradient(135deg,#0F0F1A,#1e1b4b,#312e81)`, padding:"28px 24px" }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ borderRadius:12, overflow:"hidden", flexShrink:0 }}>
            <VetOSLogo size={40} white />
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.03em" }}>
              {clinic.clinicName || "ZOVITA"}
            </div>
            {clinic.address && <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{clinic.address}</div>}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 16px 60px" }}>

        {/* ── Paso 3: Confirmado ── */}
        {step === 3 && (
          <div style={{ background:"#fff", borderRadius:20, padding:"40px 32px", boxShadow:"0 4px 24px rgba(99,102,241,0.1)",
            textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#6366F1,#818CF8)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 20px",
              boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>✓</div>
            <div style={{ fontSize:22, fontWeight:800, color:"#0F172A", marginBottom:8 }}>¡Reserva solicitada!</div>
            <div style={{ fontSize:14, color:"#64748B", lineHeight:1.7, marginBottom:24 }}>
              Tu cita para el <strong>{form.date}</strong> a las <strong>{form.time}</strong> fue enviada.<br/>
              La clínica la confirmará a tu correo <strong>{form.clientEmail}</strong>.
            </div>
            <div style={{ background:"#EEF2FF", borderRadius:12, padding:"14px 18px", fontSize:13, color:"#4338CA",
              display:"inline-block", lineHeight:1.6 }}>
              <strong>{clinic.clinicName}</strong> · {clinic.phone || ""}<br/>
              {clinic.email || ""}
            </div>
            <div style={{ marginTop:24 }}>
              <button
                onClick={() => { setForm(EMPTY_FORM); setStep(1); setSlots(null); setSlotsDate(""); }}
                style={{ padding:"11px 28px", borderRadius:12, background:Brand, color:"#fff",
                  border:"none", cursor:"pointer", fontSize:14, fontWeight:700 }}>
                Hacer otra reserva
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 1: Fecha y hora ── */}
        {step === 1 && (
          <div style={{ background:"#fff", borderRadius:20, padding:"28px 24px", boxShadow:"0 4px 24px rgba(99,102,241,0.08)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:Brand, letterSpacing:"0.1em",
              textTransform:"uppercase", marginBottom:18 }}>
              Paso 1 de 2 — Elige fecha y hora
            </div>

            {/* Tipo de cita */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:8 }}>
                Tipo de cita
              </label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {TYPES.map((t) => (
                  <button key={t.value} onClick={() => setForm((f) => ({ ...f, type:t.value }))}
                    style={{
                      padding:"8px 14px", borderRadius:20, border:`1.5px solid ${form.type===t.value ? Brand : "#E2E8F0"}`,
                      background: form.type===t.value ? "#EEF2FF" : "#fff",
                      color: form.type===t.value ? "#4338CA" : "#64748B",
                      cursor:"pointer", fontSize:13, fontWeight:600,
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:6 }}>
                Fecha *
              </label>
              <input
                type="date"
                value={form.date}
                min={today}
                onChange={(e) => { setForm((f) => ({ ...f, date:e.target.value, time:"" })); setErr(""); }}
                style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #E2E8F0",
                  borderRadius:10, fontSize:14, color:"#0F172A", fontFamily:"inherit",
                  outline:"none", boxSizing:"border-box", background:"#F8FAFC" }}
              />
            </div>

            {/* Horarios */}
            {form.date && (
              <div style={{ marginBottom:24 }}>
                <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:10 }}>
                  Horario disponible *
                </label>
                <SlotGrid slots={slots} selected={form.time} onSelect={(t) => { setForm((f) => ({ ...f, time:t })); setErr(""); }} />
                {slots && slots.every((s) => !s.available) && (
                  <div style={{ marginTop:12, fontSize:13, color:"#dc2626", textAlign:"center" }}>
                    No hay horarios disponibles para este día. Por favor elige otra fecha.
                  </div>
                )}
              </div>
            )}

            {err && <div style={{ fontSize:13, color:"#dc2626", marginBottom:14, padding:"10px 14px",
              background:"#FEF2F2", borderRadius:8 }}>{err}</div>}

            <button
              onClick={nextStep}
              style={{ width:"100%", padding:"13px", borderRadius:12, background:Brand, color:"#fff",
                border:"none", cursor:"pointer", fontSize:15, fontWeight:700 }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── Paso 2: Datos del cliente ── */}
        {step === 2 && (
          <div style={{ background:"#fff", borderRadius:20, padding:"28px 24px", boxShadow:"0 4px 24px rgba(99,102,241,0.08)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:Brand, letterSpacing:"0.1em",
              textTransform:"uppercase", marginBottom:4 }}>
              Paso 2 de 2 — Tus datos
            </div>
            {/* Resumen de la cita */}
            <div style={{ background:"#EEF2FF", borderRadius:10, padding:"10px 14px", marginBottom:20,
              fontSize:13, color:"#4338CA", display:"flex", gap:16, flexWrap:"wrap" }}>
              <span>📅 {form.date}</span>
              <span>🕐 {form.time}</span>
              <span>{TYPES.find((t) => t.value === form.type)?.label}</span>
            </div>

            {field("Nombre completo *", "text",  "clientName",  "Juan Pérez", form, setForm)}
            {field("Correo electrónico *", "email", "clientEmail", "juan@email.cl", form, setForm)}
            {field("Teléfono", "tel", "clientPhone", "+56 9 1234 5678", form, setForm)}

            {/* RUT con validación */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:6 }}>RUT</label>
              <input
                type="text"
                value={form.clientRut}
                onChange={(e) => { setForm((f) => ({ ...f, clientRut:e.target.value })); setRutErr(""); }}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val) {
                    if (!validateRut(val)) setRutErr("RUT inválido. Verifica el dígito verificador.");
                    else setForm((f) => ({ ...f, clientRut: formatRut(val) }));
                  }
                }}
                placeholder="12.345.678-9"
                style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${rutErr ? "#dc2626" : "#E2E8F0"}`,
                  borderRadius:10, fontSize:14, color:"#0F172A", fontFamily:"inherit",
                  outline:"none", boxSizing:"border-box" }}
              />
              {rutErr && <div style={{ fontSize:12, color:"#dc2626", marginTop:4 }}>⚠ {rutErr}</div>}
            </div>

            {/* Mascota */}
            <div style={{ borderTop:"1px solid #E2E8F0", paddingTop:16, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#64748B", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                Datos de tu mascota (opcional)
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:6 }}>Nombre</label>
                  <input type="text" value={form.petName} onChange={(e) => setForm((f) => ({ ...f, petName:e.target.value }))}
                    placeholder="Max" style={inputSt()} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:6 }}>Especie</label>
                  <select value={form.petSpecies} onChange={(e) => setForm((f) => ({ ...f, petSpecies:e.target.value }))}
                    style={{ ...inputSt(), cursor:"pointer" }}>
                    {SPECIES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:6 }}>Notas adicionales</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes:e.target.value }))}
                placeholder="Motivo de la consulta, síntomas, indicaciones especiales…"
                rows={3}
                style={{ ...inputSt(), resize:"vertical", minHeight:80 }}
              />
            </div>

            {err && <div style={{ fontSize:13, color:"#dc2626", marginBottom:14, padding:"10px 14px",
              background:"#FEF2F2", borderRadius:8 }}>{err}</div>}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setStep(1); setErr(""); }}
                style={{ flex:"0 0 auto", padding:"12px 20px", borderRadius:12,
                  background:"#F8FAFC", color:"#64748B", border:"1.5px solid #E2E8F0",
                  cursor:"pointer", fontSize:14, fontWeight:600 }}>← Atrás</button>
              <button onClick={submit} disabled={saving}
                style={{ flex:1, padding:"12px", borderRadius:12, background:Brand, color:"#fff",
                  border:"none", cursor:saving ? "not-allowed" : "pointer", fontSize:15, fontWeight:700,
                  opacity: saving ? 0.7 : 1 }}>
                {saving ? "Enviando reserva…" : "Confirmar reserva ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:32, fontSize:12, color:"#94a3b8" }}>
          Powered by{" "}
          <span style={{ fontWeight:700, color:"#6366F1" }}>ZOVITA</span>
          {" "}· Plataforma de gestión veterinaria
        </div>
      </div>
    </div>
  );
}

// ── Helpers internos ──────────────────────────────────────────────────────────
function inputSt() {
  return {
    width:"100%", padding:"11px 14px", border:"1.5px solid #E2E8F0",
    borderRadius:10, fontSize:14, color:"#0F172A", fontFamily:"inherit",
    outline:"none", boxSizing:"border-box", background:"#fff",
  };
}

function field(label, type, key, placeholder, form, setForm) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:13, fontWeight:700, color:"#334155", display:"block", marginBottom:6 }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]:e.target.value }))}
        placeholder={placeholder}
        style={inputSt()}
      />
    </div>
  );
}
