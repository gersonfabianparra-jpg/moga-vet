import { createContext, useContext, useReducer, useEffect } from "react";
import api                       from "../services/api.js";
import * as petsService          from "../services/pets.service.js";
import * as recordsService       from "../services/records.service.js";

import * as groomingService      from "../services/grooming.service.js";
import * as vaccinesService      from "../services/vaccines.service.js";
import * as paymentsService      from "../services/payments.service.js";
import * as usersService         from "../services/users.service.js";
import * as appointmentsService  from "../services/appointments.service.js";
import * as blockedSlotsService  from "../services/blockedSlots.service.js";
import * as settingsService      from "../services/settings.service.js";

const AppContext = createContext(null);

const CACHE_KEY = "moga_cache_v2";
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    return Date.now() - ts < CACHE_TTL ? data : null;
  } catch { return null; }
}

function writeCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

const SUPERADMIN_KEY = "moga_root_token";
const SUPERADMIN_USER_KEY = "moga_root_user";

const initialState = {
  currentUser: JSON.parse(localStorage.getItem("moga_user") || "null"),
  users: [], pets: [], records: [], grooming: [], vaccines: [], payments: [],
  appointments: [], blockedSlots: [],
  settings: null,
  loading: false,
  recordsLoaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":    return { ...state, currentUser: action.payload };
    case "LOGOUT":      return { ...initialState, currentUser: null };
    case "SET_DATA":     return { ...state, ...action.payload, loading: false };
    case "SET_SETTINGS": return { ...state, settings: action.payload };
    case "SET_RECORDS":    return { ...state, records: action.payload, recordsLoaded: true };
    case "UPDATE_RECORD":  return { ...state, records: state.records.map((r) => r.id === action.payload.id ? action.payload : r) };
    case "SET_LOADING": return { ...state, loading: action.payload };

    case "ADD_PET":      return { ...state, pets: [...state.pets, action.payload] };
    case "UPDATE_PET":   return { ...state, pets: state.pets.map((p) => p.id === action.payload.id ? action.payload : p) };
    case "REMOVE_PET":   return { ...state, pets: state.pets.filter((p) => p.id !== action.payload) };
    case "ADD_RECORD":   return { ...state, records: [...state.records, action.payload] };
    case "ADD_GROOMING": return { ...state, grooming: [...state.grooming, action.payload] };
    case "REMOVE_GROOMING": return { ...state, grooming: state.grooming.filter((g) => g.id !== action.payload) };
    case "ADD_VACCINE":    return { ...state, vaccines: [...state.vaccines, action.payload] };
    case "UPDATE_VACCINE": return { ...state, vaccines: state.vaccines.map((v) => v.id === action.payload.id ? action.payload : v) };
    case "REMOVE_VACCINE": return { ...state, vaccines: state.vaccines.filter((v) => v.id !== action.payload) };
    case "ADD_PAYMENT":  return { ...state, payments: [...state.payments, action.payload] };
    case "REMOVE_PAYMENT": return { ...state, payments: state.payments.filter((p) => p.id !== action.payload) };
    case "ADD_USER":    return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER": return { ...state, users: state.users.map((u) => u.id === action.payload.id ? action.payload : u) };
    case "REMOVE_USER": return { ...state, users: state.users.filter((u) => u.id !== action.payload) };
    case "UPDATE_GROOMING":
      return { ...state, grooming: state.grooming.map((g) => g.id === action.payload.id ? action.payload : g) };
    case "UPDATE_PAYMENT":
      return { ...state, payments: state.payments.map((p) => p.id === action.payload.id ? action.payload : p) };
    case "ADD_APPOINTMENT":
      return { ...state, appointments: [...state.appointments, action.payload] };
    case "UPDATE_APPOINTMENT":
      return { ...state, appointments: state.appointments.map((a) => a.id === action.payload.id ? action.payload : a) };
    case "REMOVE_APPOINTMENT":
      return { ...state, appointments: state.appointments.filter((a) => a.id !== action.payload) };
    case "ADD_BLOCKED_SLOT":
      return { ...state, blockedSlots: [...state.blockedSlots, action.payload] };
    case "REMOVE_BLOCKED_SLOT":
      return { ...state, blockedSlots: state.blockedSlots.filter((b) => b.id !== action.payload) };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.currentUser) return;
    if (state.currentUser.role === "superadmin") return;
    // Skip if data already in memory (e.g. triggered by updateProfile dispatching SET_USER)
    if (state.pets.length > 0 || state.users.length > 0) return;
    loadAll();
  }, [state.currentUser]);

  // Sync cache whenever mutable data changes so refresh never shows stale data
  useEffect(() => {
    if (!state.currentUser || state.currentUser.role === "superadmin" || state.loading) return;
    const { pets, users, vaccines, grooming, payments, appointments, blockedSlots } = state;
    if (!pets.length && !users.length) return; // skip before first load
    writeCache({ pets, users, vaccines, grooming, payments, appointments, blockedSlots });
  }, [state.pets, state.users, state.vaccines, state.grooming, state.payments, state.appointments, state.blockedSlots]);

  const loadAll = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    // ── Servir desde caché si está vigente ──
    const cached = readCache();
    if (cached) {
      dispatch({ type: "SET_DATA", payload: { ...cached, records: [], recordsLoaded: false } });
      // Fichas en background (caché no incluye records por su tamaño)
      recordsService.getRecords()
        .then((records) => dispatch({ type: "SET_RECORDS", payload: records }))
        .catch(() => dispatch({ type: "SET_RECORDS", payload: [] }));
      return;
    }

    // ── Carga inicial sin records (más rápido) ──
    try {
      const [users, pets, vaccines, grooming, payments, appointments, blockedSlots, settingsData] = await Promise.all([
        usersService.getUsers(),
        petsService.getPets(),
        vaccinesService.getVaccines(),
        groomingService.getGrooming(),
        paymentsService.getPayments(),
        appointmentsService.getAppointments().catch(() => []),
        blockedSlotsService.getBlockedSlots().catch(() => []),
        settingsService.getSettings().catch(() => null),
      ]);
      const fastData = { users, pets, vaccines, grooming, payments, appointments, blockedSlots };
      dispatch({ type: "SET_DATA", payload: { ...fastData, records: [], recordsLoaded: false, settings: settingsData } });
      writeCache(fastData);

      // ── Fichas en background (no bloquean la UI) ──
      recordsService.getRecords()
        .then((records) => dispatch({ type: "SET_RECORDS", payload: records }))
        .catch(() => dispatch({ type: "SET_RECORDS", payload: [] }));
    } catch (err) {
      console.error("Error cargando datos:", err);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const login = (user, token) => {
    localStorage.setItem("moga_token", token);
    localStorage.setItem("moga_user", JSON.stringify(user));
    dispatch({ type: "SET_USER", payload: user });
  };

  const logout = () => {
    localStorage.removeItem("moga_token");
    localStorage.removeItem("moga_user");
    localStorage.removeItem(SUPERADMIN_KEY);
    localStorage.removeItem(SUPERADMIN_USER_KEY);
    sessionStorage.removeItem(CACHE_KEY);
    dispatch({ type: "LOGOUT" });
  };

  const enterClinic = async (tenantId) => {
    const res = await api.post(`/auth/impersonate/${tenantId}`);
    const { token, user } = res.data;
    // Guardar credenciales root para poder volver
    localStorage.setItem(SUPERADMIN_KEY, localStorage.getItem("moga_token"));
    localStorage.setItem(SUPERADMIN_USER_KEY, localStorage.getItem("moga_user"));
    // Activar sesión de clínica
    localStorage.setItem("moga_token", token);
    localStorage.setItem("moga_user", JSON.stringify(user));
    sessionStorage.removeItem(CACHE_KEY);
    dispatch({ type: "LOGOUT" });
    dispatch({ type: "SET_USER", payload: user });
  };

  const exitImpersonation = () => {
    const rootToken = localStorage.getItem(SUPERADMIN_KEY);
    const rootUser  = JSON.parse(localStorage.getItem(SUPERADMIN_USER_KEY) || "null");
    if (!rootToken || !rootUser) { logout(); return; }
    localStorage.setItem("moga_token", rootToken);
    localStorage.setItem("moga_user", JSON.stringify(rootUser));
    localStorage.removeItem(SUPERADMIN_KEY);
    localStorage.removeItem(SUPERADMIN_USER_KEY);
    sessionStorage.removeItem(CACHE_KEY);
    dispatch({ type: "LOGOUT" });
    dispatch({ type: "SET_USER", payload: rootUser });
  };

  const addPet = async (pet) => {
    const data = await petsService.createPet(pet);
    dispatch({ type: "ADD_PET", payload: data });
    return data;
  };
  const updatePet = async (id, fields) => {
    const data = await petsService.updatePet(id, fields);
    dispatch({ type: "UPDATE_PET", payload: data });
    return data;
  };
  const removePet = async (id) => {
    await petsService.deletePet(id);
    dispatch({ type: "REMOVE_PET", payload: id });
  };
  const addRecord = async (rec) => {
    const data = await recordsService.createRecord(rec);
    dispatch({ type: "ADD_RECORD", payload: data });
  };
  const updateRecord = async (id, fields) => {
    const data = await recordsService.updateRecord(id, fields);
    dispatch({ type: "UPDATE_RECORD", payload: data });
    return data;
  };
  const addGrooming = async (appt) => {
    const data = await groomingService.createGrooming(appt);
    dispatch({ type: "ADD_GROOMING", payload: data });
    return data;
  };
  const removeGrooming = async (id) => {
    await groomingService.deleteGrooming(id);
    dispatch({ type: "REMOVE_GROOMING", payload: id });
  };
  const updateGroomingStatus = async (id, status) => {
    const data = await groomingService.updateStatus(id, status);
    dispatch({ type: "UPDATE_GROOMING", payload: data });
  };
  const addVaccine = async (v) => {
    const data = await vaccinesService.createVaccine(v);
    dispatch({ type: "ADD_VACCINE", payload: data });
    return data;
  };
  const updateVaccine = async (id, fields) => {
    const data = await vaccinesService.updateVaccine(id, fields);
    dispatch({ type: "UPDATE_VACCINE", payload: data });
    return data;
  };
  const removeVaccine = async (id) => {
    await vaccinesService.deleteVaccine(id);
    dispatch({ type: "REMOVE_VACCINE", payload: id });
  };
  const addPayment = async (p) => {
    const data = await paymentsService.createPayment(p);
    dispatch({ type: "ADD_PAYMENT", payload: data });
    return data;
  };
  const updatePayment = async (id, fields) => {
    const data = await paymentsService.updatePayment(id, fields);
    dispatch({ type: "UPDATE_PAYMENT", payload: data });
    return data;
  };
  const removePayment = async (id) => {
    await paymentsService.deletePayment(id);
    dispatch({ type: "REMOVE_PAYMENT", payload: id });
  };
  const markPaid = async (id, method) => {
    const data = await paymentsService.markPaid(id, method);
    dispatch({ type: "UPDATE_PAYMENT", payload: data });
  };
  const addAppointment = async (appt) => {
    const data = await appointmentsService.createAppointment(appt);
    dispatch({ type: "ADD_APPOINTMENT", payload: data });
    return data;
  };
  const updateAppointment = async (id, fields) => {
    const data = await appointmentsService.updateAppointment(id, fields);
    dispatch({ type: "UPDATE_APPOINTMENT", payload: data });
    return data;
  };
  const removeAppointment = async (id) => {
    await appointmentsService.removeAppointment(id);
    dispatch({ type: "REMOVE_APPOINTMENT", payload: id });
  };
  const addUser = async (u) => {
    const data = await usersService.createUser(u);
    dispatch({ type: "ADD_USER", payload: data });
    return data;
  };
  const updateUser = async (id, fields) => {
    const data = await usersService.updateUser(id, fields);
    dispatch({ type: "UPDATE_USER", payload: data });
    return data;
  };
  const updateProfile = async (fields) => {
    const id   = state.currentUser.id;
    const data = await usersService.updateUser(id, fields);
    dispatch({ type: "UPDATE_USER", payload: data });
    const updated = { ...state.currentUser, ...data };
    localStorage.setItem("moga_user", JSON.stringify(updated));
    dispatch({ type: "SET_USER", payload: updated });
    return data;
  };
  const removeUser = async (id) => {
    await usersService.removeUser(id);
    dispatch({ type: "REMOVE_USER", payload: id });
  };
  const updateSettings = async (fields) => {
    const data = await settingsService.saveSettings(fields);
    dispatch({ type: "SET_SETTINGS", payload: data });
    return data;
  };
  const addBlockedSlot = async (slot) => {
    const data = await blockedSlotsService.createBlockedSlot(slot);
    dispatch({ type: "ADD_BLOCKED_SLOT", payload: data });
    return data;
  };
  const removeBlockedSlot = async (id) => {
    await blockedSlotsService.removeBlockedSlot(id);
    dispatch({ type: "REMOVE_BLOCKED_SLOT", payload: id });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout, loadAll, updateProfile,
      enterClinic, exitImpersonation,
      addPet, updatePet, removePet,
      addRecord, updateRecord,
      addGrooming, removeGrooming, updateGroomingStatus,
      addVaccine, updateVaccine, removeVaccine,
      addPayment, updatePayment, removePayment, markPaid,
      addUser, updateUser, removeUser,
      addAppointment, updateAppointment, removeAppointment,
      addBlockedSlot, removeBlockedSlot, updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
