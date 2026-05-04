import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import VetOSLogo from "../../components/ui/VetOSLogo.jsx";
import Btn from "../../components/ui/Btn.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import api from "../../services/api.js";

const STATUS_CFG = {
  active:    { label: "Activa",    bg: T.green,  color: T.greenText },
  suspended: { label: "Suspendida",bg: T.amber,  color: T.amberText },
  cancelled: { label: "Cancelada", bg: T.red,    color: T.redText   },
};

const PLAN_COLOR = {
  "Starter":   { bg: T.blue,   color: T.blueText },
  "Clínica":   { bg: T.purple, color: T.purpleText },
  "Enterprise":{ bg: "#FEF3C7", color: "#92400E" },
};

const EMPTY_FORM = { name: "", adminEmail: "", city: "", plan: "Starter", status: "active" };

function ClinicModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");
  const isEdit = !!initial?.id;

  const submit = async () => {
    if (!form.name.trim() || !form.adminEmail.trim()) { setErr("Nombre y email son obligatorios."); return; }
    setBusy(true); setErr("");
    try { await onSave(form); onClose(); }
    catch { setErr("No se pudo guardar. Intenta de nuevo."); setBusy(false); }
  };

  return (
    <Modal title={isEdit ? "Editar clínica" : "Nueva clínica"} onClose={onClose}>
      <Input label="Nombre de la clínica *" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Clínica Veterinaria Las Flores" />
      <Input label="Email del administrador *" type="email" value={form.adminEmail}
        onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} placeholder="admin@clinica.cl" />
      <Input label="Ciudad" value={form.city || ""}
        onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Santiago" />
      <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:12 }}>
        <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)" }}>Plan</label>
        <select value={form.plan || "Starter"} onChange={(e) => setForm({ ...form, plan: e.target.value })}
          style={{ padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"#1e1e2e", color:"#fff", fontSize:14, fontFamily:T.font, outline:"none" }}>
          <option>Starter</option>
          <option>Clínica</option>
          <option>Enterprise</option>
        </select>
      </div>
      {isEdit && (
        <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)" }}>Estado</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{ padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"#1e1e2e", color:"#fff", fontSize:14, fontFamily:T.font, outline:"none" }}>
            <option value="active">Activa</option>
            <option value="suspended">Suspendida</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      )}
      {err && <div style={{ fontSize:13, color:"#f87171", marginBottom:8 }}>⚠ {err}</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="accent" onClick={submit} disabled={busy}>{busy ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear clínica"}</Btn>
      </div>
    </Modal>
  );
}

