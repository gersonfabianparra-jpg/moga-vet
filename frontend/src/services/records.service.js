import api from "./api.js";

export const getRecords      = ()      => api.get("/records").then((r) => r.data);
export const getRecordsByPet = (petId) => api.get(`/records/pet/${petId}`).then((r) => r.data);
export const createRecord    = (rec)        => api.post("/records", rec).then((r) => r.data);
export const updateRecord    = (id, fields) => api.put(`/records/${id}`, fields).then((r) => r.data);
