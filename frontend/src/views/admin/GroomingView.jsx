import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
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

export default function GroomingView() {
  const { grooming, pets, users, addGrooming, updateGroomingStatus } = useApp();
  const [view, setView]       = useState("calendar");
  const [filter, setFilter]   = useState("todas");
  const [modal, setModal]     = useState(false);
  const [calYear, setCalYear] = useState(NOW.getFullYear());
  const [calMonth, setCalMonth] = useState(NOW.getMonth());
  const [form, setForm]       = useState(EMPTY);

  const clients = users.filter((u) => u.role === "client");
  const display = (filter === "todas" ? grooming : grooming.filter((g) => g.status === filter))
    .sort((a, b) => a.date.localeCompare(b.date));
  const days = calDays(calYear, calMonth);
  const todayD = new Date().getFullYear() === calYear && new Date().getMonth() === calMonth ? new Date().getDate() : null;

  const getAppts = (day) => {
    const ds = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return grooming.filter((g) => g.date === ds);
  };

  const save = async () => {
    if (!form.petId || !form.clientId || !form.date) return;
    await addGrooming({ ...form, petId:+form.petId, clientId:+form.clientId, price:+form.price });
    setModal(false);
    setForm(EMPTY);
  };

  return (
    <div style={{ padding:"0 36px 36px" }}>
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
                    {appts.map((a) => { const pet=pets.find((p)=>p.id===a.petId); const col=ST_COLORS[a.status]||"#94a3b8"; return (
                      <div key={a.id} title={`${pet?.name} — ${a.service}`} style={{ fontSize:10, background:`${col}18`, borderLeft:`3px solid ${col}`, borderRadius:"0 5px 5px 0", padding:"2px 5px", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:600, color:col }}>
                        {a.time} {pet?.name}
                      </div>
                    );})}
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:14, marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
              {[ ["confirmada","#22c55e"],["pendiente","#f59e0b"],["completada","#94a3b8"],["cancelada","#ef4444"] ].map(([s,col]) => (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                  <div style={{ width:3, height:14, borderRadius:2, background:col }}/><span style={{ color:T.textMuted, textTransform:"capitalize" }}>{s}</span>
                </div>
              ))}
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
            {display.map((g) => { const pet=pets.find((p)=>p.id===g.petId), client=users.find((u)=>u.id===g.clientId); return (
              <div key={g.id} style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, flex:1 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{spIcon(pet?.species)}</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{pet?.name} <span style={{ fontWeight:400, color:T.textMuted, fontSize:14 }}>· {client?.name}</span></div>
                    <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{g.service}</div>
                    {g.notes && <div style={{ fontSize:12, color:T.textMuted, fontStyle:"italic", marginTop:3 }}>📝 {g.notes}</div>}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:6 }}>📅 {fmtDate(g.date)} · {g.time}</div>
                  <div style={{ marginBottom:8 }}><StatusBadge status={g.status}/></div>
                  <div style={{ fontSize:15, fontWeight:800, color:T.brand }}>{fmtCLP(g.price)}</div>
                  <div style={{ display:"flex", gap:6, justifyContent:"flex-end", marginTop:6 }}>
                    {g.status === "pendiente"   && <><Btn v="sm_green" onClick={() => updateGroomingStatus(g.id,"confirmada")}>✓ Confirmar</Btn><Btn v="sm_red" onClick={() => updateGroomingStatus(g.id,"cancelada")}>✗</Btn></>}
                    {g.status === "confirmada"  && <Btn v="sm_gray"  onClick={() => updateGroomingStatus(g.id,"completada")}>✓ Completar</Btn>}
                  </div>
                </div>
              </div>
            );})}
            {display.length === 0 && <div style={{ textAlign:"center", padding:48, color:T.textMuted, fontSize:14, background:T.panel, borderRadius:14 }}>Sin citas en esta categoría.</div>}
          </div>
        </>
      )}

      {modal && (
        <Modal title="Agendar cita de peluquería" onClose={() => setModal(false)}>
          <Select label="Cliente *" value={form.clientId} onChange={(e) => setForm({...form, clientId:e.target.value, petId:""})}>
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.rut}</option>)}
          </Select>
          <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({...form, petId:e.target.value})}>
            <option value="">Seleccionar mascota...</option>
            {pets.filter((p) => !form.clientId || p.ownerId === +form.clientId).map((p) => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
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
