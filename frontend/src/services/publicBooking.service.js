import api from "./api.js";

export const getClinicInfo = (tenantId) =>
  tenantId === "default"
    ? api.get("/public/default").then((r) => r.data)
    : api.get(`/public/info/${tenantId}`).then((r) => r.data);

export const getSlots = (tenantId, date) =>
  api.get(`/public/slots/${tenantId}?date=${date}`).then((r) => r.data);

export const createBooking = (tenantId, data) =>
  api.post(`/public/book/${tenantId}`, data).then((r) => r.data);
