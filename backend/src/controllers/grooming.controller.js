import Grooming from "../models/Grooming.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    const appts = req.user.role === "client"
      ? await Grooming.findByClientId(req.user.id)
      : await Grooming.findAll(tid(req));
    res.json(appts);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const clientId = req.user.role === "client" ? req.user.id : req.body.clientId;
    const appt = await Grooming.create({ ...req.body, clientId, tenantId: req.user.tenantId });
    res.status(201).json(appt);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const appt = await Grooming.updateStatus(Number(req.params.id), req.body.status);
    res.json(appt);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await Grooming.delete(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
