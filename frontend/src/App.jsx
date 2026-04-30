import { useState } from "react";
import { useApp } from "./context/AppContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import LandingView         from "./views/LandingView.jsx";
import LoginView           from "./views/LoginView.jsx";
import AdminDashboard      from "./views/admin/AdminDashboard.jsx";
import SuperAdminDashboard from "./views/superadmin/SuperAdminDashboard.jsx";
import ClientPortal        from "./views/client/ClientPortal.jsx";
import PublicBookView      from "./views/public/PublicBookView.jsx";

// Detecta ruta de reserva pública: /#/reservar  o  /#/reservar/TENANT_ID
function getPublicBookingTenant() {
  const hash = window.location.hash;
  if (hash === "#/reservar" || hash.startsWith("#/reservar?")) return "default";
  if (hash.startsWith("#/reservar/")) {
    return hash.replace("#/reservar/", "").split("?")[0].trim() || "default";
  }
  return null;
}

function Inner() {
  const { currentUser } = useApp();
  const [page, setPage] = useState("landing");

  // Reserva pública — accesible sin login
  const publicTenant = getPublicBookingTenant();
  if (publicTenant) return <PublicBookView tenantId={publicTenant} />;

  if (currentUser) {
    if (currentUser.role === "superadmin") return <SuperAdminDashboard />;
    if (currentUser.role === "client")     return <ClientPortal />;
    return <AdminDashboard />;
  }

  if (page === "login") return <LoginView />;
  return <LandingView onLogin={() => setPage("login")} />;
}

export default function App() {
  return (
    <NotificationProvider>
      <Inner />
    </NotificationProvider>
  );
}
