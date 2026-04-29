import { Router } from "express";
import supabase    from "../config/supabase.js";
import Appointment from "../models/Appointment.js";
import ClinicSettings from "../models/ClinicSettings.js";

const router = Router();

// ── Genera slots según horario y duración de la clínica ───────────────────────
function generateSlots(openTime = "09:00", closeTime = "18:00", duration = 30) {
  const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toStr  = (m) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
  const slots  = [];
  let cur = toMins(openTime);
  const end = toMins(closeTime);
  while (cur + duration <= end) {
    slots.push(toStr(cur));
    cur += duration;
  }
  return slots;
}

// GET /api/public/info/:tenantId
router.get("/info/:tenantId", async (req, res, next) => {
  try {
    const settings = await ClinicSettings.find(req.params.tenantId);
    if (!settings) return res.status(404).json({ message: "Clínica no encontrada." });
    // No exponer logoBase64 completo en este endpoint (pesado), solo metadatos
    const { logoBase64, ...rest } = settings;
    res.json({ ...rest, hasLogo: !!logoBase64 });
  } catch (err) { next(err); }
});

// GET /api/public/slots/:tenantId?date=YYYY-MM-DD
router.get("/slots/:tenantId", async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Se requiere ?date=YYYY-MM-DD" });

    // Obtener configuración de la clínica para horario y duración
    const settings  = await ClinicSettings.find(tenantId).catch(() => null);
    const openTime  = settings?.openTime            || "09:00";
    const closeTime = settings?.closeTime           || "18:00";
    const duration  = settings?.appointmentDuration || 30;

    const allSlots = generateSlots(openTime, closeTime, duration);

    const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

    // Citas existentes
    const { data: appts } = await supabase
      .from("appointments")
      .select("time, duration")
      .eq("tenantId", tenantId)
      .eq("date", date)
      .not("status", "eq", "cancelada");

    const occupiedByAppt = new Set((appts || []).map((a) => a.time));

    // Slots bloqueados
    const { data: blocks } = await supabase
      .from("blocked_slots")
      .select("startTime, endTime")
      .eq("tenantId", tenantId)
      .eq("date", date)
      .catch(() => ({ data: [] }));

    const isBlocked = (slotTime) => {
      const sm = toMins(slotTime);
      const se = sm + duration;
      return (blocks || []).some((b) => toMins(b.startTime) < se && toMins(b.endTime) > sm);
    };

    res.json(allSlots.map((time) => ({
      time,
      available: !occupiedByAppt.has(time) && !isBlocked(time),
    })));
  } catch (err) { next(err); }
});

// POST /api/public/book/:tenantId  — reserva sin autenticación
router.post("/book/:tenantId", async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const {
      clientName, clientEmail, clientPhone, clientRut,
      petName, petSpecies,
      date, time, type, notes,
    } = req.body;

    if (!clientName || !clientEmail || !date || !time) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    // Verificar que el slot no esté tomado por una cita
    const { data: conflict } = await supabase
      .from("appointments")
      .select("id")
      .eq("tenantId", tenantId)
      .eq("date", date)
      .eq("time", time)
      .not("status", "eq", "cancelada")
      .limit(1);

    if (conflict?.length > 0) {
      return res.status(409).json({ message: "Ese horario ya fue reservado. Por favor elige otro." });
    }

    // Verificar que el slot no esté bloqueado
    const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const slotMins = toMins(time);
    const { data: blocks } = await supabase
      .from("blocked_slots")
      .select("startTime, endTime, reason")
      .eq("tenantId", tenantId)
      .eq("date", date)
      .catch(() => ({ data: [] }));

    const blockedBy = (blocks || []).find((b) => toMins(b.startTime) <= slotMins && toMins(b.endTime) > slotMins);
    if (blockedBy) {
      return res.status(409).json({ message: `Horario no disponible${blockedBy.reason ? `: ${blockedBy.reason}` : ""}. Por favor elige otro.` });
    }

    // Componer notas con datos del cliente
    const clientInfo = [
      `[RESERVA PÚBLICA]`,
      `Cliente: ${clientName}`,
      `Email: ${clientEmail}`,
      clientPhone ? `Teléfono: ${clientPhone}` : null,
      clientRut   ? `RUT: ${clientRut}` : null,
      petName     ? `Mascota: ${petName} (${petSpecies || "—"})` : null,
      notes       ? `Notas: ${notes}` : null,
    ].filter(Boolean).join(" | ");

    const appt = await Appointment.create({
      tenantId,
      clientId:  null,
      petId:     null,
      date,
      time,
      type:      type || "consulta",
      status:    "pendiente",
      notes:     clientInfo,
    });

    res.status(201).json({ ok: true, id: appt.id });
  } catch (err) { next(err); }
});

export default router;
