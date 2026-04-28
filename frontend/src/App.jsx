import { useApp } from "./context/AppContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import LoginView        from "./views/LoginView.jsx";
import AdminDashboard   from "./views/admin/AdminDashboard.jsx";
import ClientPortal     from "./views/client/ClientPortal.jsx";

function Inner() {
  const { currentUser } = useApp();
  if (!currentUser)                  return <LoginView />;
  if (currentUser.role === "client") return <ClientPortal />;
  return <AdminDashboard />;
}

export default function App() {
  return (
    <NotificationProvider>
      <Inner />
    </NotificationProvider>
  );
}
