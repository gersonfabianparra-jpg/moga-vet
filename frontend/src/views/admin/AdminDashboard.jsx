import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { vaxStatus } from "../../styles/helpers.js";
import Sidebar      from "../../components/layout/Sidebar.jsx";
import OverviewView  from "./OverviewView.jsx";
import PetsView      from "./PetsView.jsx";
import RecordsView   from "./RecordsView.jsx";
import GroomingView  from "./GroomingView.jsx";
import VaccinesView  from "./VaccinesView.jsx";
import PaymentsView  from "./PaymentsView.jsx";
import UsersView        from "./UsersView.jsx";
import AppointmentsView from "./AppointmentsView.jsx";
import T from "../../styles/tokens.js";

export default function AdminDashboard() {
  const { currentUser, logout, vaccines, payments, appointments } = useApp();
  const [tab, setTab] = useState("overview");

  const urgentVax     = vaccines.filter((v) => vaxStatus(v.nextDue).key !== "green").length;
  const pendingPay    = payments.filter((p) => p.status === "pendiente").length;
  const pendingAppts  = appointments.filter((a) => a.status === "pendiente").length;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.appBg, fontFamily:T.font }}>
      <Sidebar
        user={currentUser}
        activeTab={tab}
        onTab={setTab}
        onLogout={logout}
        badges={{ vaccines: urgentVax, payments: pendingPay, appointments: pendingAppts }}
      />
      <div style={{ flex:1, overflow:"auto" }}>
        {tab === "overview"  && <OverviewView  />}
        {tab === "pets"      && <PetsView      />}
        {tab === "records"   && <RecordsView   />}
        {tab === "grooming"  && <GroomingView  />}
        {tab === "vaccines"  && <VaccinesView  />}
        {tab === "payments"  && <PaymentsView  />}
        {tab === "appointments" && <AppointmentsView />}
        {tab === "users"        && <UsersView      />}
      </div>
    </div>
  );
}
