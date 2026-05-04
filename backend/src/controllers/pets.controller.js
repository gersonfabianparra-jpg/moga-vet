import Pet from "../models/Pet.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    const pets = req.user.role === "client"
      ? await Pet.findByOwnerId(req.user.id, tid(req))
      : await Pet.findAll(tid(req));
    res.json(pets);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(Number(req.params.id));
    res.json(pet);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const overrides = { tenantId: req.user.tenantId };
    if (req.user.role === "client") overrides.ownerId = req.user.id;
    const pet = await Pet.create({ ...req.body, ...overrides });
    res.status(201).json(pet);
  } catch (err) {
    next(err);
  }
};
