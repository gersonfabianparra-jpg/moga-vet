import T from "../../styles/tokens.js";
import Label from "./Label.jsx";

export default function Select({ label, children, ...p }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <Label>{label}</Label>}
      <select
        className="moga-input"
        style={{
          width: "100%", padding: "10px 14px",
          border: `1.5px solid ${T.border}`, borderRadius: 10,
          fontSize: 14, color: T.text, background: T.panel,
          fontFamily: T.font, cursor: "pointer",
        }}
        {...p}
      >
        {children}
      </select>
    </div>
  );
}
