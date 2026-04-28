import T from "../../../styles/tokens.js";

const Dot = ({ color }) => (
  <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, marginTop:1 }}/>
);

const CFG = {
  confirmada: { bg: T.green,  c: T.greenText, dot:"#22c55e", l:"Confirmada" },
  pendiente:  { bg: T.amber,  c: T.amberText, dot:"#f59e0b", l:"Pendiente"  },
  completada: { bg: "#f1f5f9",c: "#475569",   dot:"#94a3b8", l:"Completada" },
  cancelada:  { bg: T.red,    c: T.redText,   dot:"#ef4444", l:"Cancelada"  },
};

export default function StatusBadge({ status }) {
  const s = CFG[status] || CFG.pendiente;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20,
      background:s.bg, color:s.c, fontSize:12, fontWeight:600,
    }}>
      <Dot color={s.dot}/>{s.l}
    </span>
  );
}
