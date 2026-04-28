import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { fmtDate, spIcon, vaxStatus } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import { TableWrap, TR, TD } from "../../components/layout/Table.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import Label  from "../../components/ui/Label.jsx";
import VaxBadge  from "../../components/ui/badges/VaxBadge.jsx";
import TypeBadge from "../../components/ui/badges/TypeBadge.jsx";

const EMPTY_FORM = { name:"", species:"Perro", breed:"", age:"", weight:"", color:"", gender:"Hembra", chip:"", ownerId:"" };

export default function PetsView() {
  const { pets, users, records, vaccines, addPet } = useApp();
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);

  const clients  = users.filter((u) => u.role === "client");
  const filtered = pets.filter((p) => [p.name, p.breed].join(" ").toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    if (!form.name || !form.ownerId) return;
    await addPet({ ...form, age: +form.age, weight: +form.weight, ownerId: +form.ownerId });
    setModal(false);
    setForm(EMPTY_FORM);
  };

  if (selected) {
    const owner   = users.find((u) => u.id === selected.ownerId);
    const petRecs = records.filter((r) => r.petId === selected.id).sort((a, b) => b.date.localeCompare(a.date));
    const petVax  = vaccines.filter((v) => v.petId === selected.id);
    return (
      <div style={{ padding:"0 36px 36px" }}>
        <div style={{ paddingTop:28, marginBottom:16 }}>
          <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:T.gold, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:T.font, display:"flex", alignItems:"center", gap:6, padding:0 }}>
            ← Volver a mascotas
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(160deg,${T.brand},${T.brandMid})`, padding:"28px 24px", textAlign:"center" }}>
                <div style={{ fontSize:64, marginBottom:8 }}>{spIcon(selected.species)}</div>
                <div style={{ fontSize:24, fontWeight:800, color:"#fff", fontFamily:T.font }}>{selected.name}</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.65)", marginTop:3 }}>{selected.breed}</div>
              </div>
              <div style={{ padding:"16px 20px" }}>
                {[ ["Especie",selected.species],["Género",selected.gender],["Edad",`${selected.age} años`],["Peso",`${selected.weight} kg`],["Color",selected.color],["Microchip",selected.chip||"No registrado"] ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}`, fontSize:13, fontFamily:T.font }}>
                    <span style={{ color:T.textMuted }}>{k}</span>
                    <span style={{ fontWeight:600, color:T.text }}>{v}</span>
                  </div>
                ))}
              </div>
              {owner && (
                <div style={{ margin:"0 16px 16px", background:T.appBg, borderRadius:10, padding:"12px 14px" }}>
                  <Label>Propietario</Label>
                  <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{owner.name}</div>
                  <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{owner.rut} · {owner.phone}</div>
                </div>
              )}
            </div>
            <div style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"18px 20px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:12 }}>💉 Vacunas</div>
              {petVax.length === 0 && <div style={{ color:T.textMuted, fontSize:13 }}>Sin vacunas registradas.</div>}
              {petVax.map((v) => (
                <div key={v.id} style={{ padding:"8px 0", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{v.name}</div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{fmtDate(v.dateApplied)} → {fmtDate(v.nextDue)}</div>
                  </div>
                  <VaxBadge nextDue={v.nextDue}/>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:T.panel, borderRadius:16, boxShadow:T.md, padding:"24px 28px" }}>
            <div style={{ fontSize:18, fontWeight:800, color:T.text, fontFamily:T.font, marginBottom:24 }}>📋 Historial médico</div>
            {petRecs.length === 0 && <div style={{ color:T.textMuted, fontSize:14 }}>Sin fichas médicas registradas.</div>}
            <div style={{ position:"relative" }}>
              {petRecs.length > 1 && <div style={{ position:"absolute", left:19, top:20, bottom:20, width:2, background:T.border }}/>}
              {petRecs.map((r, i) => (
                <div key={r.id} style={{ display:"flex", gap:18, marginBottom: i === petRecs.length-1 ? 0 : 24, position:"relative", zIndex:1 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:T.brandLight, border:`3px solid ${T.panel}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, boxShadow:T.sm }}>
                    {r.type==="Urgencia"?"🚨":r.type==="Cirugía"?"🔬":r.type==="Vacunación"?"💉":"📋"}
                  </div>
                  <div style={{ flex:1, background:T.appBg, borderRadius:12, padding:"16px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{fmtDate(r.date)}</span>
                        <span style={{ marginLeft:10 }}><TypeBadge type={r.type}/></span>
                      </div>
                      <span style={{ fontSize:12, color:T.textMuted }}>{r.vet}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px", marginBottom: r.notes ? 10 : 0 }}>
                      {[ ["Diagnóstico",r.diagnosis],["Tratamiento",r.treatment||"—"],["Peso",`${r.weight} kg`],["Temperatura",`${r.temperature}°C`] ].map(([k,v]) => (
                        <div key={k}>
                          <div style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>{k}</div>
                          <div style={{ fontSize:13, color:T.text }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {r.notes && <div style={{ fontSize:13, color:T.textMuted, background:T.panel, padding:"8px 12px", borderRadius:8, marginTop:8, borderLeft:`3px solid ${T.brand}`, lineHeight:1.5 }}>📝 {r.notes}</div>}
                    {r.nextVisit && <div style={{ fontSize:12, color:T.brandMid, fontWeight:600, marginTop:10 }}>🗓 Próxima visita: {fmtDate(r.nextVisit)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:"0 36px 36px" }}>
      <PageTitle icon="🐾" title="Mascotas" sub={`${pets.length} mascotas registradas en MOGA`} action={<Btn v="accent" onClick={() => setModal(true)}>+ Nueva mascota</Btn>}/>
      <div style={{ position:"relative", marginBottom:20 }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, color:T.textMuted }}>🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o raza..." className="moga-input"
          style={{ padding:"11px 14px 11px 40px", border:`1.5px solid ${T.border}`, borderRadius:12, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font, width:320, boxShadow:T.sm }}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
        {filtered.map((pet) => {
          const owner   = users.find((u) => u.id === pet.ownerId);
          const recs    = records.filter((r) => r.petId === pet.id);
          const petVax  = vaccines.filter((v) => v.petId === pet.id);
          const urgent  = petVax.filter((v) => vaxStatus(v.nextDue).key !== "green");
          return (
            <div key={pet.id} className="hover-lift" onClick={() => setSelected(pet)}
              style={{ background:T.panel, borderRadius:16, boxShadow:T.sm, border:`1px solid ${T.border}`, overflow:"hidden", cursor:"pointer" }}>
              <div style={{ background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, padding:"20px", textAlign:"center" }}>
                <div style={{ fontSize:48 }}>{spIcon(pet.species)}</div>
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontSize:17, fontWeight:800, color:T.text, fontFamily:T.font }}>{pet.name}</div>
                <div style={{ fontSize:13, color:T.textMuted }}>{pet.breed}</div>
                <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{pet.age}a · {pet.weight}kg</div>
                <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{owner?.name}</div>
                {urgent.length > 0 && <div style={{ fontSize:11, color:T.redText, fontWeight:600, marginTop:6 }}>⚠ {urgent.length} vacuna{urgent.length>1?"s":""} urgente{urgent.length>1?"s":""}</div>}
                <div style={{ fontSize:12, color:T.gold, fontWeight:700, marginTop:6 }}>📋 {recs.length} ficha{recs.length !== 1 ? "s" : ""} →</div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title="Registrar nueva mascota" onClose={() => setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Input label="Nombre *"       value={form.name}    onChange={(e) => setForm({...form, name:e.target.value})}    placeholder="Luna"/>
            <Select label="Especie"       value={form.species} onChange={(e) => setForm({...form, species:e.target.value})}>
              {["Perro","Gato","Conejo","Ave","Otro"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Raza"           value={form.breed}   onChange={(e) => setForm({...form, breed:e.target.value})}   placeholder="Labrador Dorado"/>
            <Select label="Género"        value={form.gender}  onChange={(e) => setForm({...form, gender:e.target.value})}>
              <option>Hembra</option><option>Macho</option>
            </Select>
            <Input label="Edad (años)"    type="number" value={form.age}    onChange={(e) => setForm({...form, age:e.target.value})}    placeholder="3"/>
            <Input label="Peso (kg)"      type="number" step="0.1" value={form.weight} onChange={(e) => setForm({...form, weight:e.target.value})} placeholder="25.5"/>
            <Input label="Color"          value={form.color}   onChange={(e) => setForm({...form, color:e.target.value})}   placeholder="Dorado"/>
            <Input label="Microchip"      value={form.chip}    onChange={(e) => setForm({...form, chip:e.target.value})}    placeholder="985141..."/>
          </div>
          <Select label="Propietario *" value={form.ownerId} onChange={(e) => setForm({...form, ownerId:e.target.value})}>
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.rut}</option>)}
          </Select>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={save}>Guardar mascota</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
