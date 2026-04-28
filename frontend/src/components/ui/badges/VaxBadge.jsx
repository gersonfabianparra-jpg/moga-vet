import T from "../../../styles/tokens.js";
import { vaxStatus } from "../../../styles/helpers.js";

const Dot = ({ color }) => (
  <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, marginTop:1 }}/>
);

const CFG = {
  red:   { bg: T.redBg,   c: T.redText   },
  amber: { bg: T.amberBg, c: T.amberText },
  green: { bg: T.greenBg, c: T.greenText },
};

export default function VaxBadge({ nextDue }) {
  const s = vaxStatus(nextDue);
  const { bg, c } = CFG[s.key];
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20,
      background:bg, color:c, fontSize:12, fontWeight:600,
    }}>
      <Dot color={s.dot}/>{s.short}
    </span>
  );
}
