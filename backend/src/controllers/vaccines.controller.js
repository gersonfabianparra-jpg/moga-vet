import Vaccine from "../models/Vaccine.js";
import Pet from "../models/Pet.js";

export const getAll = async (req, res, next) => {
  try {
    if (req.user.role === "client") {
      const myPets = await Pet.findByOwnerId(req.user.id);
      const petIds = myPets.map((p) => p.id);
      const all = await Vaccine.findAll();
      return res.json(all.filter((v) => petIds.includes(v.petId)));
    }
    res.json(await Vaccine.findAll());
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const vaccine = await Vaccine.create(req.body);
    res.status(201).json(vaccine);
  } catch (err) {
    next(err);
  }
};
