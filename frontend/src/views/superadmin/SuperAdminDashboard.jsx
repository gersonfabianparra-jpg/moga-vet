import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import T from "../../styles/tokens.js";
import VetOSLogo from "../../components/ui/VetOSLogo.jsx";
import Btn from "../../components/ui/Btn.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import api from "../../services/api.js";

const STATUS_CFG = {
  active:    { label: "Activa",     bg: T.green,   color: T.greenText  },
  suspended: { label: "Suspendida", bg: T.amber,   color: T.amberText  },
  cancelled: { label: "Cancelada",  bg: "#FEE2E2", color: "#991B1B"    },
};
const PLAN_COLOR = {
  "Starter":    { bg: "#1E3A5F", color: "#93C5FD" },
  "Clínica":    { bg: "#3B0764", color: "#C084FC" },
  "Enterprise": { bg: "#78350F", color: "#FCD34D" },
};
const EMPTY_CLINIC = { name: "", adminEmail: "", city: "", plan: "Starter", status: "active" };

function fmtMoney(n) {
  return "$" + (n || 0).toLocaleString("es-CL");
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = "#818CF8", sub }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Clinic modal ─────────────────────────────────────────────────────────────
function ClinicModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_CLINIC);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");
  const isEdit = !!initial?.id;

  const submit = async () => {
    if (!form.name.trim() || !form.adminEmail.trim()) { setErr("Nombre y email son obligatorios."); return; }
    setBusy(true); setErr("");
    try { await onSave(form); onClose(); }
    catch { setErr("No se pudo guardar. Intenta de nuevo."); setBusy(false); }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{label}</label>
      <input type={type} value={form[key] || ""} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "#1e1e2e", color: "#fff", fontSize: 14, fontFamily: T.font, outline: "none" }} />
    </div>
  );

  return (
    <Modal title={isEdit ? "Editar clínica" : "Nueva clínica"} onClose={onClose}>
      {field("Nombre de la clínica *", "name", "text", "Clínica Veterinaria Las Flores")}
      {field("Email del administrador *", "adminEmail", "email", "admin@clinica.cl")}
      {field("Ciudad", "city", "text", "Santiago")}
      {field("Teléfono", "phone", "text", "+56 9 1234 5678")}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Plan</label>
          <select value={form.plan || "Starter"} onChange={(e) => setForm({ ...form, plan: e.target.value })}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "#1e1e2e", color: "#fff", fontSize: 14, fontFamily: T.font, outline: "none" }}>
            <option>Starter</option><option>Clínica</option><option>Enterprise</option>
          </select>
        </div>
        {isEdit && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Estado</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "#1e1e2e", color: "#fff", fontSize: 14, fontFamily: T.font, outline: "none" }}>
              <option value="active">Activa</option>
              <option value="suspended">Suspendida</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        )}
      </div>
      {err && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 8 }}>⚠ {err}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="accent" onClick={submit} disabled={busy}>{busy ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear clínica"}</Btn>
      </div>
    </Modal>
  );
}

