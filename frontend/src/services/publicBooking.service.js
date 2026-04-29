import api from "./api.js";

export const getClinicInfo = (tenantId) =>
  api.get(`/public/info/${tenantId}`).then((r) => r.data);

export const getSlots = (tenantId, date) =>
  api.get(`/public/slots/${tenantId}?date=${date}`).then((r) => r.data);

export const createBooking = (tenantId, data) =>
  api.post(`/public/book/${tenantId}`, data).then((r) => r.data);