export default function SuperAdminDashboard() {
  const { currentUser, logout, enterClinic } = useApp();
  const [tenants, setTenants]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null); // null | { type: "new" | "edit", data? }
  const [entering, setEntering] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/tenants")
      .then((r) => setTenants(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (form.id) {
      const { data } = await api.patch(`/tenants/${form.id}`, form);
      setTenants((prev) => prev.map((x) => x.id === form.id ? (data || { ...x, ...form }) : x));
    } else {
      const { data } = await api.post("/tenants", form);
      setTenants((prev) => [data, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tenants/${id}`);
      setTenants((prev) => prev.filter((x) => x.id !== id));
    } catch {}
    setDeleteConfirm(null);
  };

  const handleEnter = async (t) => {
    setEntering(t.id);
    try { await enterClinic(t.id); }
    catch { setEntering(null); }
  };

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
    (t.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount    = tenants.filter((t) => t.status === "active").length;
  const suspendedCount = tenants.filter((t) => t.status === "suspended").length;

  return (
    <div style={{ minHeight:"100vh", background:"#0F0F1A", fontFamily:T.font }}>

      {/* Topbar */}
      <div style={{ background:"#0F0F1A", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 36px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <VetOSLogo size={30} white />
          <div style={{ width:1, height:20, background:"rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            Panel ZOVITA · Superadmin
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.45)" }}>{currentUser.name || currentUser.email}</span>
          <Btn v="ghost" style={{ fontSize:12, padding:"7px 14px", color:"rgba(255,255,255,0.45)", borderColor:"rgba(255,255,255,0.1)" }} onClick={logout}>
            Salir
          </Btn>
        </div>
      </div>

      <div style={{ padding:"36px 40px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:"-0.03em", marginBottom:4 }}>Clínicas registradas</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)" }}>Gestiona todas las clínicas en la plataforma ZOVITA</p>
          </div>
          <Btn v="accent" style={{ marginTop:4 }} onClick={() => setModal({ type:"new" })}>
            + Nueva clínica
          </Btn>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {[
            { label:"Total clínicas",  value:tenants.length,  icon:"🏥", color:"#818CF8" },
            { label:"Activas",         value:activeCount,     icon:"✅", color:"#34D399" },
            { label:"Suspendidas",     value:suspendedCount,  icon:"⏸️", color:"#FBBF24" },
            { label:"Nuevas este mes", value:tenants.filter((t) => t.createdAt >= "2026-04-01").length, icon:"🆕", color:"#60A5FA" },
          ].map((k) => (
            <div key={k.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:"18px 20px", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:22 }}>{k.icon}</div>
              <div style={{ fontSize:26, fontWeight:900, color:k.color, marginTop:6, lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4, fontWeight:600 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div style={{ marginBottom:16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o ciudad…"
            style={{ width:"100%", maxWidth:400, padding:"10px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, fontFamily:T.font, outline:"none" }}
          />
        </div>

        {/* Tabla */}
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, border:"1px solid rgba(255,255,255,0.07)", overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr auto", padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            {["Clínica","Email admin","Ciudad","Plan","Estado","Acciones"].map((h) => (
              <span key={h} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14 }}>Cargando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:40, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:14 }}>No hay clínicas registradas aún.</div>
          ) : filtered.map((t, i) => {
            const sc = STATUS_CFG[t.status] || STATUS_CFG.active;
            const pc = PLAN_COLOR[t.plan?.split(" ")[0]] || PLAN_COLOR["Starter"];
            const isLoading = entering === t.id;
            return (
              <div key={t.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr auto", padding:"14px 20px", borderTop: i===0?"none":"1px solid rgba(255,255,255,0.04)", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{t.displayName || t.name}</div>
                  {t.displayName && t.displayName !== t.name && (
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:1 }}>({t.name})</div>
                  )}
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>Desde {t.createdAt?.slice(0,10) || "—"}</div>
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>{t.adminEmail}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{t.city || "—"}</div>
                <span style={{ display:"inline-flex", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:pc.bg, color:pc.color, width:"fit-content" }}>
                  {t.plan?.split(" ")[0] || "Starter"}
                </span>
                <span style={{ display:"inline-flex", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:sc.bg, color:sc.color, width:"fit-content" }}>
                  {sc.label}
                </span>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <button
                    onClick={() => handleEnter(t)}
                    disabled={isLoading}
                    style={{ fontSize:12, fontWeight:700, padding:"6px 13px", borderRadius:8, border:"none", background:isLoading?"rgba(99,102,241,0.3)":"#6366F1", color:"#fff", cursor:isLoading?"wait":"pointer", fontFamily:T.font }}
                  >
                    {isLoading ? "…" : "Entrar"}
                  </button>
                  <button
                    onClick={() => setModal({ type:"edit", data:t })}
                    style={{ fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.55)", cursor:"pointer", fontFamily:T.font }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(t)}
                    style={{ fontSize:12, fontWeight:600, padding:"6px 10px", borderRadius:8, border:"1px solid rgba(239,68,68,0.2)", background:"transparent", color:"rgba(239,68,68,0.6)", cursor:"pointer", fontFamily:T.font }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal crear/editar clínica */}
      {modal && (
        <ClinicModal
          initial={modal.data || null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Confirm delete */}
      {deleteConfirm && (
        <Modal title="Eliminar clínica" onClose={() => setDeleteConfirm(null)}>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", marginBottom:20 }}>
            ¿Seguro que quieres eliminar <strong style={{ color:"#fff" }}>{deleteConfirm.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn v="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Btn>
            <Btn v="danger" onClick={() => handleDelete(deleteConfirm.id)}>Eliminar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
