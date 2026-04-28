import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { fmtDate, fmtCLP, spIcon, vaxStatus } from "../../styles/helpers.js";
import { TableWrap, TR, TD } from "../../components/layout/Table.jsx";
import KpiCard    from "../../components/layout/KpiCard.jsx";
import Btn        from "../../components/ui/Btn.jsx";
import Input      from "../../components/ui/Input.jsx";
import Select     from "../../components/ui/Select.jsx";
import Modal      from "../../components/ui/Modal.jsx";
import Avatar     from "../../components/ui/Avatar.jsx";
import StatusBadge from "../../components/ui/badges/StatusBadge.jsx";
import TypeBadge   from "../../components/ui/badges/TypeBadge.jsx";

const Dot = ({ color }) => <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, marginTop:1 }}/>;

const APPT_TYPES = [
  { value: "consulta",   label: "🩺 Consulta médica" },
  { value: "control",    label: "📋 Control / seguimiento" },
  { value: "vacuna",     label: "💉 Vacunación" },
  { value: "peluqueria", label: "✂️ Peluquería" },
  { value: "otro",       label: "📌 Otro" },
];

export default function ClientPortal() {
  const { currentUser, pets, records, grooming, vaccines, payments, appointments, logout, addAppointment } = useApp();
  const [tab, setTab]         = useState("pets");
  const [selPet, setSelPet]   = useState(null);
  const [bookModal, setBookModal] = useState(false);
  const [booked, setBooked]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ petId: pets[0]?.id || "", date:"", time:"10:00", type:"consulta", notes:"" });

  const myVaxAlert = vaccines.filter((v) => vaxStatus(v.nextDue).key !== "green");
  const myPayPend  = payments.filter((p) => p.status === "pendiente");
  const myAppts    = appointments.filter((a) => a.clientId === currentUser.id).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const upcomingAppts = myAppts.filter((a) => a.date >= new Date().toISOString().slice(0,10) && a.status !== "cancelada");

  const book = async () => {
    if (!form.petId || !form.date || saving) return;
    setSaving(true);
    try {
      await addAppointment({
        petId: +form.petId,
        clientId: currentUser.id,
        staffId: null,
        date: form.date,
        time: form.time,
        duration: 30,
        type: form.type,
        status: "pendiente",
        notes: form.notes,
      });
      setBooked(true);
      setTimeout(() => { setBooked(false); setBookModal(false); setForm({ petId: pets[0]?.id || "", date:"", time:"10:00", type:"consulta", notes:"" }); }, 2500);
    } finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.appBg, fontFamily:T.font }}>
      {/* Header */}
      <div style={{ background:T.sb, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 36px", height:64, boxShadow:"0 2px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#1d6b3f,#2d9a5c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🐾</div>
          <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"0.04em" }}>MOGA</div>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.15)", margin:"0 8px" }}/>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600 }}>Portal Cliente</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Avatar name={currentUser.name} size={34} bg={T.gold}/>
          <span style={{ color:"rgba(255,255,255,0.75)", fontSize:14, fontWeight:500 }}>{currentUser.name.split(" ")[0]}</span>
          <Btn v="ghost" style={{ color:"rgba(255,255,255,0.6)", borderColor:"rgba(255,255,255,0.15)", padding:"7px 14px", fontSize:13 }} onClick={logout}>Salir</Btn>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"28px 24px 56px" }}>
        {/* Banner bienvenida */}
        <div style={{ background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, borderRadius:20, padding:"24px 32px", marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:T.lg }}>
          <div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:600, marginBottom:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>Bienvenido/a de regreso</div>
            <div style={{ fontSize:26, fontWeight:900, color:"#fff", fontFamily:T.font, lineHeight:1 }}>{currentUser.name}</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:6 }}>RUT: {currentUser.rut} · {currentUser.phone}</div>
          </div>
          <Btn v="accent" onClick={() => setBookModal(true)}>🗓 Agendar cita</Btn>
        </div>

        {/* Alertas */}
        {myVaxAlert.length > 0 && (
          <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:14, padding:"14px 20px", marginBottom:12, display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:20 }}>💉</span>
            <div style={{ fontSize:13, color:T.amberText }}>
              <strong>{myVaxAlert.length} vacuna{myVaxAlert.length !== 1 ? "s" : ""}</strong> de tus mascotas requieren atención. Contáctanos para agendar.
            </div>
          </div>
        )}
        {myPayPend.length > 0 && (
          <div style={{ background:"#eff6ff", border:"1px solid #93c5fd", borderRadius:14, padding:"14px 20px", marginBottom:12, display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:20 }}>💳</span>
            <div style={{ fontSize:13, color:T.blueText }}>Tienes <strong>{fmtCLP(myPayPend.reduce((s, p) => s + p.amount, 0))}</strong> en pagos pendientes.</div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:T.panel, borderRadius:12, padding:4, boxShadow:T.sm, width:"fit-content" }}>
          {[ ["pets","🐾 Mascotas"],["agenda","🗓 Agenda"],["grooming","✂️ Peluquería"],["payments","💳 Pagos"],["vaccines","💉 Vacunas"] ].map(([id,lbl]) => (
            <button key={id} onClick={() => { setTab(id); setSelPet(null); }} style={{ padding:"9px 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:tab===id?700:500, borderRadius:9, fontFamily:T.font, background:tab===id?T.brand:"transparent", color:tab===id?"#fff":T.textMuted, transition:"all 0.15s" }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Mascotas */}
        {tab === "pets" && !selPet && (
          pets.length === 0
            ? <div style={{ textAlign:"center", padding:60, color:T.textMuted, background:T.panel, borderRadius:16 }}><div style={{ fontSize:52, marginBottom:12 }}>🐾</div><div>Aún no tienes mascotas registradas en MOGA.</div></div>
            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:14 }}>
                {pets.map((pet) => {
                  const recs = records.filter((r) => r.petId === pet.id);
                  return (
                    <div key={pet.id} className="hover-lift" onClick={() => setSelPet(pet)} style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, border:`1px solid ${T.border}`, overflow:"hidden", cursor:"pointer" }}>
                      <div style={{ background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, padding:20, textAlign:"center" }}><div style={{ fontSize:48 }}>{spIcon(pet.species)}</div></div>
                      <div style={{ padding:"14px 16px" }}>
                        <div style={{ fontSize:17, fontWeight:800, color:T.text }}>{pet.name}</div>
                        <div style={{ fontSize:13, color:T.textMuted }}>{pet.breed}</div>
                        <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{pet.age}a · {pet.weight}kg</div>
                        <div style={{ fontSize:12, color:T.gold, fontWeight:700, marginTop:8 }}>📋 {recs.length} ficha{recs.length !== 1 ? "s" : ""} →</div>
                      </div>
                    </div>
                  );
                })}
              </div>
        )}

        {tab === "pets" && selPet && (
          <div>
            <button onClick={() => setSelPet(null)} style={{ background:"none", border:"none", color:T.gold, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:T.font, display:"flex", alignItems:"center", gap:6, marginBottom:18, padding:0 }}>← Volver</button>
            <div style={{ display:"grid", gridTemplateColumns:"250px 1fr", gap:18 }}>
              <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, overflow:"hidden" }}>
                <div style={{ background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, padding:24, textAlign:"center" }}>
                  <div style={{ fontSize:56, marginBottom:6 }}>{spIcon(selPet.species)}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:"#fff" }}>{selPet.name}</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{selPet.breed}</div>
                </div>
                <div style={{ padding:"16px 18px" }}>
                  {[ ["Especie",selPet.species],["Género",selPet.gender],["Edad",`${selPet.age} años`],["Peso",`${selPet.weight} kg`],["Color",selPet.color] ].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
                      <span style={{ color:T.textMuted }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, padding:"24px 28px" }}>
                <div style={{ fontSize:18, fontWeight:800, color:T.text, marginBottom:20 }}>📋 Historial médico</div>
                {records.filter((r) => r.petId === selPet.id).sort((a,b) => b.date.localeCompare(a.date)).map((r, i, arr) => (
                  <div key={r.id} style={{ display:"flex", gap:16, marginBottom: i===arr.length-1?0:20, position:"relative" }}>
                    {arr.length > 1 && i < arr.length-1 && <div style={{ position:"absolute", left:18, top:38, bottom:-20, width:2, background:T.border }}/>}
                    <div style={{ width:36, height:36, borderRadius:"50%", background:T.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, zIndex:1 }}>
                      {r.type==="Urgencia"?"🚨":r.type==="Cirugía"?"🔬":r.type==="Vacunación"?"💉":"📋"}
                    </div>
                    <div style={{ flex:1, background:T.appBg, borderRadius:12, padding:"14px 16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontWeight:800, fontSize:14 }}>{fmtDate(r.date)}</span>
                        <TypeBadge type={r.type}/>
                      </div>
                      <div style={{ fontSize:13, marginBottom:4 }}><strong>Diagnóstico:</strong> {r.diagnosis}</div>
                      {r.treatment && <div style={{ fontSize:13, marginBottom:4 }}><strong>Tratamiento:</strong> {r.treatment}</div>}
                      <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>Dr/a: {r.vet} · {r.weight}kg · {r.temperature}°C</div>
                      {r.notes && <div style={{ fontSize:12, background:T.panel, padding:"8px 10px", borderRadius:8, marginTop:8, borderLeft:`3px solid ${T.brand}`, color:T.textMuted }}>📝 {r.notes}</div>}
                      {r.nextVisit && <div style={{ fontSize:12, color:T.brandMid, fontWeight:700, marginTop:8 }}>🗓 Próxima: {fmtDate(r.nextVisit)}</div>}
                    </div>
                  </div>
                ))}
                {records.filter((r) => r.petId === selPet.id).length === 0 && <div style={{ color:T.textMuted, fontSize:14 }}>Sin fichas médicas aún.</div>}
              </div>
            </div>
          </div>
        )}

        {/* Citas peluquería */}
        {/* Agenda */}
        {tab === "agenda" && (
          <div style={{ display:"grid", gap:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={{ fontSize:16, fontWeight:800, color:T.text }}>Mis próximas citas</div>
              <Btn v="accent" style={{ padding:"8px 18px" }} onClick={() => setBookModal(true)}>+ Agendar cita</Btn>
            </div>
            {upcomingAppts.length === 0
              ? <div style={{ textAlign:"center", padding:60, color:T.textMuted, background:T.panel, borderRadius:16 }}>
                  <div style={{ fontSize:52, marginBottom:12 }}>🗓</div>
                  <div style={{ marginBottom:16 }}>No tienes citas próximas.</div>
                  <Btn v="accent" onClick={() => setBookModal(true)}>Agendar mi primera cita</Btn>
                </div>
              : myAppts.map((a) => {
                  const pet = pets.find((p) => p.id === a.petId);
                  const typeLabel = { consulta:"🩺 Consulta", control:"📋 Control", vacuna:"💉 Vacuna", peluqueria:"✂️ Peluquería", urgencia:"🚨 Urgencia", otro:"📌 Otro" };
                  const statusColor = { pendiente:{ bg:T.amber, color:T.amberText }, confirmada:{ bg:T.green, color:T.greenText }, completada:{ bg:T.blue, color:T.blueText }, cancelada:{ bg:T.red, color:T.redText } };
                  const sc = statusColor[a.status] || statusColor.pendiente;
                  const isPast = a.date < new Date().toISOString().slice(0,10);
                  return (
                    <div key={a.id} style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"18px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", opacity: isPast ? 0.6 : 1 }}>
                      <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                        <div style={{ width:50, height:50, borderRadius:14, background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{spIcon(pet?.species)}</div>
                        <div>
                          <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{pet?.name}</div>
                          <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{typeLabel[a.type] || a.type}</div>
                          {a.notes && <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>📝 {a.notes}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:700, marginBottom:6 }}>📅 {fmtDate(a.date)} · {a.time}</div>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:sc.bg, color:sc.color, fontSize:12, fontWeight:600 }}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                        {a.status === "pendiente" && <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>El equipo MOGA confirmará tu cita pronto.</div>}
                        {a.status === "confirmada" && <div style={{ fontSize:11, color:T.greenText, marginTop:6, fontWeight:600 }}>✓ Cita confirmada</div>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {tab === "grooming" && (
          grooming.length === 0
            ? <div style={{ textAlign:"center", padding:60, color:T.textMuted, background:T.panel, borderRadius:16 }}>
                <div style={{ fontSize:52, marginBottom:12 }}>✂️</div>
                <div>No tienes citas agendadas.</div>
                <Btn v="accent" style={{ marginTop:18 }} onClick={() => setBookModal(true)}>Agendar mi primera cita</Btn>
              </div>
            : <div style={{ display:"grid", gap:12 }}>
                {[...grooming].sort((a,b) => a.date.localeCompare(b.date)).map((g) => {
                  const pet = pets.find((p) => p.id === g.petId);
                  return (
                    <div key={g.id} style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"18px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                        <div style={{ width:50, height:50, borderRadius:14, background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{spIcon(pet?.species)}</div>
                        <div>
                          <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{pet?.name}</div>
                          <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{g.service}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:700, marginBottom:6 }}>📅 {fmtDate(g.date)} · {g.time}</div>
                        <div style={{ marginBottom:6 }}><StatusBadge status={g.status}/></div>
                        <div style={{ fontSize:15, fontWeight:800, color:T.brand }}>{fmtCLP(g.price)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
        )}

        {/* Pagos */}
        {tab === "payments" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
              <KpiCard label="Total facturado" value={fmtCLP(payments.reduce((s,p)=>s+p.amount,0))} icon="🧾" gradient="linear-gradient(135deg,#1e3a5f,#2563eb)" delay="2"/>
              <KpiCard label="Pagado"    value={fmtCLP(payments.filter(p=>p.status==="pagado").reduce((s,p)=>s+p.amount,0))} icon="✅" gradient={`linear-gradient(135deg,${T.brand},${T.brandMid})`} delay="3"/>
              <KpiCard label="Pendiente" value={fmtCLP(payments.filter(p=>p.status==="pendiente").reduce((s,p)=>s+p.amount,0))} icon="⏳" gradient={`linear-gradient(135deg,#78350f,${T.gold})`} delay="4"/>
            </div>
            <TableWrap heads={["Concepto","Mascota","Fecha","Monto","Método","Estado"]}>
              {[...payments].sort((a,b)=>b.date.localeCompare(a.date)).map((p) => {
                const pet = pets.find((pt) => pt.id === p.petId);
                return (
                  <TR key={p.id}>
                    <TD bold><div style={{ maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.concept}</div></TD>
                    <TD>{pet ? `${spIcon(pet.species)} ${pet.name}` : "—"}</TD>
                    <TD>{fmtDate(p.date)}</TD>
                    <TD><span style={{ fontWeight:700, color:p.status==="pagado"?T.greenText:T.amberText }}>{fmtCLP(p.amount)}</span></TD>
                    <TD muted>{p.method || "—"}</TD>
                    <TD>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:p.status==="pagado"?T.green:T.amber, color:p.status==="pagado"?T.greenText:T.amberText, fontSize:12, fontWeight:600 }}>
                        <Dot color={p.status==="pagado"?"#22c55e":"#f59e0b"}/>{p.status==="pagado"?"Pagado":"Pendiente"}
                      </span>
                    </TD>
                  </TR>
                );
              })}
            </TableWrap>
          </div>
        )}

        {/* Vacunas */}
        {tab === "vaccines" && (
          <div>
            {myVaxAlert.length > 0 && (
              <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:14, padding:"16px 20px", marginBottom:16 }}>
                <div style={{ fontWeight:700, color:T.amberText, marginBottom:8 }}>💉 Vacunas que requieren atención</div>
                {myVaxAlert.map((v) => {
                  const pet = pets.find((p) => p.id === v.petId);
                  const st  = vaxStatus(v.nextDue);
                  return (
                    <div key={v.id} style={{ fontSize:13, color:T.amberText, padding:"5px 0", borderTop:"1px solid #fde68a" }}>
                      {spIcon(pet?.species)} <strong>{pet?.name}</strong> — {v.name}: {st.label}
                    </div>
                  );
                })}
              </div>
            )}
            <TableWrap heads={["Mascota","Vacuna","Aplicada","Próxima dosis","Estado"]}>
              {vaccines.map((v) => {
                const pet = pets.find((p) => p.id === v.petId);
                return (
                  <TR key={v.id}>
                    <TD bold><div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:28, height:28, borderRadius:7, background:T.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{spIcon(pet?.species)}</div>{pet?.name}</div></TD>
                    <TD bold>{v.name}</TD>
                    <TD>{fmtDate(v.dateApplied)}</TD>
                    <TD><span style={{ fontWeight:600 }}>{fmtDate(v.nextDue)}</span></TD>
                    <TD><span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:vaxStatus(v.nextDue).key==="green"?T.greenBg:vaxStatus(v.nextDue).key==="amber"?T.amberBg:T.redBg, color:vaxStatus(v.nextDue).key==="green"?T.greenText:vaxStatus(v.nextDue).key==="amber"?T.amberText:T.redText, fontSize:12, fontWeight:600 }}>{vaxStatus(v.nextDue).short}</span></TD>
                  </TR>
                );
              })}
            </TableWrap>
          </div>
        )}
      </div>

      {/* Modal agendar cita */}
      {bookModal && (
        <Modal title="Solicitar cita" sub="Tu solicitud será confirmada por el equipo MOGA" onClose={() => setBookModal(false)}>
          {booked ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:T.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>✅</div>
              <div style={{ fontSize:20, fontWeight:800, color:T.greenText, marginBottom:6 }}>¡Cita solicitada!</div>
              <div style={{ fontSize:14, color:T.textMuted }}>El equipo MOGA confirmará tu cita pronto. La verás en la pestaña Agenda.</div>
            </div>
          ) : (
            <>
              <Select label="Tipo de cita *" value={form.type} onChange={(e) => setForm({...form, type:e.target.value})}>
                {APPT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
              <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({...form, petId:e.target.value})}>
                <option value="">— Seleccionar —</option>
                {pets.map((p) => <option key={p.id} value={p.id}>{spIcon(p.species)} {p.name}</option>)}
              </Select>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <Input label="Fecha deseada *" type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})}/>
                <Input label="Hora preferida"  type="time" value={form.time} onChange={(e) => setForm({...form, time:e.target.value})}/>
              </div>
              <Input label="Notas o instrucciones" value={form.notes} onChange={(e) => setForm({...form, notes:e.target.value})} placeholder="Ej: síntomas, alergias, instrucciones especiales…"/>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <Btn v="ghost" onClick={() => setBookModal(false)}>Cancelar</Btn>
                <Btn v="accent" onClick={book} disabled={saving || !form.petId || !form.date}>
                  {saving ? "Enviando…" : "Solicitar cita →"}
                </Btn>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
