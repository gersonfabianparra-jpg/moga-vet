import { useRef, useState } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import { fmtDate, fmtCLP, spIcon, PAY_METHODS, PAY_CATS } from "../../styles/helpers.js";
import PageTitle  from "../../components/layout/PageTitle.jsx";
import { TableWrap, TR, TD } from "../../components/layout/Table.jsx";
import KpiCard from "../../components/layout/KpiCard.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import Input  from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import CatBadge from "../../components/ui/badges/CatBadge.jsx";

const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY = { concept:"", petId:"", clientId:"", date:TODAY, amount:"", category:"Consulta", status:"pendiente", method:"" };

const Dot = ({ color }) => <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, marginTop:1 }}/>;

function statusStyle(status) {
  if (status === "pagado")   return { bg:"#14532d22", color:"#22C55E", dot:"#22c55e", label:"Pagado" };
  if (status === "abonado")  return { bg:"#1e3a5f33", color:"#60A5FA", dot:"#60a5fa", label:"Abonado" };
  return { bg:"#78350f22", color:"#F59E0B", dot:"#f59e0b", label:"Pendiente" };
}

function AbonoModal({ payment, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Efectivo");
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState("");
  const paid     = payment.amountPaid || 0;
  const pending  = payment.amount - paid;

  const save = async () => {
    const n = +amount;
    if (!n || n <= 0)       { setErr("Ingresa un monto válido."); return; }
    if (n > pending)        { setErr(`El abono no puede superar el saldo pendiente (${fmtCLP(pending)}).`); return; }
    setBusy(true); setErr("");
    try { await onSave(payment.id, n, method); onClose(); }
    catch { setErr("Error al registrar abono."); }
    finally { setBusy(false); }
  };

  const pct = payment.amount > 0 ? Math.round((paid / payment.amount) * 100) : 0;

  return (
    <Modal title={`Registrar abono — ${payment.concept}`} onClose={onClose}>
      {/* Barra de progreso */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
          <span style={{ color:"#22C55E", fontWeight:700 }}>Pagado: {fmtCLP(paid)}</span>
          <span style={{ color:"#F59E0B", fontWeight:700 }}>Pendiente: {fmtCLP(pending)}</span>
        </div>
        <div style={{ height:10, background:"rgba(255,255,255,0.08)", borderRadius:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#6366F1,#22C55E)", borderRadius:6, transition:"width 0.3s" }}/>
        </div>
        <div style={{ fontSize:11, color:T.textMuted, marginTop:4, textAlign:"right" }}>{pct}% cancelado · Total: {fmtCLP(payment.amount)}</div>
      </div>
      <Input label="Monto del abono (CLP) *" type="number" min="1" max={pending}
        value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} placeholder={`Máx. ${fmtCLP(pending)}`} />
      <Select label="Método de pago" value={method} onChange={(e) => setMethod(e.target.value)}>
        {PAY_METHODS.map((m) => <option key={m}>{m}</option>)}
      </Select>
      {err && <div style={{ fontSize:13, color:"#DC2626", marginTop:-6 }}>⚠ {err}</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="accent" onClick={save} disabled={busy}>{busy ? "Registrando…" : "Registrar abono"}</Btn>
      </div>
    </Modal>
  );
}

export default function PaymentsView() {
  const { payments, pets, users, addPayment, updatePayment, removePayment, markPaid, abonoPayment } = useApp();
  const { isMobile } = useBreakpoint();
  const [catF, setCatF]       = useState("");
  const [stF, setStF]         = useState("");
  const [modal, setModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [abonoTarget, setAbonoTarget] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [editForm, setEditForm] = useState(EMPTY);
  const [busy, setBusy]       = useState(false);
  const selRefs               = useRef({});

  const clients    = users.filter((u) => u.role === "client");
  const filtered   = payments.filter((p) => (!catF || p.category === catF) && (!stF || p.status === stF)).sort((a, b) => b.date.localeCompare(a.date));
  const totalPaid  = payments.filter((p) => p.status === "pagado").reduce((s, p) => s + p.amount, 0);
  const totalPend  = payments.filter((p) => p.status === "pendiente").reduce((s, p) => s + p.amount, 0);
  const total      = payments.reduce((s, p) => s + p.amount, 0);

  const openEdit = (p) => {
    setEditForm({ concept: p.concept || "", petId: String(p.petId || ""), clientId: String(p.clientId || ""), date: p.date || TODAY, amount: String(p.amount || ""), category: p.category || "Consulta", status: p.status || "pendiente", method: p.method || "" });
    setEditTarget(p);
  };

  const save = async () => {
    if (!form.concept || !form.amount) return;
    setBusy(true);
    try {
      await addPayment({ ...form, petId:+form.petId||null, clientId:+form.clientId||null, amount:+form.amount });
      setModal(false);
      setForm(EMPTY);
    } finally { setBusy(false); }
  };

  const saveEdit = async () => {
    if (!editForm.concept || !editForm.amount) return;
    setBusy(true);
    try {
      await updatePayment(editTarget.id, { ...editForm, petId:+editForm.petId||null, clientId:+editForm.clientId||null, amount:+editForm.amount });
      setEditTarget(null);
    } finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await removePayment(deleteTarget.id);
      setDeleteTarget(null);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ padding: isMobile ? "0 14px 32px" : "0 36px 36px" }}>
      <PageTitle icon="💳" title="Historial de pagos" sub={`${payments.length} transacciones registradas`} action={<Btn v="accent" onClick={() => setModal(true)}>+ Registrar pago</Btn>}/>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <KpiCard label="Total facturado"   value={fmtCLP(total)}      icon="🧾" gradient="linear-gradient(135deg,#1e3a5f,#2563eb)"           delay="2"/>
        <KpiCard label="Ingresos recibidos" value={fmtCLP(totalPaid)} icon="✅" gradient={`linear-gradient(135deg,${T.brand},${T.brandMid})`} delay="3"/>
        <KpiCard label="Pendiente de cobro" value={fmtCLP(totalPend)} icon="⏳" gradient={`linear-gradient(135deg,#78350f,${T.gold})`}        delay="4"/>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <select value={catF} onChange={(e) => setCatF(e.target.value)} className="moga-input" style={{ padding:"9px 12px", border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font }}>
          <option value="">Todas las categorías</option>
          {PAY_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={stF} onChange={(e) => setStF(e.target.value)} className="moga-input" style={{ padding:"9px 12px", border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text, background:T.panel, fontFamily:T.font }}>
          <option value="">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="abonado">Abonado</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      <TableWrap heads={["Concepto","Mascota","Cliente","Categoría","Fecha","Monto","Método","Estado",""]} empty={filtered.length === 0 ? "Sin resultados." : undefined}>
        {filtered.map((p) => {
          const pet    = pets.find((pt) => pt.id === p.petId);
          const client = users.find((u) => u.id === p.clientId);
          return (
            <TR key={p.id}>
              <TD bold>
                <div style={{ maxWidth:190, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.concept}</div>
                {/* Barra abono si hay pago parcial */}
                {(p.amountPaid > 0 && p.status !== "pagado") && (
                  <div style={{ marginTop:4 }}>
                    <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden", width:160 }}>
                      <div style={{ height:"100%", width:`${Math.round(((p.amountPaid||0)/p.amount)*100)}%`, background:"linear-gradient(90deg,#6366F1,#60A5FA)", borderRadius:4 }}/>
                    </div>
                    <div style={{ fontSize:10, color:"#60A5FA", marginTop:2 }}>{fmtCLP(p.amountPaid)} de {fmtCLP(p.amount)}</div>
                  </div>
                )}
              </TD>
              <TD>{pet ? `${spIcon(pet.species)} ${pet.name}` : "—"}</TD>
              <TD muted>{client?.name || "—"}</TD>
              <TD><CatBadge cat={p.category}/></TD>
              <TD>{fmtDate(p.date)}</TD>
              <TD><span style={{ fontWeight:700, color:p.status==="pagado"?"#22C55E":p.status==="abonado"?"#60A5FA":T.amberText }}>{fmtCLP(p.amount)}</span></TD>
              <TD muted>{p.method || "—"}</TD>
              <TD>
                {(() => { const s = statusStyle(p.status); return (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:s.bg, color:s.color, fontSize:12, fontWeight:600 }}>
                    <Dot color={s.dot}/>{s.label}
                  </span>
                ); })()}
              </TD>
              <TD>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  {(p.status === "pendiente" || p.status === "abonado") && (
                    <>
                      <Btn v="sm_accent" onClick={() => setAbonoTarget(p)}>＋ Abono</Btn>
                      <select ref={(el) => selRefs.current[p.id]=el} style={{ padding:"4px 8px", border:`1px solid ${T.border}`, borderRadius:6, fontSize:12, fontFamily:T.font, outline:"none", background:T.input, color:T.text }}>
                        {PAY_METHODS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                      <Btn v="sm_green" onClick={() => markPaid(p.id, selRefs.current[p.id]?.value || "Efectivo")}>✓ Cobrar todo</Btn>
                    </>
                  )}
                  <button onClick={() => openEdit(p)}
                    style={{ padding:"4px 9px", borderRadius:7, border:`1px solid ${T.border}`, background:T.brandLight, color:T.brand, cursor:"pointer", fontSize:13, fontFamily:T.font }}
                    title="Editar">✏</button>
                  <button onClick={() => setDeleteTarget(p)}
                    style={{ padding:"4px 9px", borderRadius:7, border:"1px solid #fca5a5", background:"#fee2e2", color:"#dc2626", cursor:"pointer", fontSize:13, fontFamily:T.font }}
                    title="Eliminar">🗑</button>
                </div>
              </TD>
            </TR>
          );
        })}
      </TableWrap>

      {/* Modal: nuevo pago */}
      {modal && (
        <Modal title="Registrar pago" onClose={() => { setModal(false); setForm(EMPTY); }}>
          <PayForm form={form} setForm={setForm} clients={clients} pets={pets} />
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => { setModal(false); setForm(EMPTY); }}>Cancelar</Btn>
            <Btn v="accent" onClick={save} disabled={busy || !form.concept || !form.amount}>{busy ? "Guardando…" : "Registrar pago"}</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: editar pago */}
      {editTarget && (
        <Modal title="Editar pago" sub={editTarget.concept} onClose={() => setEditTarget(null)}>
          <PayForm form={editForm} setForm={setEditForm} clients={clients} pets={pets} />
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setEditTarget(null)}>Cancelar</Btn>
            <Btn v="accent" onClick={saveEdit} disabled={busy || !editForm.concept || !editForm.amount}>{busy ? "Guardando…" : "Guardar cambios"}</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: registrar abono */}
      {abonoTarget && (
        <AbonoModal payment={abonoTarget} onClose={() => setAbonoTarget(null)} onSave={abonoPayment} />
      )}

      {/* Modal: confirmar eliminación */}
      {deleteTarget && (
        <Modal title="Eliminar pago" onClose={() => setDeleteTarget(null)}>
          <p style={{ fontSize:14, color:T.text, marginBottom:20, lineHeight:1.6 }}>
            ¿Eliminar el pago <strong>{deleteTarget.concept}</strong> por <strong>{fmtCLP(deleteTarget.amount)}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Btn>
            <Btn v="danger" onClick={confirmDelete} disabled={busy}>{busy ? "Eliminando…" : "Sí, eliminar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PayForm({ form, setForm, clients, pets }) {
  return (
    <>
      <Input label="Concepto *" value={form.concept} onChange={(e) => setForm({...form, concept:e.target.value})} placeholder="Ej: Consulta veterinaria Luna"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <Select label="Cliente" value={form.clientId} onChange={(e) => setForm({...form, clientId:e.target.value, petId:""})}>
          <option value="">Seleccionar...</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Mascota" value={form.petId} onChange={(e) => setForm({...form, petId:e.target.value})}>
          <option value="">Seleccionar...</option>
          {pets.filter((p) => !form.clientId || p.ownerId === +form.clientId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select label="Categoría" value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}>
          {PAY_CATS.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Input label="Fecha" type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})}/>
        <Input label="Monto (CLP) *" type="number" value={form.amount} onChange={(e) => setForm({...form, amount:e.target.value})} placeholder="25000"/>
        <Select label="Estado" value={form.status} onChange={(e) => setForm({...form, status:e.target.value})}>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
        </Select>
      </div>
      {form.status === "pagado" && (
        <Select label="Método de pago" value={form.method} onChange={(e) => setForm({...form, method:e.target.value})}>
          <option value="">Seleccionar...</option>
          {PAY_METHODS.map((m) => <option key={m}>{m}</option>)}
        </Select>
      )}
    </>
  );
}
