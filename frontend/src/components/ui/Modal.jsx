import T from "../../styles/tokens.js";

export default function Modal({ title, sub, onClose, children, wide }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(8,24,15,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20, backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-enter"
        style={{
          background: T.panel, borderRadius: 20,
          width: wide ? 720 : 520, maxWidth: "100%",
          maxHeight: "92vh", overflow: "auto", boxShadow: T.xl,
        }}
      >
        <div style={{
          padding: "24px 28px 20px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: T.font }}>{title}</div>
            {sub && <div style={{ fontSize: 13, color: T.textMuted, marginTop: 3 }}>{sub}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.appBg, border: "none", cursor: "pointer",
              color: T.textMuted, width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}
          >✕</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}
