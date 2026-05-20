import Appointment from "../models/Appointment.js";
import supabase from "../config/supabase.js";
import { store } from "../data/localStore.js";
import ClinicSettings from "../models/ClinicSettings.js";
import { sendConfirmation } from "../utils/mailer.js";

const useLocal = () => process.env.USE_LOCAL === "true" || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project");
const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    const { clientId } = req.query;
    const data = clientId
      ? await Appointment.findByClientId(+clientId)
      : await Appointment.findAll(tid(req));
    res.json(data);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const appt = await Appointment.create({ ...req.body, tenantId: req.user.tenantId });

    // Enviar email al cliente si tiene correo registrado
    const { clientId, petId, type, date, time, notes } = req.body;
    if (clientId) {
      try {
        let clientEmail = null, clientName = null, petName = null;
        if (useLocal()) {
          const u = store.users.findById(+clientId);
          clientEmail = u?.email; clientName = u?.name;
          if (petId) petName = store.pets.findById(+petId)?.name;
        } else {
          const [{ data: user }, { data: pet }] = await Promise.all([
            supabase.from("users").select("name,email").eq("id", clientId).single(),
            petId ? supabase.from("pets").select("name").eq("id", petId).single() : { data: null },
          ]);
          clientEmail = user?.email; clientName = user?.name;
          petName = pet?.name || null;
        }
        const settings = await ClinicSettings.find(req.user.tenantId).catch(() => null);
        if (clientEmail) {
          sendConfirmation({
            to: clientEmail, toName: clientName, petName,
            type, date, time, notes: notes || null,
            clinicName:  settings?.clinicName  || "Clínica Veterinaria",
            clinicPhone: settings?.phone       || null,
            logoBase64:  settings?.logoBase64  || null,
          });
        }
      } catch (mailErr) {
        console.error("[mailer] Error preparando correo:", mailErr?.message);
      }
    }

    res.status(201).json(appt);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const appt = await Appointment.update(+req.params.id, req.body);
    res.json(appt);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await Appointment.remove(+req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};
