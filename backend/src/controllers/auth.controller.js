import jwt from "jsonwebtoken";
import User from "../models/User.js";

const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });

const safeUser = ({ password, ...rest }) => rest;

export const loginStaff = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || user.password !== password || user.role === "client") {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }
    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const loginClient = async (req, res, next) => {
  try {
    const { query } = req.body;
    const user = await User.findByRutOrEmail(query?.trim());
    if (!user || user.role !== "client") {
      return res.status(404).json({ message: "Sin resultados para ese RUT o correo." });
    }
    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
};
