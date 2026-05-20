import { Router } from "express";
import supabase      from "../config/supabase.js";
import Appointment   from "../models/Appointment.js";
import ClinicSettings from "../models/ClinicSettings.js";
import { store } from "../data/localStore.js";
import { sendConfirmation } from "../utils/mailer.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateSlots(openTime = "09:00", closeTime = "18:00", duration = 30) {
  const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toStr  = (m) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
  const slots  = [];
  let cur = toMins(openTime);
  const end = toMins(closeTime);
  while (cur + duration <= end) { slots.push(toStr(cur)); cur += duration; }
  return slots;
}

// Resuelve "default" al tenantId real de la primera clínica configurada
async function resolveTenantId(tenantId) {
  if (tenantId !== "default") return tenantId;
  const { data } = await supabase.from("clinic_settings").select("tenantId").limit(1).maybeSingle();
  return data?.tenantId ?? null;
}

// GET /api/public/default — primera clínica (booking sin tenantId en URL)
router.get("/default", async (req, res, next) => {
  try {
    const { data } = await supabase.from("clinic_settings").select("*").limit(1).maybeSingle();
    if (!data) return res.status(404).json({ message: "No hay clínica configurada aún." });
    const { logoBase64, ...rest } = data;
    res.json({ ...rest, hasLogo: !!logoBase64 });
  } catch (err) { next(err); }
});

// GET /api/public/info/:tenantId
router.get("/info/:tenantId", async (req, res, next) => {
  try {
    const settings = await ClinicSettings.find(req.params.tenantId);
    if (!settings) return res.status(404).json({ message: "Clínica no encontrada." });
    res.json(settings);
  } catch (err) { next(err); }
});

// GET /api/public/slots/:tenantId?date=YYYY-MM-DD
router.get("/slots/:tenantId", async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Se requiere ?date=YYYY-MM-DD" });

    const tenantId = await resolveTenantId(req.params.tenantId);
    if (!tenantId) return res.status(404).json({ message: "Clínica no encontrada." });

    const settings  = await ClinicSettings.find(tenantId).catch(() => null);
    const openTime  = settings?.openTime            || "09:00";
    const closeTime = settings?.closeTime           || "18:00";
    const duration  = Number(settings?.appointmentDuration) || 30;
    const toMins    = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

    const allSlots = generateSlots(openTime, closeTime, duration);

    const [{ data: appts }, { data: blocks }] = await Promise.all([
      supabase.from("appointments").select("time").eq("tenantId", tenantId).eq("date", date).not("status", "eq", "cancelada"),
      supabase.from("blocked_slots").select("startTime, endTime").eq("tenantId", tenantId).eq("date", date),
    ]);

    const occupiedByAppt = new Set((appts || []).map((a) => a.time));
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

// POST /api/public/book/:tenantId — reserva sin autenticación
router.post("/book/:tenantId", async (req, res, next) => {
  try {
    const tenantId = await resolveTenantId(req.params.tenantId);
    if (!tenantId) return res.status(404).json({ message: "Clínica no encontrada." });

    const { clientName, clientEmail, clientPhone, clientRut, petName, petSpecies, date, time, type, notes } = req.body;

    if (!clientName || !clientEmail || !date || !time) {
      return res.status(400).json({ message: "Faltan campos obligatorios (nombre, correo, fecha, hora)." });
    }

    const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const slotMins = toMins(time);

    const [{ data: conflict }, { data: blocks }] = await Promise.all([
      supabase.from("appointments").select("id").eq("tenantId", tenantId).eq("date", date).eq("time", time).not("status", "eq", "cancelada").limit(1),
      supabase.from("blocked_slots").select("startTime, endTime, reason").eq("tenantId", tenantId).eq("date", date),
    ]);

    if (conflict?.length > 0) {
      return res.status(409).json({ message: "Ese horario ya fue reservado. Elige otro." });
    }

    const blockedBy = (blocks || []).find((b) => toMins(b.startTime) <= slotMins && toMins(b.endTime) > slotMins);
    if (blockedBy) {
      return res.status(409).json({ message: `Horario no disponible${blockedBy.reason ? `: ${blockedBy.reason}` : ""}. Elige otro.` });
    }

    const appt = await Appointment.create({
      tenantId,
      date,
      time,
      duration:        30,
      type:            type || "consulta",
      status:          "pendiente",
      notes:           notes || null,
      guestName:       clientName,
      guestEmail:      clientEmail,
      guestPhone:      clientPhone  || null,
      guestRut:        clientRut    || null,
      guestPetName:    petName      || null,
      guestPetSpecies: petSpecies   || null,
    });

    // Enviar email de confirmación (sin bloquear la respuesta)
    if (clientEmail) {
      const settings = await ClinicSettings.find(tenantId).catch(() => null);
      sendConfirmation({
        to:          clientEmail,
        toName:      clientName,
        petName:     petName || null,
        type:        type || "consulta",
        date,
        time,
        notes:       notes || null,
        clinicName:  settings?.clinicName  || "Clínica Veterinaria",
        clinicPhone: settings?.phone       || null,
        logoBase64:  settings?.logoBase64  || null,
      });
    }

    res.status(201).json({ ok: true, id: appt.id });
  } catch (err) { next(err); }
});

// GET /api/public/pet-card/:petId — cartola sanitaria pública (sin auth)
router.get("/pet-card/:petId", async (req, res, next) => {
  try {
    const petId = Number(req.params.petId);
    if (isNaN(petId)) return res.status(400).json({ message: "ID inválido" });

    if (useLocal()) {
      const pet      = store.pets.findById(petId);
      if (!pet) return res.status(404).json({ message: "Mascota no encontrada" });
      const owner    = store.users.findById(pet.ownerId);
      const vaccines = store.vaccines.findAll(pet.tenantId).filter((v) => v.petId === petId);
      const settings = null;
      return res.json({ pet, owner: owner ? { name: owner.name, phone: owner.phone } : null, vaccines, settings });
    }

    const { data: pet, error: pe } = await supabase.from("pets").select("*").eq("id", petId).single();
    if (pe || !pet) return res.status(404).json({ message: "Mascota no encontrada" });

    const [{ data: vaccines }, { data: owner }, settingsData] = await Promise.all([
      supabase.from("vaccines").select("*").eq("petId", petId).order("dateApplied", { ascending: false }),
      pet.ownerId ? supabase.from("users").select("name,phone").eq("id", pet.ownerId).single() : { data: null },
      ClinicSettings.find(pet.tenantId).catch(() => null),
    ]);

    res.json({
      pet,
      owner: owner ? { name: owner.name, phone: owner.phone } : null,
      vaccines: vaccines || [],
      settings: settingsData ? { clinicName: settingsData.clinicName, logoBase64: settingsData.logoBase64, phone: settingsData.phone } : null,
    });
  } catch (err) { next(err); }
});

export default router;
