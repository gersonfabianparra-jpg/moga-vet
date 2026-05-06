import Vaccine from "../models/Vaccine.js";
import Pet from "../models/Pet.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    if (req.user.role === "client") {
      const myPets = await Pet.findByOwnerId(req.user.id, tid(req));
      const petIds = myPets.map((p) => p.id);
      const all = await Vaccine.findAll(tid(req));
      return res.json(all.filter((v) => petIds.includes(v.petId)));
    }
    res.json(await Vaccine.findAll(tid(req)));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const vaccine = await Vaccine.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json(vaccine);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const allowed = ["petId", "name", "dateApplied", "nextDue", "vet", "lot"];
    const fields = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const vaccine = await Vaccine.update(Number(req.params.id), fields);
    res.json(vaccine);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await Vaccine.delete(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
