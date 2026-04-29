import Record from "../models/Record.js";
import Pet from "../models/Pet.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    if (req.user.role === "client") {
      const myPets = await Pet.findByOwnerId(req.user.id, tid(req));
      const petIds = myPets.map((p) => p.id);
      const all = await Record.findAll(tid(req));
      return res.json(all.filter((r) => petIds.includes(r.petId)));
    }
    res.json(await Record.findAll(tid(req)));
  } catch (err) {
    next(err);
  }
};

export const getByPet = async (req, res, next) => {
  try {
    res.json(await Record.findByPetId(Number(req.params.petId)));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const record = await Record.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};
