import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { getGroomingPhotos, uploadGroomingPhoto, deletePhoto } from "../../services/petPhotos.service.js";
import { generateGroomingPDF, previewGroomingPDF } from "../../utils/generatePetPDF.js";
import T from "../../styles/tokens.js";
import { fmtDate, fmtCLP, spIcon, SERVICES, MONTHS, DAYS_S, calDays } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import StatusBadge from "../../components/ui/badges/StatusBadge.jsx";

const NOW = new Date();
const EMPTY = { petId:"", clientId:"", date:"", time:"09:00", service:SERVICES[0], notes:"", price:18000, status:"pendiente" };
const ST_COLORS = { confirmada:"#22c55e", pendiente:"#f59e0b", completada:"#94a3b8", cancelada:"#ef4444" };

// ── Sección de fotos por cita de peluquería ──────────────────────────────────
function GroomingPhotoSection({ grooming, petId }) {
  const [photos,    setPhotos]    = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox,  setLightbox]  = useState(null);
  const [open,      setOpen]      = useState(false);
  const fileRef = useRef();

  const load = async () => {
    try {
      const data = await getGroomingPhotos(grooming.id);
      setPhotos(data);
    } catch { setPhotos([]); }
  };

  useEffect(() => { if (open && photos === null) load(); }, [open]);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) await uploadGroomingPhoto(grooming.id, petId, f);
      await load();
    } catch (err) {
      console.error("Error subiendo foto:", err);
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar foto?")) return;
    await deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const cnt = photos?.length ?? 0;

  return (
    <div style={{ marginTop: 10 }}>
      {/* Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center",
          gap:6, fontSize:12.5, fontWeight:600, color:T.brand, padding:0, fontFamily:T.font }}
      >
        <span style={{ fontSize:14 }}>{open ? "▲" : "▼"}</span>
        {open ? "Ocultar fotos" : `📷 Fotos del servicio${cnt > 0 ? ` (${cnt})` : ""}`}
      </button>

      {open && (
        <div style={{ marginTop:10 }}>
          {/* Grid de fotos */}
          {photos === null ? (
            <div style={{ fontSize:12, color:T.textMuted }}>Cargando…</div>
          ) : photos.length === 0 ? (
            <div style={{ fontSize:12, color:T.textMuted, fontStyle:"italic", marginBottom:10 }}>
              Sin fotos adjuntas para este servicio.
            </div>
          ) : (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
              {photos.map((ph) => (
                <div key={ph.id} style={{ position:"relative" }}>
                  <img
                    src={ph.url}
                    alt={ph.caption || "foto"}
                    onClick={() => setLightbox(ph.url)}
                    style={{ width:72, height:72, objectFit:"cover", borderRadius:9, cursor:"pointer",
                      border:`1.5px solid ${T.border}`, boxShadow:T.sm }}
                  />
                  <button
                    onClick={() => handleDelete(ph.id)}
                    style={{ position:"absolute", top:-5, right:-5, width:17, height:17,
                      background:"#ef4444", color:"#fff", border:"none", borderRadius:"50%",
                      fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      lineHeight:1, padding:0 }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Subir fotos */}
          <input
            ref={fileRef} type="file" multiple accept="image/*"
            capture="environment" onChange={handleFile} style={{ display:"none" }}
          />
          <Btn v="sm_green" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Subiendo…" : "📷 Agregar foto"}
          </Btn>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:9999,
            display:"flex", alignItems:"center", justifyContent:"center" }}
        >
          <img src={lightbox} alt="foto" style={{ maxWidth:"92vw", maxHeight:"88vh", borderRadius:12 }} />
          <button
            onClick={() => setLightbox(null)}
            style={{ position:"fixed", top:20, right:24, background:"rgba(255,255,255,0.15)",
              border:"none", color:"#fff", fontSize:22, cursor:"pointer", borderRadius:8, padding:"4px 10px" }}
          >✕</button>
        </div>
      )}
    </div>
  );
}

export default function GroomingView() {
  const { grooming, pets, users, settings, appointments, addGrooming, updateGroomingStatus, updateAppointment } = useApp();
  const { isMobile } = useBreakpoint();
  const [view, setView]       = useState("calendar");
  const [filter, setFilter]   = useState("todas");
  const [modal, setModal]     = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [calYear, setCalYear] = useState(NOW.getFullYear());
  const [calMonth, setCalMonth] = useState(NOW.getMonth());
  const [form, setForm]       = useState(EMPTY);

  const clients = users.filter((u) => u.role === "client");

  // Solicitudes de peluquería hechas por clientes registrados (vienen de la tabla appointments)
  const clientGroomAppts = appointments
    .filter((a) => a.type === "peluqueria" && a.clientId && !a.guestName)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const display = (filter === "todas" ? grooming : grooming.filter((g) => g.status === filter))
    .sort((a, b) => a.date.localeCompare(b.date));
  const days = calDays(calYear, calMonth);
  const todayD = new Date().getFullYear() === calYear && new Date().getMonth() === calMonth ? new Date().getDate() : null;

  const getAppts = (day) => {
    const ds = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const groomEntries   = grooming.filter((g) => g.date === ds).map((g) => ({ ...g, _src: "grooming" }));
    const clientEntries  = clientGroomAppts.filter((a) => a.date === ds).map((a) => ({ ...a, _src: "client" }));
    return [...groomEntries, ...clientEntries].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  };

  const save = async () => {
    if (!form.petId || !form.clientId || !form.date) return;
    await addGrooming({ ...form, petId:+form.petId, clientId:+form.clientId, price:+form.price });
    setModal(false);
    setForm(EMPTY);
  };

  return (
    <div style={{ padding: isMobile ? "0 14px 32px" : "0 36px 36px" }}>
      <PageTitle icon="✂️" title="Peluquería" sub="Agenda y gestión de citas" action={
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", border:`1.5px solid ${T.border}`, borderRadius:10, overflow:"hidden", background:T.panel, boxShadow:T.sm }}>
            {[ ["calendar","📅 Calendario"],["lista","☰ Lista"] ].map(([id,lbl]) => (
              <button key={id} onClick={() => setView(id)} style={{ padding:"9px 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:T.font, background:view===id?T.brand:"transparent", color:view===id?"#fff":T.textMuted, transition:"all 0.15s" }}>{lbl}</button>
            ))}
          </div>
          <Btn v="accent" onClick={() => setModal(true)}>+ Agendar</Btn>
        </div>
      }/>

      {/* ── Solicitudes de peluquería de clientes registrados ──────────────── */}
      {clientGroomAppts.length > 0 && (
        <div style={{ background:T.panel, borderRadius:16, border:`1.5px solid #F59E0B`, boxShadow:T.sm, padding:"18px 22px", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ fontSize:20 }}>✂️</div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:T.text }}>Solicitudes de peluquería</div>
              <div style={{ fontSize:12, color:T.textMuted }}>Citas agendadas por clientes registrados — {clientGroomAppts.filter(a=>a.status==="pendiente").length} pendiente{clientGroomAppts.filter(a=>a.status==="pendiente").length!==1?"s":""}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {clientGroomAppts.map((a) => {
              const pet    = pets.find((p) => p.id === a.petId);
              const client = users.find((u) => u.id === a.clientId);
              const ST = { pendiente:{bg:"#FEF3C7",color:"#92400E"}, confirmada:{bg:"#D1FAE5",color:"#065F46"}, completada:{bg:"#DBEAFE",color:"#1E40AF"}, cancelada:{bg:"#FEE2E2",color:"#991B1B"} };
              const sc = ST[a.status] || ST.pendiente;
              return (
                <div key={a.id} style={{ background:T.appBg, borderRadius:12, border:`1px solid ${T.border}`, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#F59E0B,#D97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {spIcon(pet?.species)}
                  </div>
                  <div style={{ flex:1, minWidth:150 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:T.text }}>{pet?.name || "Mascota desconocida"}</div>
                    <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>
                      👤 {client?.name || "Cliente"}{pet?.breed ? ` · ${pet.breed}` : ""}
                    </div>
                    {a.notes && <div style={{ fontSize:12, color:T.textMuted, fontStyle:"italic", marginTop:2 }}>📝 {a.notes}</div>}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:6 }}>📅 {a.date} · {a.time}</div>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, background:sc.bg, color:sc.color, fontSize:12, fontWeight:700 }}>
                      {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                    </span>
                  </div>
                  {a.status === "pendiente" && (
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button onClick={() => updateAppointment(a.id, { status:"confirmada" })}
                        style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:"#D1FAE5", color:"#065F46", fontSize:12, fontWeight:700, fontFamily:T.font }}>
                        ✓ Confirmar
                      </button>
                      <button onClick={() => updateAppointment(a.id, { status:"cancelada" })}
                        style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:"#FEE2E2", color:"#991B1B", fontSize:12, fontWeight:700, fontFamily:T.font }}>
                        ✗ Cancelar
                      </button>
                    </div>
                  )}
                  {a.status === "confirmada" && (
                    <button onClick={() => updateAppointment(a.id, { status:"completada" })}
                      style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:"#DBEAFE", color:"#1E40AF", fontSize:12, fontWeight:700, fontFamily:T.font, flexShrink:0 }}>
                      ✓ Completar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "calendar" && (
        <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <div style={{ padding:"18px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={() => { const d=new Date(calYear,calMonth-1,1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }} style={{ background:T.appBg, border:`1px solid ${T.border}`, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:T.font }}>←</button>
            <div style={{ fontSize:18, fontWeight:800, color:T.text, fontFamily:T.font }}>{MONTHS[calMonth]} {calYear}</div>
            <button onClick={() => { const d=new Date(calYear,calMonth+1,1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }} style={{ background:T.appBg, border:`1px solid ${T.border}`, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:T.font }}>→</button>
          </div>
          <div style={{ padding:"16px 20px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:8 }}>
              {DAYS_S.map((d) => <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:T.textMuted, padding:"6px 0", letterSpacing:"0.07em", textTransform:"uppercase" }}>{d}</div>)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
              {days.map((day, i) => {
                if (!day) return <div key={`e${i}`}/>;
                const appts = getAppts(day);
                const isT   = day === todayD;
                return (
                  <div key={day} style={{ borderRadius:10, padding:"8px 7px", minHeight:86, background:isT?`${T.brand}10`:T.appBg, border:isT?`2px solid ${T.brand}`:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:13, fontWeight:isT?800:500, color:isT?"#fff":T.text, background:isT?T.brand:"transparent", width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>{day}</div>
                    {appts.map((a) => {
                      const pet    = pets.find((p) => p.id === a.petId);
                      const client = users.find((u) => u.id === a.clientId);
                      const col    = ST_COLORS[a.status] || "#94a3b8";
                      const isClient = a._src === "client";
                      return (
                        <div
                          key={`${a._src}-${a.id}`}
                          title={isClient
                            ? `📱 Solicitud cliente · ${pet?.name || "—"} · ${client?.name || "—"} · ${a.status}`
                            : `${pet?.name || "—"} · ${a.service || ""}`}
                          style={{
                            fontSize:10, fontWeight:700, color:col,
                            background:`${col}18`,
                            borderLeft:`3px solid ${col}`,
                            borderRadius:"0 5px 5px 0",
                            padding:"2px 5px", marginBottom:2,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                            opacity: isClient ? 1 : 1,
                            outline: isClient ? `1.5px dashed ${col}` : "none",
                            outlineOffset: -1,
                          }}
                        >
                          {isClient ? "📱 " : ""}{a.time} {pet?.name || "—"}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:14, marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}`, flexWrap:"wrap", alignItems:"center" }}>
              {[ ["confirmada","#22c55e"],["pendiente","#f59e0b"],["completada","#94a3b8"],["cancelada","#ef4444"] ].map(([s,col]) => (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                  <div style={{ width:3, height:14, borderRadius:2, background:col }}/><span style={{ color:T.textMuted, textTransform:"capitalize" }}>{s}</span>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, marginLeft:"auto" }}>
                <span style={{ fontSize:11 }}>📱</span>
                <span style={{ color:T.textMuted, fontStyle:"italic" }}>= solicitud de cliente (borde punteado)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "lista" && (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
            {["todas","pendiente","confirmada","completada","cancelada"].map((f) => (
              <button key={f} className={`chip-select ${filter===f?"active":""}`} onClick={() => setFilter(f)}
                style={{ padding:"7px 18px", borderRadius:20, border:`1.5px solid ${T.border}`, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:T.font, background:filter===f?T.brand:T.panel, color:filter===f?"#fff":T.textMuted }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gap:12 }}>
            {display.map((g) => {
              const pet    = pets.find((p) => p.id === g.petId);
              const client = users.find((u) => u.id === g.clientId);
              return (
                <div key={g.id} style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"18px 22px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
                    {/* Lado izquierdo */}
                    <div style={{ display:"flex", alignItems:"center", gap:14, flex:1 }}>
                      <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{spIcon(pet?.species)}</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{pet?.name} <span style={{ fontWeight:400, color:T.textMuted, fontSize:14 }}>· {client?.name}</span></div>
                        <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{g.service}</div>
                        {g.notes && <div style={{ fontSize:12, color:T.textMuted, fontStyle:"italic", marginTop:3 }}>📝 {g.notes}</div>}
                      </div>
                    </div>
                    {/* Lado derecho */}
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:6 }}>📅 {fmtDate(g.date)} · {g.time}</div>
                      <div style={{ marginBottom:8 }}><StatusBadge status={g.status}/></div>
                      <div style={{ fontSize:15, fontWeight:800, color:T.brand }}>{fmtCLP(g.price)}</div>
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end", marginTop:6, flexWrap:"wrap" }}>
                        {g.status === "pendiente"  && <><Btn v="sm_green" onClick={() => updateGroomingStatus(g.id,"confirmada")}>✓ Confirmar</Btn><Btn v="sm_red" onClick={() => updateGroomingStatus(g.id,"cancelada")}>✗</Btn></>}
                        {g.status === "confirmada" && <Btn v="sm_gray"  onClick={() => updateGroomingStatus(g.id,"completada")}>✓ Completar</Btn>}
                        <Btn v="ghost" onClick={() => setPdfPreview(previewGroomingPDF({ grooming: g, pet, client, settings: settings || {} }))}
                          style={{ fontSize:11, padding:"5px 11px" }}>
                          📄 PDF
                        </Btn>
                      </div>
                    </div>
                  </div>
                  {/* Sección de fotos */}
                  {pet?.id && <GroomingPhotoSection grooming={g} petId={pet.id} />}
                </div>
              );
            })}
            {display.length === 0 && <div style={{ textAlign:"center", padding:48, color:T.textMuted, fontSize:14, background:T.panel, borderRadius:14 }}>Sin citas en esta categoría.</div>}
          </div>
        </>
      )}

      {/* Modal previsualización PDF grooming */}
      {pdfPreview && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", zIndex:400,
          display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={(e) => { if (e.target === e.currentTarget) { URL.revokeObjectURL(pdfPreview.url); setPdfPreview(null); } }}>
          <div style={{ background:T.panel, borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
            width:"92vw", maxWidth:900, height:"88vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 20px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                📄 {pdfPreview.filename}
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <Btn v="accent" onClick={() => pdfPreview.doc.save(pdfPreview.filename)}>⬇ Descargar</Btn>
                <Btn v="ghost"  onClick={() => { URL.revokeObjectURL(pdfPreview.url); setPdfPreview(null); }}>✕ Cerrar</Btn>
              </div>
            </div>
            <iframe src={pdfPreview.url} style={{ flex:1, width:"100%", border:"none" }} title="Vista previa PDF"/>
          </div>
        </div>
      )}

      {modal && (
        <Modal title="Agendar cita de peluquería" onClose={() => setModal(false)}>
          <Select label="Cliente *" value={form.clientId} onChange={(e) => setForm({...form, clientId:e.target.value, petId:""})}>
            <option value="">Seleccionar cliente...</option>
            {clients.sort((a,b) => a.name.localeCompare(b.name,"es")).map((c) => <option key={c.id} value={c.id}>{c.name} — {c.rut}</option>)}
          </Select>
          <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({...form, petId:e.target.value})}>
            <option value="">Seleccionar mascota...</option>
            {pets.filter((p) => !form.clientId || p.ownerId === +form.clientId).sort((a,b) => a.name.localeCompare(b.name,"es")).map((p) => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
          </Select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Input label="Fecha *" type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})}/>
            <Input label="Hora"    type="time" value={form.time} onChange={(e) => setForm({...form, time:e.target.value})}/>
          </div>
          <Select label="Servicio" value={form.service} onChange={(e) => setForm({...form, service:e.target.value})}>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Input label="Precio (CLP)" type="number" value={form.price} onChange={(e) => setForm({...form, price:e.target.value})}/>
          <Input label="Notas especiales" value={form.notes} onChange={(e) => setForm({...form, notes:e.target.value})} placeholder="Instrucciones especiales..."/>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={save}>Agendar cita</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
