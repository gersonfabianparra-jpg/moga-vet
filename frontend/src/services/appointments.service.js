import api from "./api.js";

export const getAppointments = (clientId) =>
  api.get("/appointments", clientId ? { params: { clientId } } : {}).then((r) => r.data);

export const createAppointment = (appt) =>
  api.post("/appointments", appt).then((r) => r.data);

export const updateAppointment = (id, fields) =>
  api.put(`/appointments/${id}`, fields).then((r) => r.data);

export const removeAppointment = (id) =>
  api.delete(`/appointments/${id}`).then((r) => r.data);
