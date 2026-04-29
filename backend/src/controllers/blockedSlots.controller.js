import BlockedSlot from "../models/BlockedSlot.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    const slots = await BlockedSlot.findAll(tid(req));
    res.json(slots);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const slot = await BlockedSlot.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json(slot);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await BlockedSlot.remove(+req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};
