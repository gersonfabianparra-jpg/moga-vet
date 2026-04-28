import Grooming from "../models/Grooming.js";

export const getAll = async (req, res, next) => {
  try {
    const appts = req.user.role === "client"
      ? await Grooming.findByClientId(req.user.id)
      : await Grooming.findAll();
    res.json(appts);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const clientId = req.user.role === "client" ? req.user.id : req.body.clientId;
    const appt = await Grooming.create({ ...req.body, clientId });
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
