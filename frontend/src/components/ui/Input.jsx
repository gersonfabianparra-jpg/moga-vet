import T from "../../styles/tokens.js";
import Label from "./Label.jsx";

export default function Input({ label, textarea, ...p }) {
  const base = {
    width: "100%", padding: "10px 14px",
    border: `1.5px solid ${T.border}`, borderRadius: 10,
    fontSize: 14, color: T.text, background: T.panel, fontFamily: T.font,
  };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <Label>{label}</Label>}
      {textarea
        ? <textarea className="moga-input" style={{ ...base, resize: "vertical", minHeight: 80 }} {...p} />
        : <input    className="moga-input" style={base} {...p} />
      }
    </div>
  );
}
