import Payment from "../models/Payment.js";

const tid = (req) => req.user?.role === "superadmin" ? null : (req.user?.tenantId ?? null);

export const getAll = async (req, res, next) => {
  try {
    const payments = req.user.role === "client"
      ? await Payment.findByClientId(req.user.id)
      : await Payment.findAll(tid(req));
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const payment = await Payment.create({ ...req.body, tenantId: req.user.tenantId });
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

export const remove = async (req, res, next) => {
  try {
    await Payment.delete(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
