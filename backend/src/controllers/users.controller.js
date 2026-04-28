import User from "../models/User.js";

export const getAll = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users.map(({ password, ...u }) => u));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const user = await User.create({ ...req.body, role: "client" });
    const { password, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
};
