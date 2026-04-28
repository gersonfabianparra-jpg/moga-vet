import Payment from "../models/Payment.js";

export const getAll = async (req, res, next) => {
  try {
    const payments = req.user.role === "client"
      ? await Payment.findByClientId(req.user.id)
      : await Payment.findAll();
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

export const markPaid = async (req, res, next) => {
  try {
    const payment = await Payment.markPaid(Number(req.params.id), req.body.method);
    res.json(payment);
  } catch (err) {
    next(err);
  }
};
