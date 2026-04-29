import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import api from "../../services/api.js";
import T from "../../styles/tokens.js";
import { fmtDate, spIcon, vaxStatus } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import Label  from "../../components/ui/Label.jsx";
import VaxBadge  from "../../components/ui/badges/VaxBadge.jsx";
import TypeBadge from "../../components/ui/badges/TypeBadge.jsx";

const EMPTY_FORM        = { name:"", species:"Perro", breed:"", age:"", weight:"", color:"", gender:"Hembra", chip:"", ownerId:"" };
const EMPTY_INLINE_CLIENT = { name:"", rut:"", email:"", phone:"", password:"cliente123" };

// ── Modal de contraseña (pequeño, superpuesto) ────────────────────────────────
function PwdModal({ onSuccess, onCancel }) {
  const { currentUser } = useApp();
  const [pwd, setPwd]   = useState("");
  const [err, setErr]   = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    if (!pwd.trim()) return;
    setBusy(true); setErr("");
    try {
      await api.post("/auth/login/staff", { email: currentUser.email, password: pwd });
      onSuccess();
    } catch {
      setErr("Contraseña incorrecta.");
    } finally { setBusy(false); }
  };

  return (
    /* Overlay semitransparente encima de la lista */
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:T.panel, borderRadius:18, boxShadow:T.md,
        border:`1px solid ${T.border}`, padding:"32px 36px", width:340, textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🔒</div>
        <div style={{ fontSize:16, fontWeight:800, color:T.text, fontFamily:T.font, marginBottom:6 }}>
          Ficha médica protegida
        </div>
        <div style={{ fontSize:13, color:T.textMuted, marginBottom:22, lineHeight:1.5 }}>
          Ingresa tu contraseña para ver el historial clínico.
        </div>
        <input
          type="password" value={pwd} autoFocus
          onChange={(e) => { setPwd(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && verify()}
          placeholder="••••••••"
          style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${err ? T.redText : T.border}`,
            borderRadius:9, fontSize:14, color:T.text, background:T.appBg,
            fontFamily:T.font, outline:"none", boxSizing:"border-box", marginBottom:err ? 6 : 16 }}
        />
        {err && <div style={{ fontSize:12, color:T.redText, marginBottom:12, fontWeight:500 }}>⚠ {err}</div>}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"10px 0", borderRadius:9, border:`1.5px solid ${T.border}`,
            background:"transparent", color:T.textMuted, cursor:"pointer", fontSize:13, fontFamily:T.font }}>
            Cancelar
          </button>
          <button onClick={verify} disabled={busy || !pwd.trim()}
            style={{ flex:1, padding:"10px 0", borderRadius:9, border:"none",
              background: busy || !pwd.trim() ? T.border : T.brand,
              color: busy || !pwd.trim() ? T.textMuted : "#fff",
              cursor: busy ? "wait" : "pointer", fontSize:13, fontWeight:700, fontFamily:T.font }}>
            {busy ? "Verificando…" : "Desbloquear"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Parseo de historial con fechas embebidas ─────────────────────────────────
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function limpiarTexto(t) {
  return (t || '')
    .replace(/TÂ°|Â°/g, '°').replace(/Ã±/g, 'ñ').replace(/Ã©/g, 'é')
    .replace(/Ã¡/g, 'á').replace(/Ã³/g, 'ó').replace(/Ã­/g, 'í').replace(/Ãº/g, 'ú')
    .replace(/\s+/g, ' ').trim();
}

function parsearFecha(d, m, y) {
  const di = parseInt(d), mi = parseInt(m); let yi = parseInt(y);
  if (isNaN(di)||isNaN(mi)||isNaN(yi)||di<1||di>31||mi<1||mi>12) return null;
  if (yi < 100) yi = yi <= 30 ? 2000+yi : 1900+yi;
  if (yi < 1990 || yi > 2030) return null;
  return { d:di, m:mi, y:yi, obj:new Date(yi, mi-1, di),
    label:`${di} ${MESES[mi-1]} ${yi}` };
}

function tipoEntrada(texto) {
  const t = texto.toLowerCase();
  if (/vacun|octuple|sextuple|séptuple|setuple|séptupla|rabia|antirrab|parvovirus|leucemia|puppy/.test(t))
    return { icon:'💉', color:'#7c3aed', bg:'#ede9fe', borde:'#c4b5fd' };
  if (/cirug|operar|anestes|castrac|esteriliz|biopsia|sutura/.test(t))
    return { icon:'🔬', color:'#dc2626', bg:'#fee2e2', borde:'#fca5a5' };
  if (/desparasit|mebermic|milbemaxi|drontal|endoparasit|antiparasit/.test(t))
    return { icon:'🌿', color:'#059669', bg:'#d1fae5', borde:'#6ee7b7' };
  if (/otitis|urgencia|dolor|vomit|diarrea|crisis|convuls|fractura|trauma|decaido|decaída|emergencia/.test(t))
    return { icon:'⚠️', color:'#d97706', bg:'#fef3c7', borde:'#fcd34d' };
  if (/chip|microchip|implan/.test(t))
    return { icon:'📡', color:'#0891b2', bg:'#cffafe', borde:'#67e8f9' };
  return { icon:'📋', color:'#6366f1', bg:'#eef2ff', borde:'#a5b4fc' };
}

function parsearHistorial(registros) {
  const DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*/;
  const entradas = [];

  for (const rec of registros) {
    const texto = rec.notes || '';
    if (!texto.trim()) {
      // Sin notas → usar diagnosis/treatment con la fecha del registro
      const partes = (rec.date || '').split('-');
      if (partes.length === 3) {
        const f = parsearFecha(partes[2], partes[1], partes[0]);
        if (f) {
          const contenido = [rec.diagnosis, rec.treatment].filter(Boolean).join(' · ');
          if (contenido) entradas.push({ ...f, texto: limpiarTexto(contenido) });
        }
      }
      continue;
    }

    const lineas = texto.split('\n');
    let actual = null;

    for (const lineaRaw of lineas) {
      const linea = limpiarTexto(lineaRaw);
      if (!linea) continue;
      const m = linea.match(DATE_RE);
      if (m) {
        if (actual) entradas.push(actual);
        const f = parsearFecha(m[1], m[2], m[3]);
        if (!f) { if (actual) actual.texto += ' ' + linea; continue; }
        const resto = limpiarTexto(linea.slice(m[0].length));
        actual = { ...f, texto: resto };
      } else if (actual) {
        actual.texto += (actual.texto ? ' ' + linea : linea);
      }
    }
    if (actual) entradas.push(actual);
  }

  return entradas
    .filter(e => e.texto.trim().length > 2)
    .sort((a, b) => b.obj - a.obj);
}

// ── Vista detalle de mascota ──────────────────────────────────────────────────
function PetDetail({ pet, users, records, vaccines, onBack }) {
  const owner   = users.find((u) => u.id === pet.ownerId);
  const petRecs = records.filter((r) => r.petId === pet.id);
  const petVax  = vaccines.filter((v) => v.petId === pet.id);
  const entradas = parsearHistorial(petRecs);

  return (
    <div style={{ padding:"0 36px 36px" }}>
      {/* Botón volver */}
      <div style={{ paddingTop:28, marginBottom:18 }}>
        <button onClick={onBack}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 16px",
            background:T.panel, border:`1.5px solid ${T.border}`, borderRadius:10,
            color:T.text, cursor:"pointer", fontSize:14, fontWeight:600,
            fontFamily:T.font, boxShadow:T.sm, transition:"all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor=T.brand; e.currentTarget.style.color=T.brand; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.text; }}>
          ← Volver a mascotas
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20, alignItems:"start" }}>

        {/* ── Columna izquierda ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Datos mascota */}
          <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, overflow:"hidden" }}>
            <div style={{ background:`linear-gradient(160deg,${T.brand},${T.brandMid})`, padding:"28px 24px", textAlign:"center" }}>
              <div style={{ fontSize:64, marginBottom:8 }}>{spIcon(pet.species)}</div>
              <div style={{ fontSize:24, fontWeight:800, color:"#fff", fontFamily:T.font }}>{pet.name}</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.65)", marginTop:3 }}>{pet.breed}</div>
            </div>
            <div style={{ padding:"16px 20px" }}>
              {[["Especie",pet.species],["Género",pet.gender],
                ["Edad", pet.age ? `${pet.age} años` : "—"],
                ["Peso", pet.weight ? `${pet.weight} kg` : "—"],
                ["Color", pet.color||"—"],
                ["Microchip", pet.chip||"No registrado"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0",
                  borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
                  <span style={{ color:T.textMuted }}>{k}</span>
                  <span style={{ fontWeight:600, color:T.text }}>{v}</span>
                </div>
              ))}
            </div>
            {owner && (
              <div style={{ margin:"0 16px 16px", background:T.appBg, borderRadius:10, padding:"12px 14px" }}>
                <Label>Propietario</Label>
                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{owner.name}</div>
                <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{owner.phone||"Sin teléfono"}</div>
              </div>
            )}
          </div>

          {/* Vacunas */}
          <div style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"18px 20px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:12 }}>💉 Vacunas</div>
            {petVax.length === 0
              ? <div style={{ color:T.textMuted, fontSize:13 }}>Sin vacunas registradas.</div>
              : petVax.map((v) => (
                <div key={v.id} style={{ padding:"8px 0", borderBottom:`1px solid ${T.border}`,
                  display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{v.name}</div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>
                      {fmtDate(v.dateApplied)} → {fmtDate(v.nextDue)}
                    </div>
                  </div>
                  <VaxBadge nextDue={v.nextDue}/>
                </div>
              ))
            }
          </div>

          {/* Leyenda */}
          <div style={{ background:T.panel, borderRadius:14, border:`1px solid ${T.border}`, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Leyenda</div>
            {[
              ['💉','Vacunación','#7c3aed'],
              ['🔬','Cirugía / procedimiento','#dc2626'],
              ['🌿','Desparasitación','#059669'],
              ['⚠️','Urgencia / síntoma','#d97706'],
              ['📡','Microchip','#0891b2'],
              ['📋','Control general','#6366f1'],
            ].map(([ic,lbl,col]) => (
              <div key={lbl} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:13 }}>{ic}</span>
                <span style={{ fontSize:12, color:col, fontWeight:600 }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Historial médico ── */}
        <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, padding:"24px 28px", minHeight:400 }}>

          {/* Encabezado */}
          <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:24 }}>
            <div style={{ fontSize:18, fontWeight:800, color:T.text, fontFamily:T.font }}>
              📋 Historial médico
            </div>
            {entradas.length > 0 && (
              <span style={{ fontSize:12, fontWeight:700, background:T.brandLight,
                color:T.brand, borderRadius:20, padding:"3px 10px" }}>
                {entradas.length} {entradas.length === 1 ? 'entrada' : 'entradas'}
              </span>
            )}
          </div>

          {entradas.length === 0 ? (
            <div style={{ color:T.textMuted, fontSize:14, textAlign:"center", paddingTop:40 }}>
              Sin historial médico registrado.
            </div>
          ) : (
            <div style={{ position:"relative" }}>
              {/* Línea vertical */}
              <div style={{ position:"absolute", left:16, top:8, bottom:8, width:2,
                background:`linear-gradient(to bottom, ${T.brand}, ${T.border})`, borderRadius:2 }}/>

              {entradas.map((e, idx) => {
                const tipo = tipoEntrada(e.texto);
                const esUltimo = idx === entradas.length - 1;
                return (
                  <div key={idx} style={{ display:"flex", gap:16, marginBottom: esUltimo ? 0 : 16,
                    position:"relative", zIndex:1 }}>

                    {/* Dot del timeline */}
                    <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0,
                      background:tipo.bg, border:`2.5px solid ${tipo.borde}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:14, boxShadow:`0 0 0 3px ${T.panel}` }}>
                      {tipo.icon}
                    </div>

                    {/* Tarjeta */}
                    <div style={{ flex:1, background:T.appBg, borderRadius:12,
                      borderLeft:`3px solid ${tipo.borde}`, padding:"12px 16px",
                      transition:"box-shadow 0.15s" }}
                      onMouseEnter={(el) => el.currentTarget.style.boxShadow = T.md}
                      onMouseLeave={(el) => el.currentTarget.style.boxShadow = "none"}>

                      {/* Fecha + número de entrada */}
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:6,
                          background:tipo.bg, borderRadius:20, padding:"3px 10px" }}>
                          <span style={{ fontSize:11, fontWeight:800, color:tipo.color,
                            letterSpacing:"0.02em" }}>
                            {e.label}
                          </span>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, color:T.textMuted,
                          background:T.appBg, border:`1px solid ${T.border}`,
                          borderRadius:20, padding:"2px 8px", letterSpacing:"0.04em" }}>
                          #{entradas.length - idx}
                        </span>
                      </div>

                      {/* Contenido */}
                      <div style={{ fontSize:13, color:T.text, lineHeight:1.65 }}>
                        {e.texto}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────────
