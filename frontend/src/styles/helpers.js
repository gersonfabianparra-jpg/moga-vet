export const fmtCLP = (n) => `$${Number(n).toLocaleString("es-CL")}`;

const TYPE_WA = {
  consulta:   "Consulta veterinaria",
  control:    "Control",
  vacuna:     "Vacunación",
  peluqueria: "Peluquería",
  urgencia:   "Urgencia",
  cirugia:    "Cirugía",
};

const MONTHS_FULL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const fmtDateLong = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${+day} de ${MONTHS_FULL[+m - 1]} de ${y}`;
};

export function buildWhatsAppLink({ phone, name, petName, type, date, time, clinicName, notes }) {
  if (!phone) return null;
  const clean = phone.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  const num = clean.startsWith("56") ? clean : `56${clean.replace(/^0/, "")}`;
  const typeLabel = TYPE_WA[type] || type || "Cita";
  const lines = [
    `Hola ${name ? name.split(" ")[0] : ""}! 👋`,
    "",
    `Te confirmamos tu reserva en *${clinicName || "nuestra clínica"}*:`,
    "",
    `📅 *Fecha:* ${fmtDateLong(date)}`,
    `🕐 *Hora:* ${time || "—"}`,
    `🏥 *Tipo:* ${typeLabel}`,
  ];
  if (petName) lines.push(`🐾 *Mascota:* ${petName}`);
  if (notes)   lines.push(`📝 *Notas:* ${notes}`);
  lines.push("", "Si tienes alguna consulta, escríbenos aquí. ¡Hasta pronto! 🐾");
  return `https://wa.me/${num}?text=${encodeURIComponent(lines.join("\n"))}`;
}
export const fmtDate = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
export const spIcon = (s) => (s === "Gato" ? "🐈" : "🐕");

export const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
export const DAYS_S = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
export const SERVICES = [
  "Baño y corte completo","Baño y secado",
  "Corte de uñas + limpieza ótica","Spa completo","Solo baño",
];
export const VACCINES_LIST = [
  "Antirrábica","Sétuple canina","Triple felina",
  "Leucemia felina","Bordetella","Otra",
];
export const PAY_METHODS = ["Efectivo","Débito","Crédito","Transferencia"];
export const PAY_CATS = ["Consulta","Urgencia","Procedimiento","Cirugía","Peluquería"];

export const vaxStatus = (d) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.round((new Date(d) - today) / 86400000);
  if (diff < 0)   return { key:"red",   dot:"#ef4444", label:`Vencida hace ${Math.abs(diff)}d`, short:"Vencida" };
  if (diff <= 30) return { key:"amber", dot:"#f59e0b", label:`Vence en ${diff} días`,           short:"Próxima" };
  return            { key:"green", dot:"#22c55e", label:`Al día (${diff}d)`,              short:"Al día" };
};

export const calDays = (y, m) => {
  const first = new Date(y, m, 1);
  const last  = new Date(y, m + 1, 0);
  const pad   = (first.getDay() + 6) % 7;
  const days  = Array(pad).fill(null);
  for (let i = 1; i <= last.getDate(); i++) days.push(i);
  return days;
};
