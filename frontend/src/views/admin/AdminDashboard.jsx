import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { vaxStatus } from "../../styles/helpers.js";
import Sidebar          from "../../components/layout/Sidebar.jsx";
import SearchModal      from "../../components/layout/SearchModal.jsx";
import OverviewView     from "./OverviewView.jsx";
import PetsView         from "./PetsView.jsx";
import RecordsView      from "./RecordsView.jsx";
import GroomingView     from "./GroomingView.jsx";
import VaccinesView     from "./VaccinesView.jsx";
import PaymentsView     from "./PaymentsView.jsx";
import UsersView        from "./UsersView.jsx";
import AppointmentsView  from "./AppointmentsView.jsx";
import ReservationsView  from "./ReservationsView.jsx";
import SettingsView      from "./SettingsView.jsx";
import Modal  from "../../components/ui/Modal.jsx";
import Input  from "../../components/ui/Input.jsx";
import Btn    from "../../components/ui/Btn.jsx";
import T from "../../styles/tokens.js";

function ProfileModal({ onClose }) {
  const { currentUser, updateProfile } = useApp();
  const [form, setForm] = useState({
    name:     currentUser.name     || "",
    email:    currentUser.email    || "",
    phone:    currentUser.phone    || "",
    password: "",
  });
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");
  const [ok,    setOk]    = useState(false);

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Nombre y correo son obligatorios."); return; }
    setBusy(true); setError("");
    try {
      const fields = { name: form.name, email: form.email, phone: form.phone };
      if (form.password.trim()) fields.password = form.password;
      await updateProfile(fields);
      setOk(true);
      setTimeout(onClose, 900);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally { setBusy(false); }
  };

  return (
    <Modal title="Editar mi perfil" onClose={onClose}>
      <Input label="Nombre completo *"
        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Dra. María González"/>
      <Input label="Correo electrónico *" type="email"
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="admin@moga.cl"/>
      <Input label="Teléfono"
        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="+56 9 1234 5678"/>
      <Input label="Nueva contraseña (dejar vacío para no cambiar)" type="password"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="••••••••"/>
      {error && <div style={{ fontSize:13, color:"#dc2626", marginTop:-8, marginBottom:4 }}>⚠ {error}</div>}
      {ok    && <div style={{ fontSize:13, color:"#16a34a", marginTop:-8, marginBottom:4 }}>✓ Perfil actualizado</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn v="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn v="accent" onClick={save} disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</Btn>
      </div>
    </Modal>
  );
}

export default function AdminDashboard() {
  const { currentUser, logout, vaccines, payments, appointments } = useApp();
  const { isMobile } = useBreakpoint();
  const [tab, setTab]               = useState("overview");
  const [search, setSearch]         = useState(false);
  const [profile, setProfile]       = useState(false);
  const [sidebarOpen, setSidebar]   = useState(false);

  const urgentVax         = vaccines.filter((v) => vaxStatus(v.nextDue).key !== "green").length;
  const pendingPay        = payments.filter((p) => p.status === "pendiente").length;
  const pendingAppts      = appointments.filter((a) => a.status === "pendiente").length;
  const pendingReservations = appointments.filter((a) => a.guestName && a.status === "pendiente").length;

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.appBg, fontFamily:T.font }}>
      <Sidebar
        user={currentUser}
        activeTab={tab}
        onTab={setTab}
        onLogout={logout}
        onSearch={() => setSearch(true)}
        onEditProfile={() => setProfile(true)}
        badges={{ vaccines: urgentVax, payments: pendingPay, appointments: pendingAppts, reservations: pendingReservations }}
        isMobile={isMobile}
        open={sidebarOpen}
        onClose={() => setSidebar(false)}
      />
      <div style={{ flex:1, overflow:"auto", minWidth:0 }}>
        {/* Barra superior mobile */}
        {isMobile && (
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"14px 16px", background:T.sb, borderBottom:"1px solid rgba(255,255,255,0.06)",
            position:"sticky", top:0, zIndex:100,
          }}>
            <button
              onClick={() => setSidebar(true)}
              style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#fff",
                width:38, height:38, borderRadius:10, fontSize:20, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
            >☰</button>
            <div style={{ fontSize:17, fontWeight:800, color:"#fff", fontFamily:T.font, letterSpacing:"-0.03em" }}>
              Zo<span style={{ color:"#818CF8" }}>VITA</span>
            </div>
            <div style={{ flex:1 }} />
            <button onClick={() => setSearch(true)}
              style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.6)",
                width:38, height:38, borderRadius:10, fontSize:17, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center" }}>🔍</button>
          </div>
        )}
        {tab === "overview"     && <OverviewView     />}
        {tab === "pets"         && <PetsView         />}
        {tab === "records"      && <RecordsView      />}
        {tab === "grooming"     && <GroomingView     />}
        {tab === "vaccines"     && <VaccinesView     />}
        {tab === "payments"     && <PaymentsView     />}
        {tab === "appointments"  && <AppointmentsView  />}
        {tab === "reservations"  && <ReservationsView  />}
        {tab === "users"         && <UsersView         />}
        {tab === "settings"      && <SettingsView      />}
      </div>

      {profile && <ProfileModal onClose={() => setProfile(false)}/>}

      {search && (
        <SearchModal
          onClose={() => setSearch(false)}
          onNavigate={(t) => { setTab(t); setSearch(false); }}
        />
      )}
    </div>
  );
}
