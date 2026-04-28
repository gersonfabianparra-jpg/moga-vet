import api from "./api.js";

export const getPayments   = ()           => api.get("/payments").then((r) => r.data);
export const createPayment = (p)          => api.post("/payments", p).then((r) => r.data);
export const markPaid      = (id, method) => api.patch(`/payments/${id}/pay`, { method }).then((r) => r.data);
