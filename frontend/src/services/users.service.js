import api from "./api.js";

export const getUsers   = ()         => api.get("/users").then((r) => r.data);
export const createUser = (u)        => api.post("/users", u).then((r) => r.data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then((r) => r.data);
export const removeUser = (id)       => api.delete(`/users/${id}`).then((r) => r.data);
