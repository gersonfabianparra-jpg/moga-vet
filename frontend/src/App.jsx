import { useApp } from "./context/AppContext.jsx";
import LoginView        from "./views/LoginView.jsx";
import AdminDashboard   from "./views/admin/AdminDashboard.jsx";
import ClientPortal     from "./views/client/ClientPortal.jsx";

export default function App() {
  const { currentUser } = useApp();

  if (!currentUser)           return <LoginView />;
  if (currentUser.role === "client") return <ClientPortal />;
  return <AdminDashboard />;
}
