import T from "../../styles/tokens.js";

export default function Modal({ title, sub, onClose, children, wide }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(8,24,15,0.55)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: isMobile ? "stretch" : "center",
        zIndex: 9999, padding: isMobile ? 0 : 20, backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-enter"
        style={{
          background: T.panel,
          borderRadius: isMobile ? "20px 20px 0 0" : 20,
          width: isMobile ? "100%" : (wide ? 720 : 520),
          maxWidth: isMobile ? "100%" : "100%",
          maxHeight: isMobile ? "92vh" : "92vh",
          overflow: "auto",
          boxShadow: T.xl,
        }}
      >
        <div style={{
          padding: isMobile ? "20px 20px 16px" : "24px 28px 20px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          position: "sticky", top: 0, background: T.panel, zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: T.text, fontFamily: T.font }}>{title}</div>
            {sub && <div style={{ fontSize: 13, color: T.textMuted, marginTop: 3 }}>{sub}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.appBg, border: "none", cursor: "pointer",
              color: T.textMuted, width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}
          >✕</button>
        </div>
        <div style={{ padding: isMobile ? "20px 20px 32px" : 28 }}>{children}</div>
      </div>
    </div>
  );
}