// ─── Password reset modal ─────────────────────────────────────────────────────
function ResetPwdModal({ user, onClose }) {
  const [pwd, setPwd]   = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr]   = useState("");

  const submit = async () => {
    if (pwd.length < 6) { setErr("Mínimo 6 caracteres."); return; }
    setBusy(true); setErr("");
    try {
      await api.post(`/admin/users/${user.id}/reset-password`, { password: pwd });
      setDone(true);
    } catch { setErr("No se pudo cambiar la contraseña."); setBusy(false); }
  };

  return (
    <Modal title="Restablecer contraseña" onClose={onClose}>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
        Cambiando contraseña de <strong style={{ color: "#fff" }}>{user.name || user.email}</strong>
      </div>
      {done ? (
        <>
          <div style={{ fontSize: 15, color: "#34D399", fontWeight: 700, marginBottom: 16 }}>✓ Contraseña actualizada correctamente</div>
          <Btn v="ghost" onClick={onClose}>Cerrar</Btn>
        </>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Nueva contraseña</label>
            <input type="password" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus placeholder="••••••••"
              style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${err ? "#f87171" : "rgba(255,255,255,0.12)"}`, background: "#1e1e2e", color: "#fff", fontSize: 14, fontFamily: T.font, outline: "none" }} />
          </div>
          {err && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>⚠ {err}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn v="accent" onClick={submit} disabled={busy}>{busy ? "Guardando…" : "Cambiar contraseña"}</Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Users panel ─────────────────────────────────────────────────────────────
function UsersPanel({ tenants, stats }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [users, setUsers]           = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [resetTarget, setResetTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");

  const loadUsers = async (t) => {
    setSelectedTenant(t);
    setLoadingUsers(true);
    setSearch("");
    try {
      const { data } = await api.get(`/admin/users/${t.id}`);
      setUsers(data);
    } catch { setUsers([]); }
    setLoadingUsers(false);
  };

  const handleDelete = async (uid) => {
    try {
      await api.delete(`/admin/users/${uid}`);
      setUsers((prev) => prev.filter((u) => u.id !== uid));
    } catch {}
    setDeleteTarget(null);
  };

  const filtered = users.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_BADGE = {
    admin:  { bg: "#1E3A5F", color: "#93C5FD", label: "Admin" },
    staff:  { bg: "#1B3A4B", color: "#67E8F9", label: "Staff" },
    vet:    { bg: "#1A2E1A", color: "#86EFAC", label: "Vet" },
    client: { bg: "#1A1A2E", color: "#C084FC", label: "Cliente" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, height: "calc(100vh - 260px)", minHeight: 400 }}>
      {/* Tenant list */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", overflow: "auto" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Clínicas
        </div>
        {tenants.map((t) => {
          const uc = stats?.byTenant?.users?.[t.id] || 0;
          const pc = stats?.byTenant?.pets?.[t.id]  || 0;
          const isSelected = selectedTenant?.id === t.id;
          return (
            <div key={t.id} onClick={() => loadUsers(t)}
              style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: isSelected ? "rgba(99,102,241,0.15)" : "transparent",
                borderLeft: isSelected ? "2px solid #6366F1" : "2px solid transparent",
                transition: "all 0.12s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t.displayName || t.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                👥 {uc} usuarios · 🐾 {pc} mascotas
              </div>
            </div>
          );
        })}
      </div>

      {/* User list */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selectedTenant ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
            ← Selecciona una clínica para ver sus usuarios
          </div>
        ) : (
          <>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", flex: 1 }}>
                {selectedTenant.displayName || selectedTenant.name}
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>{users.length} usuarios</span>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuario…"
                style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 13, fontFamily: T.font, outline: "none", width: 200 }} />
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {loadingUsers ? (
                <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Cargando…</div>
              ) : filtered.map((u) => {
                const rb = ROLE_BADGE[u.role] || ROLE_BADGE.client;
                return (
                  <div key={u.id} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {u.role === "client" ? "👤" : "🩺"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || "—"}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{u.email}</div>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: rb.bg, color: rb.color, flexShrink: 0 }}>
                      {rb.label}
                    </span>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setResetTarget(u)}
                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(99,102,241,0.3)", background: "transparent", color: "#818CF8", cursor: "pointer", fontFamily: T.font }}>
                        🔑 Contraseña
                      </button>
                      <button onClick={() => setDeleteTarget(u)}
                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "rgba(239,68,68,0.6)", cursor: "pointer", fontFamily: T.font }}>
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {resetTarget && <ResetPwdModal user={resetTarget} onClose={() => setResetTarget(null)} />}
      {deleteTarget && (
        <Modal title="Eliminar usuario" onClose={() => setDeleteTarget(null)}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
            ¿Eliminar a <strong style={{ color: "#fff" }}>{deleteTarget.name || deleteTarget.email}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Btn>
            <Btn v="danger" onClick={() => handleDelete(deleteTarget.id)}>Eliminar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────
function StatsPanel({ stats, tenants, loading }) {
  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Cargando estadísticas…</div>;
  if (!stats) return <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Sin datos</div>;

  const { totals, byTenant } = stats;

  // Top clinics by pets
  const topByPets = tenants
    .map((t) => ({ ...t, pets: byTenant?.pets?.[t.id] || 0, users: byTenant?.users?.[t.id] || 0 }))
    .sort((a, b) => b.pets - a.pets)
    .slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Global KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard icon="🏥" label="Clínicas activas"    value={tenants.filter((t) => t.status === "active").length} color="#818CF8" />
        <StatCard icon="👥" label="Total usuarios"      value={totals.users}   color="#34D399" />
        <StatCard icon="🐾" label="Total mascotas"      value={totals.pets}    color="#60A5FA" />
        <StatCard icon="💵" label="Ingresos plataforma" value={fmtMoney(totals.revenue)} color="#FCD34D" sub={`${totals.payments} pagos`} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <StatCard icon="📋" label="Fichas médicas"     value={totals.records}      color="#C084FC" />
        <StatCard icon="📅" label="Citas registradas"  value={totals.appointments} color="#F9A8D4" />
        <StatCard icon="💉" label="Vacunas registradas" value={totals.vaccines}    color="#6EE7B7" />
      </div>

      {/* Per-clinic table */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
          Ranking por mascotas registradas
        </div>
        {topByPets.map((t, i) => {
          const maxPets = topByPets[0]?.pets || 1;
          const pct = Math.round((t.pets / maxPets) * 100);
          const sc = STATUS_CFG[t.status] || STATUS_CFG.active;
          return (
            <div key={t.id} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 24, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "right", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t.displayName || t.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#6366F1,#818CF8)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#818CF8" }}>{t.pets}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>mascotas</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#34D399" }}>{t.users}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>usuarios</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const { currentUser, logout, enterClinic } = useApp();
  const [tab, setTab]           = useState("clinicas");
  const [tenants, setTenants]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);
  const [entering, setEntering] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/tenants")
      .then((r) => setTenants(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadStats = () => {
    setStatsLoading(true);
    api.get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  };

  useEffect(() => { load(); loadStats(); }, []);

  const handleSave = async (form) => {
    if (form.id) {
      const { data } = await api.patch(`/tenants/${form.id}`, form);
      setTenants((prev) => prev.map((x) => x.id === form.id ? (data || { ...x, ...form }) : x));
    } else {
      const { data } = await api.post("/tenants", form);
      setTenants((prev) => [data, ...prev]);
    }
    loadStats();
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/tenants/${id}`); setTenants((prev) => prev.filter((x) => x.id !== id)); } catch {}
    setDeleteConfirm(null);
    loadStats();
  };

  const handleEnter = async (t) => {
    setEntering(t.id);
    try { await enterClinic(t.id); }
    catch { setEntering(null); }
  };

  const toggleStatus = async (t) => {
    const next = t.status === "active" ? "suspended" : "active";
    try {
      await api.patch(`/tenants/${t.id}`, { ...t, status: next });
      setTenants((prev) => prev.map((x) => x.id === t.id ? { ...x, status: next } : x));
    } catch {}
  };

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q || (t.displayName || t.name).toLowerCase().includes(q) || t.adminEmail.toLowerCase().includes(q) || (t.city || "").toLowerCase().includes(q)) &&
      (!planFilter   || t.plan === planFilter) &&
      (!statusFilter || t.status === statusFilter)
    );
  });

  const TABS = [
    { key: "clinicas",    label: "🏥 Clínicas",      count: tenants.length },
    { key: "usuarios",    label: "👥 Usuarios",       count: null },
    { key: "estadisticas",label: "📊 Estadísticas",   count: null },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F1A", fontFamily: T.font, display: "flex", flexDirection: "column" }}>

      {/* Topbar */}
      <div style={{ background: "#0F0F1A", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 36px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <VetOSLogo size={30} white />
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Panel ZOVITA · Superadmin
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Quick global stats */}
          {stats && (
            <div style={{ display: "flex", gap: 16, marginRight: 16 }}>
              {[
                { v: tenants.length, l: "clínicas", c: "#818CF8" },
                { v: stats.totals.users, l: "usuarios", c: "#34D399" },
                { v: stats.totals.pets,  l: "mascotas", c: "#60A5FA" },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: c, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>
          )}
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{currentUser.name || currentUser.email}</span>
          <button onClick={() => { load(); loadStats(); }}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "6px 10px", fontSize: 14, fontFamily: T.font }}
            title="Recargar datos">↻</button>
          <Btn v="ghost" style={{ fontSize: 12, padding: "7px 14px", color: "rgba(255,255,255,0.45)", borderColor: "rgba(255,255,255,0.1)" }} onClick={logout}>
            Salir
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 36px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 13, fontWeight: 700,
              color: tab === t.key ? "#818CF8" : "rgba(255,255,255,0.35)",
              borderBottom: tab === t.key ? "2px solid #6366F1" : "2px solid transparent",
              transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
            {t.label}
            {t.count !== null && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: tab === t.key ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)", color: tab === t.key ? "#818CF8" : "rgba(255,255,255,0.3)" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: "28px 36px", overflow: "auto" }}>

        {/* ── Tab: Clínicas ─────────────────────────────────────────────────── */}
        {tab === "clinicas" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>Clínicas registradas</h1>
              <Btn v="accent" onClick={() => setModal({ type: "new" })}>+ Nueva clínica</Btn>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar…"
                style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 13, fontFamily: T.font, outline: "none", width: 260 }} />
              <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#1e1e2e", color: "#fff", fontSize: 13, fontFamily: T.font, outline: "none" }}>
                <option value="">Todos los planes</option>
                <option>Starter</option><option>Clínica</option><option>Enterprise</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#1e1e2e", color: "#fff", fontSize: 13, fontFamily: T.font, outline: "none" }}>
                <option value="">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="suspended">Suspendidas</option>
                <option value="cancelled">Canceladas</option>
              </select>
              <div style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Summary KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total",      value: tenants.length, icon: "🏥", color: "#818CF8" },
                { label: "Activas",    value: tenants.filter((t) => t.status === "active").length,    icon: "✅", color: "#34D399" },
                { label: "Suspendidas",value: tenants.filter((t) => t.status === "suspended").length, icon: "⏸️", color: "#FBBF24" },
                { label: "Este mes",   value: tenants.filter((t) => t.createdAt >= "2026-04-01").length, icon: "🆕", color: "#60A5FA" },
              ].map((k) => (
                <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{k.icon}</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr auto", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Clínica", "Email admin", "Ciudad", "Plan", "Estado", "Mascotas", "Acciones"].map((h) => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                ))}
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Cargando…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Sin resultados.</div>
              ) : filtered.map((t, i) => {
                const sc = STATUS_CFG[t.status] || STATUS_CFG.active;
                const pc = PLAN_COLOR[t.plan?.split(" ")[0]] || PLAN_COLOR["Starter"];
                const isLoading = entering === t.id;
                const petCount  = stats?.byTenant?.pets?.[t.id]  || 0;
                return (
                  <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr auto", padding: "13px 20px", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)", alignItems: "center", transition: "background 0.1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t.displayName || t.name}</div>
                      {t.displayName && t.displayName !== t.name && (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>({t.name})</div>
                      )}
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>ID {t.id} · {t.createdAt?.slice(0, 10) || "—"}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.adminEmail}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{t.city || "—"}</div>
                    <span style={{ display: "inline-flex", padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: pc.bg, color: pc.color, width: "fit-content" }}>
                      {t.plan?.split(" ")[0] || "Starter"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "inline-flex", padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      <button onClick={() => toggleStatus(t)} title={t.status === "active" ? "Suspender" : "Activar"}
                        style={{ fontSize: 11, padding: "3px 7px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: T.font }}>
                        {t.status === "active" ? "⏸" : "▶"}
                      </button>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#818CF8" }}>
                      {petCount > 0 ? petCount : "—"}
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <button onClick={() => handleEnter(t)} disabled={isLoading}
                        style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", background: isLoading ? "rgba(99,102,241,0.3)" : "#6366F1", color: "#fff", cursor: isLoading ? "wait" : "pointer", fontFamily: T.font }}>
                        {isLoading ? "…" : "Entrar"}
                      </button>
                      <button onClick={() => setModal({ type: "edit", data: t })}
                        style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: T.font }}>
                        ✏
                      </button>
                      <button onClick={() => setDeleteConfirm(t)}
                        style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "rgba(239,68,68,0.55)", cursor: "pointer", fontFamily: T.font }}>
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Tab: Usuarios ─────────────────────────────────────────────────── */}
        {tab === "usuarios" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>Gestión de usuarios</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Selecciona una clínica para ver y gestionar sus usuarios</p>
            </div>
            <UsersPanel tenants={tenants} stats={stats} />
          </>
        )}

        {/* ── Tab: Estadísticas ─────────────────────────────────────────────── */}
        {tab === "estadisticas" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>Estadísticas globales</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Vista consolidada de toda la plataforma ZOVITA</p>
            </div>
            <StatsPanel stats={stats} tenants={tenants} loading={statsLoading} />
          </>
        )}
      </div>

      {/* Modales */}
      {modal && (
        <ClinicModal initial={modal.data || null} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {deleteConfirm && (
        <Modal title="Eliminar clínica" onClose={() => setDeleteConfirm(null)}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
            ¿Eliminar <strong style={{ color: "#fff" }}>{deleteConfirm.displayName || deleteConfirm.name}</strong>?
            Esto eliminará también todos sus datos asociados. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn v="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Btn>
            <Btn v="danger" onClick={() => handleDelete(deleteConfirm.id)}>Eliminar permanentemente</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
