import { createContext, useContext, useReducer, useCallback } from "react";

const NotificationContext = createContext(null);

let nextId = 1;

function reducer(state, action) {
  switch (action.type) {
    case "ADD":    return [...state, action.payload];
    case "REMOVE": return state.filter((n) => n.id !== action.payload);
    default:       return state;
  }
}

export function NotificationProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const notify = useCallback((message, type = "info", duration = 3500) => {
    const id = nextId++;
    dispatch({ type: "ADD", payload: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE", payload: id }), duration);
  }, []);

  const dismiss = useCallback((id) => dispatch({ type: "REMOVE", payload: id }), []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

export const useNotify = () => useContext(NotificationContext).notify;

const TYPE_STYLES = {
  success: { bg: "#16a34a", icon: "✓" },
  error:   { bg: "#dc2626", icon: "✕" },
  warning: { bg: "#d97706", icon: "!" },
  info:    { bg: "#2563eb", icon: "i" },
};

function Toasts({ toasts, onDismiss }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 99999,
      display: "flex", flexDirection: "column", gap: 10,
      pointerEvents: "none",
    }}>
      {toasts.map((t) => {
        const st = TYPE_STYLES[t.type] || TYPE_STYLES.info;
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            style={{
              pointerEvents: "all", cursor: "pointer",
              background: "#fff", borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", minWidth: 280, maxWidth: 380,
              borderLeft: `4px solid ${st.bg}`,
              animation: "toast-in 0.25s ease",
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: st.bg, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>
              {st.icon}
            </div>
            <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, lineHeight: 1.4 }}>
              {t.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
