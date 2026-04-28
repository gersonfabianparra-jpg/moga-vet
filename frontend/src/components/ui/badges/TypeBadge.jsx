import T from "../../../styles/tokens.js";

const CFG = {
  Control:    { bg: T.blueBg,  c: T.blueText  },
  Urgencia:   { bg: T.redBg,   c: T.redText   },
  "Cirugía":  { bg: T.amberBg, c: T.amberText },
  Vacunación: { bg: T.green,   c: T.greenText },
};

export default function TypeBadge({ type }) {
  const s = CFG[type] || { bg:"#f1f5f9", c:"#475569" };
  return (
    <span style={{ padding:"3px 10px", borderRadius:20, background:s.bg, color:s.c, fontSize:12, fontWeight:600 }}>
      {type}
    </span>
  );
}
