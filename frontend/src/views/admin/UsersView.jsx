import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useNotify } from "../../context/NotificationContext.jsx";
import T from "../../styles/tokens.js";
import PageTitle from "../../components/layout/PageTitle.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import Label  from "../../components/ui/Label.jsx";
import Avatar from "../../components/ui/Avatar.jsx";

const EMPTY_CLIENT = { name:"", email:"", rut:"", phone:"", password:"cliente123", role:"client" };
const EMPTY_STAFF  = { name:"", email:"", phone:"", password:"", role:"vet", avatar:"" };

const ROLE_LABEL = { admin:"Administrador", vet:"Veterinario/a", client:"Cliente" };
const ROLE_COLOR = { admin: T.brand, vet: "#7c3aed", client: "#0284c7" };

export default function UsersView() {
  const { users, pets, currentUser, addUser, updateUser, removeUser } = useApp();
  const notify = useNotify();

  const [modalClient, setModalClient] = useState(false);
  const [modalStaff,  setModalStaff]  = useState(false);
  const [modalEdit,   setModalEdit]   = useState(null);  // user object
  const [confirmDel,  setConfirmDel]  = useState(null);  // user object

  const [formClient, setFormClient] = useState(EMPTY_CLIENT);
  const [formStaff,  setFormStaff]  = useState(EMPTY_STAFF);
  const [formEdit,   setFormEdit]   = useState({});
  const [loading,    setLoading]    = useState(false);

  const isRoot = currentUser?.isRoot;

  const clients = users.filter((u) => u.role === "client");
  const staff   = users.filter((u) => u.role !== "client");

  const saveClient = async () => {
    if (!formClient.name || !formClient.email || !formClient.rut) return;
    setLoading(true);
    try {
      await addUser(formClient);
      setModalClient(false);
      setFormClient(EMPTY_CLIENT);
      notify("Cliente registrado correctamente.", "success");
    } catch {
      notify("Error al registrar el cliente.", "error");
    } finally { setLoading(false); }
  };

  const saveStaff = async () => {
    if (!formStaff.name || !formStaff.email || !formStaff.password) return;
    setLoading(true);
    try {
      await addUser(formStaff);
      setModalStaff(false);
      setFormStaff(EMPTY_STAFF);
      notify("Personal registrado correctamente.", "success");
    } catch {
      notify("Error al registrar el personal.", "error");
    } finally { setLoading(false); }
  };

  const openEdit = (u) => {
    setFormEdit({ name: u.name, email: u.email, phone: u.phone || "", rut: u.rut || "", role: u.role, password: "" });
    setModalEdit(u);
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      const fields = { ...formEdit };
      if (!fields.password) delete fields.password;
      await updateUser(modalEdit.id, fields);
      setModalEdit(null);
      notify("Usuario actualizado correctamente.", "success");
    } catch {
      notify("Error al actualizar el usuario.", "error");
    } finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await removeUser(confirmDel.id);
      setConfirmDel(null);
      notify(`${confirmDel.name} eliminado correctamente.`, "success");
    } catch {
      notify("Error al eliminar el usuario.", "error");
    } finally { setLoading(false); }
  };

  const canEdit   = (u) => isRoot || (currentUser?.role === "admin" && !u.isRoot);
  const canDelete = (u) => !u.isRoot && u.id !== currentUser?.id && (isRoot || currentUser?.role === "admin");

  return (
    <div style={{ padding:"0 36px 36px" }}>
      <PageTitle
        icon="👥"
        title="Clientes & Personal"
        sub={`${clients.length} clientes · ${staff.length} personal`}
        action={
          <div style={{ display:"flex", gap:10 }}>
            {isRoot && (
              <Btn v="ghost" onClick={() => setModalStaff(true)}>+ Agregar personal</Btn>
            )}
            <Btn v="accent" onClick={() => setModalClient(true)}>+ Nuevo cliente</Btn>
          </div>
        }
      />

      {/* Personal MOGA */}
      <div style={{ marginBottom:28 }}>
        <Label>Personal MOGA</Label>
        <div style={{ display:"flex", gap:14, marginTop:10, flexWrap:"wrap" }}>
          {staff.map((u) => (
            <div key={u.id} style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, minWidth:240 }}>
              <Avatar name={u.name} size={46} bg={u.isRoot ? "#dc2626" : T.brand}/>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:T.text, fontFamily:T.font }}>{u.name}</span>
                  {u.isRoot && <span style={{ fontSize:10, fontWeight:800, background:"#dc2626", color:"#fff", borderRadius:6, padding:"2px 7px" }}>ROOT</span>}
                </div>
                <div style={{ fontSize:12, color:ROLE_COLOR[u.role] || T.textMuted, fontWeight:600, marginTop:2 }}>{ROLE_LABEL[u.role]}</div>
                <div style={{ fontSize:12, color:T.textMuted, marginTop:1 }}>{u.email}</div>
              </div>
              {canEdit(u) && (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <Btn v="sm" onClick={() => openEdit(u)}>Editar</Btn>
                  {canDelete(u) && (
                    <Btn v="sm_red" onClick={() => setConfirmDel(u)}>Eliminar</Btn>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Clientes */}
      <div style={{ marginBottom:12 }}><Label>Clientes registrados</Label></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
        {clients.map((c) => {
          const myPets = pets.filter((p) => p.ownerId === c.id);
          return (
            <div key={c.id} className="hover-lift" style={{ background:T.panel, borderRadius:14, boxShadow:T.sm, border:`1px solid ${T.border}`, overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(135deg,${T.brand},${T.brandMid})`, padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
                <Avatar name={c.name} size={44} bg="rgba(255,255,255,0.2)"/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:T.font }}>{c.name}</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>RUT: {c.rut}</div>
                </div>
                {canEdit(c) && (
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => openEdit(c)} style={{ background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", color:"#fff", borderRadius:7, padding:"5px 10px", fontSize:12, fontWeight:600 }}>✎</button>
                    {canDelete(c) && (
                      <button onClick={() => setConfirmDel(c)} style={{ background:"rgba(220,38,38,0.7)", border:"none", cursor:"pointer", color:"#fff", borderRadius:7, padding:"5px 10px", fontSize:12, fontWeight:600 }}>✕</button>
                    )}
                  </div>
                )}
              </div>
              <div style={{ padding:"14px 20px" }}>
                <div style={{ fontSize:13, color:T.textMuted, marginBottom:4 }}>📧 {c.email}</div>
                <div style={{ fontSize:13, color:T.textMuted, marginBottom:12 }}>📱 {c.phone}</div>
                <div style={{ paddingTop:10, borderTop:`1px solid ${T.border}`, fontSize:13, display:"flex", gap:8, flexWrap:"wrap" }}>
                  {myPets.length > 0
                    ? myPets.map((p) => (
                        <span key={p.id} style={{ display:"inline-flex", alignItems:"center", gap:4, background:T.brandLight, color:T.brand, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                          {p.species === "Perro" ? "🐶" : p.species === "Gato" ? "🐱" : "🐾"} {p.name}
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

      {/* Modal: nuevo cliente */}
      {modalClient && (
        <Modal title="Registrar nuevo cliente" onClose={() => setModalClient(false)}>
          <Input label="Nombre completo *" value={formClient.name}     onChange={(e) => setFormClient({...formClient, name:e.target.value})}     placeholder="María Torres"/>
          <Input label="RUT *"             value={formClient.rut}      onChange={(e) => setFormClient({...formClient, rut:e.target.value})}      placeholder="12.345.678-9"/>
          <Input label="Correo *" type="email" value={formClient.email} onChange={(e) => setFormClient({...formClient, email:e.target.value})}   placeholder="cliente@email.cl"/>
          <Input label="Teléfono"          value={formClient.phone}    onChange={(e) => setFormClient({...formClient, phone:e.target.value})}    placeholder="+56 9 1234 5678"/>
          <Input label="Contraseña inicial" value={formClient.password} onChange={(e) => setFormClient({...formClient, password:e.target.value})}/>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModalClient(false)}>Cancelar</Btn>
            <Btn v="accent" onClick={saveClient} disabled={loading}>Registrar cliente</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: nuevo personal (solo root) */}
      {modalStaff && (
        <Modal title="Agregar personal MOGA" onClose={() => setModalStaff(false)}>
          <Input label="Nombre completo *" value={formStaff.name}     onChange={(e) => setFormStaff({...formStaff, name:e.target.value})}     placeholder="Dr. Juan Pérez"/>
          <Input label="Correo *" type="email" value={formStaff.email} onChange={(e) => setFormStaff({...formStaff, email:e.target.value})}   placeholder="vet@moga.cl"/>
          <Input label="Contraseña *" type="password" value={formStaff.password} onChange={(e) => setFormStaff({...formStaff, password:e.target.value})}/>
          <Input label="Teléfono" value={formStaff.phone} onChange={(e) => setFormStaff({...formStaff, phone:e.target.value})} placeholder="+56 9 1234 5678"/>
          <div style={{ marginBottom:16 }}>
            <Label>Rol *</Label>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              {[["vet","Veterinario/a"],["admin","Administrador"]].map(([r, lbl]) => (
                <button key={r} onClick={() => setFormStaff({...formStaff, role:r})} style={{
                  flex:1, padding:"9px 0", border:`2px solid ${formStaff.role===r ? T.brand : T.border}`,
                  borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600,
                  background: formStaff.role===r ? T.brandLight : "#fff",
                  color: formStaff.role===r ? T.brand : T.textMuted,
                  fontFamily:T.font,
                }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModalStaff(false)}>Cancelar</Btn>
            <Btn v="primary" onClick={saveStaff} disabled={loading}>Agregar personal</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: editar usuario */}
      {modalEdit && (
        <Modal title={`Editar — ${modalEdit.name}`} onClose={() => setModalEdit(null)}>
          <Input label="Nombre" value={formEdit.name}  onChange={(e) => setFormEdit({...formEdit, name:e.target.value})}/>
          <Input label="Correo" type="email" value={formEdit.email} onChange={(e) => setFormEdit({...formEdit, email:e.target.value})}/>
          <Input label="Teléfono" value={formEdit.phone} onChange={(e) => setFormEdit({...formEdit, phone:e.target.value})}/>
          {modalEdit.role !== "client" && <Input label="RUT (clientes)" value={formEdit.rut || ""} onChange={(e) => setFormEdit({...formEdit, rut:e.target.value})}/>}
          <Input label="Nueva contraseña (dejar vacío para no cambiar)" type="password" value={formEdit.password} onChange={(e) => setFormEdit({...formEdit, password:e.target.value})}/>
          {isRoot && !modalEdit.isRoot && (
            <div style={{ marginBottom:16 }}>
              <Label>Rol</Label>
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                {[["client","Cliente"],["vet","Veterinario/a"],["admin","Administrador"]].map(([r, lbl]) => (
                  <button key={r} onClick={() => setFormEdit({...formEdit, role:r})} style={{
                    flex:1, padding:"8px 0", border:`2px solid ${formEdit.role===r ? T.brand : T.border}`,
                    borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:600,
                    background: formEdit.role===r ? T.brandLight : "#fff",
                    color: formEdit.role===r ? T.brand : T.textMuted,
                    fontFamily:T.font,
                  }}>{lbl}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setModalEdit(null)}>Cancelar</Btn>
            <Btn v="primary" onClick={saveEdit} disabled={loading}>Guardar cambios</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: confirmar eliminación */}
      {confirmDel && (
        <Modal title="Confirmar eliminación" onClose={() => setConfirmDel(null)}>
          <p style={{ fontSize:14, color:T.text, marginBottom:20, lineHeight:1.6 }}>
            ¿Estás seguro de que deseas eliminar a <strong>{confirmDel.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
            <Btn v="danger" onClick={confirmDelete} disabled={loading}>Sí, eliminar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
