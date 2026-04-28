import Appointment from "../models/Appointment.js";

export const getAll = async (req, res, next) => {
  try {
    const { clientId } = req.query;
    const data = clientId
      ? await Appointment.findByClientId(+clientId)
      : await Appointment.findAll();
    res.json(data);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const appt = await Appointment.create(req.body);
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
