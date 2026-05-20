import api from "./api.js";

export const getPayments   = ()           => api.get("/payments").then((r) => r.data);
export const createPayment = (p)          => api.post("/payments", p).then((r) => r.data);
export const markPaid      = (id, method) => api.patch(`/payments/${id}/pay`, { method }).then((r) => r.data);
export const updatePayment = (id, fields) => api.put(`/payments/${id}`, fields).then((r) => r.data);
export const deletePayment = (id)         => api.delete(`/payments/${id}`).then((r) => r.data);
export const abonoPayment  = (id, amount, method) => api.patch(`/payments/${id}/abono`, { amount, method }).then((r) => r.data);
