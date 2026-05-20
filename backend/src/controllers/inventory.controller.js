import Inventory from "../models/Inventory.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    res.json(await Inventory.findAll(tid(req)));
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const item = await Inventory.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const allowed = ["name", "category", "stock", "minStock", "unit", "price", "notes"];
    const fields = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const item = await Inventory.update(Number(req.params.id), fields);
    res.json(item);
  } catch (err) { next(err); }
};

export const adjustStock = async (req, res, next) => {
  try {
    const delta = Number(req.body.delta);
    if (isNaN(delta)) return res.status(400).json({ error: "delta debe ser un número" });
    const item = await Inventory.adjustStock(Number(req.params.id), delta);
    res.json(item);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await Inventory.delete(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
};
