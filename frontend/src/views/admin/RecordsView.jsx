import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { fmtDate, spIcon } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import { TableWrap, TR, TD } from "../../components/layout/Table.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import TypeBadge from "../../components/ui/badges/TypeBadge.jsx";

const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY = { petId:"", date:TODAY, vet:"", type:"Control", diagnosis:"", treatment:"", weight:"", temperature:"", notes:"", nextVisit:"" };

export default function RecordsView() {
  const { records, pets, users, addRecord } = useApp();
  const [search, setSearch]       = useState("");
  const [petFilter, setPetFilter] = useState("");
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY);

  const vets = users.filter((u) => u.role !== "client");
  const filtered = records
    .filter((r) => {
      const pet = pets.find((p) => p.id === r.petId);
      const q   = search.toLowerCase();
      return (!q || pet?.name.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q))
          && (!petFilter || r.petId === +petFilter);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const save = async () => {
    if (!form.petId || !form.diagnosis) return;
    await addRecord({ ...form, petId:+form.petId, weight:+form.weight });
    setModal(false);
    setForm(EMPTY);
  };

  return (
    <div style={{ padding:"0 36px 36px" }}>
      <PageTitle icon="📋" title="Fichas médicas" sub={`${records.length} registros clínicos`} action={<Btn v="accent" onClick={() => setModal(true)}>+ Nueva ficha</Btn>}/>

      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.textMuted }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="moga-input"
            style={{ padding:"10px 14px 10px 36px", border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font, width:240 }}/>
        </div>
        <select value={petFilter} onChange={(e) => setPetFilter(e.target.value)} className="moga-input"
          style={{ padding:"10px 14px", border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font }}>
          <option value="">Todas las mascotas</option>
          {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <TableWrap heads={["Mascota","Fecha","Tipo","Diagnóstico","Peso","Temperatura","Veterinario/a","Próx. visita"]} empty={filtered.length === 0 ? "Sin registros encontrados." : undefined}>
        {filtered.map((r) => {
          const pet = pets.find((p) => p.id === r.petId);
          return (
            <TR key={r.id}>
              <TD bold><div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:32, height:32, borderRadius:8, background:T.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{spIcon(pet?.species)}</div>{pet?.name}</div></TD>
              <TD>{fmtDate(r.date)}</TD>
              <TD><TypeBadge type={r.type}/></TD>
              <TD><div style={{ maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:T.textMid }}>{r.diagnosis}</div></TD>
              <TD>{r.weight}kg</TD>
              <TD>{r.temperature}°C</TD>
              <TD muted>{r.vet.replace("Dra. ","").replace("Dr. ","")}</TD>
              <TD>{r.nextVisit ? <span style={{ color:T.brandMid, fontWeight:600, fontSize:13 }}>{fmtDate(r.nextVisit)}</span> : <span style={{ color:T.textMuted }}>—</span>}</TD>
            </TR>
          );
        })}
      </TableWrap>

      {modal && (
        <Modal title="Nueva ficha médica" onClose={() => setModal(false)}>
          <Select label="Mascota *" value={form.petId} onChange={(e) => setForm({...form, petId:e.target.value})}>
            <option value="">Seleccionar...</option>
            {pets.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
          </Select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Input label="Fecha *" type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})}/>
            <Select label="Tipo" value={form.type} onChange={(e) => setForm({...form, type:e.target.value})}>
              {["Control","Urgencia","Cirugía","Vacunación"].map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Input label="Peso (kg)" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({...form, weight:e.target.value})} placeholder="25.5"/>
            <Input label="Temperatura (°C)" value={form.temperature} onChange={(e) => setForm({...form, temperature:e.target.value})} placeholder="38.5"/>
          </div>
          <Select label="Veterinario/a" value={form.vet} onChange={(e) => setForm({...form, vet:e.target.value})}>
            <option value="">Seleccionar...</option>
            {vets.map((v) => <option key={v.id}>{v.name}</option>)}
          </Select>
          <Input label="Diagnóstico *" value={form.diagnosis} onChange={(e) => setForm({...form, diagnosis:e.target.value})} placeholder="Ej: Control rutinario. Animal sano."/>
          <Input label="Tratamiento" value={form.treatment} onChange={(e) => setForm({...form, treatment:e.target.value})} placeholder="Ej: Vacuna antirrábica"/>
          <Input label="Notas" textarea value={form.notes} onChange={(e) => setForm({...form, notes:e.target.value})} placeholder="Observaciones adicionales..."/>
          <Input label="Próxima visita" type="date" value={form.nextVisit} onChange={(e) => setForm({...form, nextVisit:e.target.value})}/>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={save}>Guardar ficha</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
