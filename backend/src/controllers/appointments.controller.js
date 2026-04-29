import Appointment from "../models/Appointment.js";

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
