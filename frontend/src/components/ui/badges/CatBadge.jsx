import T from "../../../styles/tokens.js";

const CFG = {
  Consulta:     { bg: T.blueBg,   c: T.blueText   },
  Urgencia:     { bg: T.redBg,    c: T.redText     },
  "Cirugía":    { bg: T.amberBg,  c: T.amberText   },
  Procedimiento:{ bg: T.purple,   c: T.purpleText  },
  Peluquería:   { bg: T.greenBg,  c: T.greenText   },
};

export default function CatBadge({ cat }) {
  const s = CFG[cat] || { bg:"#f1f5f9", c:"#475569" };
  return (
    <span style={{ padding:"3px 10px", borderRadius:20, background:s.bg, color:s.c, fontSize:12, fontWeight:600 }}>
      {cat}
    </span>
  );
}
