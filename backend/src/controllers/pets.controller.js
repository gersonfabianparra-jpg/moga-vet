import Pet from "../models/Pet.js";

export const getAll = async (req, res, next) => {
  try {
    const pets = req.user.role === "client"
      ? await Pet.findByOwnerId(req.user.id)
      : await Pet.findAll();
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
    const pet = await Pet.create(req.body);
    res.status(201).json(pet);
  } catch (err) {
    next(err);
  }
};