export default function PetsView() {
  const { pets, users, records, vaccines, addPet, addUser } = useApp();
  const [search, setSearch]     = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  // Creación inline de cliente nuevo dentro del modal mascota
  const [inlineClient, setInlineClient] = useState(false);
  const [fClient, setFClient]           = useState(EMPTY_INLINE_CLIENT);
  const [inlineErr, setInlineErr]       = useState("");

  // Flujo de selección con contraseña
  const [selected, setSelected]     = useState(null);   // mascota en detalle
  const [pendingPet, setPendingPet] = useState(null);   // mascota esperando password

  const clients = users.filter((u) => u.role === "client");
  const filtered = pets.filter((p) => {
    const owner = users.find((u) => u.id === p.ownerId);
    return [p.name, p.breed, owner?.name].join(" ").toLowerCase()
      .includes(search.toLowerCase());
  });

  const handlePetClick = (pet) => setPendingPet(pet);

  const onUnlocked = () => {
    setSelected(pendingPet);
    setPendingPet(null);
  };

  const save = async () => {
    if (!form.name) return;
    setInlineErr("");
    let ownerId = form.ownerId;
    if (inlineClient) {
      if (!fClient.name || !fClient.email || !fClient.rut) {
        setInlineErr("Nombre, RUT y correo son obligatorios.");
        return;
      }
      try {
        const nuevoCliente = await addUser({ ...fClient, role: "client" });
        ownerId = nuevoCliente.id;
      } catch {
        setInlineErr("Error al crear el cliente. Verifica los datos.");
        return;
      }
    }
    if (!ownerId) return;
    await addPet({ ...form, age: +form.age, weight: +form.weight, ownerId: +ownerId });
    setModal(false);
    setForm(EMPTY_FORM);
    setInlineClient(false);
    setFClient(EMPTY_INLINE_CLIENT);
  };

  // ── Detalle de mascota ──
  if (selected) {
    return <PetDetail pet={selected} users={users} records={records} vaccines={vaccines} onBack={() => setSelected(null)}/>;
  }

  // ── Lista / Cuadros ──
  return (
    <div style={{ padding:"0 36px 36px" }}>
      {/* Modal contraseña (overlay pequeño, no reemplaza la página) */}
      {pendingPet && (
        <PwdModal onSuccess={onUnlocked} onCancel={() => setPendingPet(null)}/>
      )}

      <PageTitle icon="🐾" title="Mascotas" sub={`${pets.length} mascotas registradas`}
        action={<Btn v="accent" onClick={() => setModal(true)}>+ Nueva mascota</Btn>}/>

      {/* Barra de herramientas */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:T.textMuted }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, raza o dueño…" className="moga-input"
            style={{ padding:"11px 14px 11px 40px", border:`1.5px solid ${T.border}`, borderRadius:12,
              fontSize:14, color:T.text, background:T.panel, fontFamily:T.font, width:340, boxShadow:T.sm }}/>
        </div>

        {/* Toggle vista */}
        <div style={{ display:"flex", background:T.panel, border:`1.5px solid ${T.border}`, borderRadius:10, overflow:"hidden", boxShadow:T.sm }}>
          {[["list","≡"],["grid","⊞"]].map(([mode, icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ padding:"8px 16px", fontSize:18, lineHeight:1, border:"none", cursor:"pointer",
                fontFamily:T.font, transition:"background 0.15s",
                background: viewMode === mode ? T.brand : "transparent",
                color:      viewMode === mode ? "#fff"    : T.textMuted }}>
              {icon}
            </button>
          ))}
        </div>

        <div style={{ fontSize:13, color:T.textMuted }}>
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Vista lista ── */}
      {viewMode === "list" && (
        <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"44px 1fr 110px 140px 70px 80px 160px 70px",
            background:T.appBg, borderBottom:`2px solid ${T.border}`, padding:"10px 18px" }}>
            {["","Nombre","Especie","Raza","Edad","Peso","Propietario","Fichas"].map((h, i) => (
              <div key={i} style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding:"28px 20px", textAlign:"center", color:T.textMuted, fontSize:14 }}>Sin resultados.</div>
          )}
          {filtered.map((pet, idx) => {
            const owner  = users.find((u) => u.id === pet.ownerId);
            const recs   = records.filter((r) => r.petId === pet.id);
            const petVax = vaccines.filter((v) => v.petId === pet.id);
            const urgent = petVax.filter((v) => vaxStatus(v.nextDue).key !== "green");
            return (
              <div key={pet.id} onClick={() => handlePetClick(pet)}
                style={{ display:"grid", gridTemplateColumns:"44px 1fr 110px 140px 70px 80px 160px 70px",
                  padding:"11px 18px", cursor:"pointer", alignItems:"center",
                  borderBottom: idx < filtered.length-1 ? `1px solid ${T.border}` : "none",
                  background:"transparent", transition:"background 0.12s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = T.appBg}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{ fontSize:26 }}>{spIcon(pet.species)}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:T.text, fontFamily:T.font }}>{pet.name}</div>
                  {urgent.length > 0 && <div style={{ fontSize:11, color:T.redText, fontWeight:600 }}>⚠ {urgent.length} vac.</div>}
                </div>
                <div style={{ fontSize:13, color:T.textMuted }}>{pet.species}</div>
                <div style={{ fontSize:13, color:T.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pet.breed||"—"}</div>
                <div style={{ fontSize:13, color:T.text }}>{pet.age != null ? `${pet.age}a` : "—"}</div>
                <div style={{ fontSize:13, color:T.text }}>{pet.weight != null ? `${pet.weight}kg` : "—"}</div>
                <div style={{ fontSize:13, color:T.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{owner?.name||"—"}</div>
                <div style={{ fontSize:13, color:T.gold, fontWeight:700 }}>📋 {recs.length}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Vista cuadros ── */}
      {viewMode === "grid" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
          {filtered.map((pet) => {
            const owner  = users.find((u) => u.id === pet.ownerId);
            const recs   = records.filter((r) => r.petId === pet.id);
            const petVax = vaccines.filter((v) => v.petId === pet.id);
            const urgent = petVax.filter((v) => vaxStatus(v.nextDue).key !== "green");
            return (
              <div key={pet.id} className="hover-lift" onClick={() => handlePetClick(pet)}
                style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, border:`1px solid ${T.border}`, overflow:"hidden", cursor:"pointer" }}>
                <div style={{ background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, padding:"20px", textAlign:"center" }}>
                  <div style={{ fontSize:48 }}>{spIcon(pet.species)}</div>
                </div>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:17, fontWeight:800, color:T.text, fontFamily:T.font }}>{pet.name}</div>
                  <div style={{ fontSize:13, color:T.textMuted }}>{pet.breed}</div>
                  <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{pet.age}a · {pet.weight}kg</div>
                  <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{owner?.name}</div>
                  {urgent.length > 0 && <div style={{ fontSize:11, color:T.redText, fontWeight:600, marginTop:6 }}>⚠ {urgent.length} vacuna{urgent.length>1?"s":""}</div>}
                  <div style={{ fontSize:12, color:T.gold, fontWeight:700, marginTop:6 }}>📋 {recs.length} ficha{recs.length!==1?"s":""} →</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: nueva mascota */}
      {modal && (
        <Modal title="Registrar nueva mascota" onClose={() => { setModal(false); setInlineClient(false); setFClient(EMPTY_INLINE_CLIENT); setInlineErr(""); }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Input label="Nombre *"      value={form.name}    onChange={(e) => setForm({...form, name:e.target.value})}    placeholder="Luna"/>
            <Select label="Especie"      value={form.species} onChange={(e) => setForm({...form, species:e.target.value})}>
              {["Perro","Gato","Conejo","Ave","Otro"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Raza"          value={form.breed}   onChange={(e) => setForm({...form, breed:e.target.value})}   placeholder="Labrador Dorado"/>
            <Select label="Género"       value={form.gender}  onChange={(e) => setForm({...form, gender:e.target.value})}>
              <option>Hembra</option><option>Macho</option>
            </Select>
            <Input label="Edad (años)"   type="number" value={form.age}    onChange={(e) => setForm({...form, age:e.target.value})}    placeholder="3"/>
            <Input label="Peso (kg)"     type="number" step="0.1" value={form.weight} onChange={(e) => setForm({...form, weight:e.target.value})} placeholder="25.5"/>
            <Input label="Color"         value={form.color}   onChange={(e) => setForm({...form, color:e.target.value})}   placeholder="Dorado"/>
            <Input label="Microchip"     value={form.chip}    onChange={(e) => setForm({...form, chip:e.target.value})}    placeholder="985141..."/>
          </div>

          {/* Propietario: seleccionar existente o crear nuevo */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <Label>Propietario *</Label>
              <button onClick={() => { setInlineClient(!inlineClient); setInlineErr(""); }}
                style={{ fontSize:12, fontWeight:700, color: inlineClient ? T.redText : T.brand,
                  background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:T.font }}>
                {inlineClient ? "✕ Cancelar cliente nuevo" : "+ Crear cliente nuevo"}
              </button>
            </div>

            {!inlineClient ? (
              <Select value={form.ownerId} onChange={(e) => setForm({...form, ownerId:e.target.value})}>
                <option value="">— Seleccionar cliente —</option>
                {[...clients].sort((a,b) => a.name.localeCompare(b.name, "es"))
                  .map((c) => <option key={c.id} value={c.id}>{c.name}{c.rut ? ` · ${c.rut}` : ""}</option>)}
              </Select>
            ) : (
              <div style={{ background:T.appBg, borderRadius:12, padding:"14px 16px", border:`1.5px solid ${T.brand}` }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.brand, marginBottom:10 }}>👤 Nuevo cliente</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
                  <Input label="Nombre completo *" value={fClient.name}  onChange={(e) => setFClient({...fClient, name:e.target.value})}  placeholder="María Torres"/>
                  <Input label="RUT *"             value={fClient.rut}   onChange={(e) => setFClient({...fClient, rut:e.target.value})}   placeholder="12.345.678-9"/>
                  <Input label="Correo *" type="email" value={fClient.email} onChange={(e) => setFClient({...fClient, email:e.target.value})} placeholder="cliente@email.cl"/>
                  <Input label="Teléfono"          value={fClient.phone} onChange={(e) => setFClient({...fClient, phone:e.target.value})} placeholder="+56 9 1234 5678"/>
                </div>
                {inlineErr && <div style={{ fontSize:12, color:T.redText, marginTop:6 }}>⚠ {inlineErr}</div>}
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => { setModal(false); setInlineClient(false); setFClient(EMPTY_INLINE_CLIENT); setInlineErr(""); }}>Cancelar</Btn>
            <Btn v="accent" onClick={save}>Guardar mascota</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
