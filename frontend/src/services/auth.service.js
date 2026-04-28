import api from "./api.js";

export const loginStaff = (email, password) =>
  api.post("/auth/login/staff", { email, password }).then((r) => r.data);

export const loginClient = (query) =>
  api.post("/auth/login/client", { query }).then((r) => r.data);

export const getMe = () =>
  api.get("/auth/me").then((r) => r.data);

export const registerClinic = (data) =>
  api.post("/tenants/register", data).then((r) => r.data);
