import { useState } from "react";
import { useApp } from "./context/AppContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import LandingView         from "./views/LandingView.jsx";
import LoginView           from "./views/LoginView.jsx";
import RegisterView        from "./views/RegisterView.jsx";
import AdminDashboard      from "./views/admin/AdminDashboard.jsx";
import SuperAdminDashboard from "./views/superadmin/SuperAdminDashboard.jsx";
import ClientPortal        from "./views/client/ClientPortal.jsx";

function Inner() {
  const { currentUser } = useApp();
  const [page, setPage] = useState("landing");

  if (currentUser) {
    if (currentUser.role === "superadmin") return <SuperAdminDashboard />;
    if (currentUser.role === "client")     return <ClientPortal />;
    return <AdminDashboard />;
  }

  if (page === "login")    return <LoginView    onRegister={() => setPage("register")} />;
  if (page === "register") return <RegisterView onLogin={() => setPage("login")} />;
  return <LandingView onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
}

export default function App() {
  return (
    <NotificationProvider>
      <Inner />
    </NotificationProvider>
  );
}
