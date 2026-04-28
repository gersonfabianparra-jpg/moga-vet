import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { spIcon } from "../../styles/helpers.js";
import PageTitle from "../../components/layout/PageTitle.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import Label  from "../../components/ui/Label.jsx";
import Avatar from "../../components/ui/Avatar.jsx";

const EMPTY = { name:"", email:"", rut:"", phone:"", password:"cliente123" };

export default function UsersView() {
  const { users, pets, addUser } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(EMPTY);

  const clients = users.filter((u) => u.role === "client");
  const staff   = users.filter((u) => u.role !== "client");

  const save = async () => {
    if (!form.name || !form.email || !form.rut) return;
    await addUser(form);
    setModal(false);
    setForm(EMPTY);
  };

  return (
    <div style={{ padding:"0 36px 36px" }}>
      <PageTitle icon="👥" title="Clientes & Personal" sub={`${clients.length} clientes · ${staff.length} personal`} action={<Btn v="accent" onClick={() => setModal(true)}>+ Nuevo cliente</Btn>}/>

      <div style={{ marginBottom:24 }}>
        <Label>Personal MOGA</Label>
        <div style={{ display:"flex", gap:14, marginTop:10 }}>
          {staff.map((u) => (
            <div key={u.id} style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <Avatar name={u.name} size={46} bg={T.brand}/>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.text, fontFamily:T.font }}>{u.name}</div>
                <div style={{ fontSize:12, color:T.textMuted, textTransform:"capitalize", marginTop:2 }}>{u.role==="admin"?"Administrador":"Veterinario/a"}</div>
                <div style={{ fontSize:12, color:T.textMuted, marginTop:1 }}>{u.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:12 }}><Label>Clientes registrados</Label></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
        {clients.map((c) => {
          const myPets = pets.filter((p) => p.ownerId === c.id);
          return (
            <div key={c.id} className="hover-lift" style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
                <Avatar name={c.name} size={44} bg="rgba(255,255,255,0.2)"/>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:T.font }}>{c.name}</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>RUT: {c.rut}</div>
                </div>
              </div>
              <div style={{ padding:"14px 20px" }}>
                <div style={{ fontSize:13, color:T.textMuted, marginBottom:4 }}>📧 {c.email}</div>
                <div style={{ fontSize:13, color:T.textMuted, marginBottom:12 }}>📱 {c.phone}</div>
                <div style={{ paddingTop:10, borderTop:`1px solid ${T.border}`, fontSize:13, display:"flex", gap:8, flexWrap:"wrap" }}>
                  {myPets.length > 0
                    ? myPets.map((p) => (
                        <span key={p.id} style={{ display:"inline-flex", alignItems:"center", gap:4, background:T.brandLight, color:T.brand, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                          {spIcon(p.species)} {p.name}
                        </span>
                      ))
                    : <span style={{ color:T.textMuted, fontSize:12 }}>Sin mascotas registradas</span>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title="Registrar nuevo cliente" onClose={() => setModal(false)}>
          <Input label="Nombre completo *" value={form.name}     onChange={(e) => setForm({...form, name:e.target.value})}     placeholder="María Torres"/>
          <Input label="RUT *"             value={form.rut}      onChange={(e) => setForm({...form, rut:e.target.value})}      placeholder="12.345.678-9"/>
          <Input label="Correo *" type="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})}   placeholder="cliente@email.cl"/>
          <Input label="Teléfono"          value={form.phone}    onChange={(e) => setForm({...form, phone:e.target.value})}    placeholder="+56 9 1234 5678"/>
          <Input label="Contraseña inicial" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})}/>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={save}>Registrar cliente</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
