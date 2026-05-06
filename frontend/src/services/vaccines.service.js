import api from "./api.js";

export const getVaccines   = ()           => api.get("/vaccines").then((r) => r.data);
export const createVaccine = (v)          => api.post("/vaccines", v).then((r) => r.data);
export const updateVaccine = (id, fields) => api.patch(`/vaccines/${id}`, fields).then((r) => r.data);
export const deleteVaccine = (id)         => api.delete(`/vaccines/${id}`).then((r) => r.data);
