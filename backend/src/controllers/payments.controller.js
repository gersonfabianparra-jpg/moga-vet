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

export const update = async (req, res, next) => {
  try {
    const payment = await Payment.update(Number(req.params.id), req.body);
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

export const abono = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Monto debe ser mayor a 0" });
    const payment = await Payment.abono(Number(req.params.id), amount, req.body.method || null);
    res.json(payment);
  } catch (err) { next(err); }
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
