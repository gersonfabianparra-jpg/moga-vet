import api from "./api.js";

export const getVaccines   = ()  => api.get("/vaccines").then((r) => r.data);
export const createVaccine = (v) => api.post("/vaccines", v).then((r) => r.data);
