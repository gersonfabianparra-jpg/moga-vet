import { createContext, useContext, useReducer, useEffect } from "react";
import * as petsService      from "../services/pets.service.js";
import * as recordsService   from "../services/records.service.js";
import * as groomingService  from "../services/grooming.service.js";
import * as vaccinesService  from "../services/vaccines.service.js";
import * as paymentsService  from "../services/payments.service.js";
import * as usersService from "../services/users.service.js";

const AppContext = createContext(null);

const initialState = {
  currentUser: JSON.parse(localStorage.getItem("moga_user") || "null"),
  users: [], pets: [], records: [], grooming: [], vaccines: [], payments: [],
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":       return { ...state, currentUser: action.payload };
    case "LOGOUT":         return { ...initialState, currentUser: null };
    case "SET_DATA":       return { ...state, ...action.payload, loading: false };
    case "SET_LOADING":    return { ...state, loading: action.payload };
    case "ADD_PET":        return { ...state, pets: [...state.pets, action.payload] };
    case "ADD_RECORD":     return { ...state, records: [...state.records, action.payload] };
    case "ADD_GROOMING":   return { ...state, grooming: [...state.grooming, action.payload] };
    case "ADD_VACCINE":    return { ...state, vaccines: [...state.vaccines, action.payload] };
    case "ADD_PAYMENT":    return { ...state, payments: [...state.payments, action.payload] };
    case "ADD_USER":        return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER":     return { ...state, users: state.users.map((u) => u.id === action.payload.id ? action.payload : u) };
    case "REMOVE_USER":     return { ...state, users: state.users.filter((u) => u.id !== action.payload) };
    case "UPDATE_GROOMING":
      return { ...state, grooming: state.grooming.map((g) => g.id === action.payload.id ? action.payload : g) };
    case "UPDATE_PAYMENT":
      return { ...state, payments: state.payments.map((p) => p.id === action.payload.id ? action.payload : p) };
    default:               return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.currentUser) return;
    loadAll();
  }, [state.currentUser]);

  const loadAll = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const [users, pets, records, grooming, vaccines, payments] = await Promise.all([
        usersService.getUsers(),
        petsService.getPets(),
        recordsService.getRecords(),
        groomingService.getGrooming(),
        vaccinesService.getVaccines(),
        paymentsService.getPayments(),
      ]);
      dispatch({ type: "SET_DATA", payload: { users, pets, records, grooming, vaccines, payments } });
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
    dispatch({ type: "LOGOUT" });
  };

  const addPet = async (pet) => {
    const data = await petsService.createPet(pet);
    dispatch({ type: "ADD_PET", payload: data });
  };
  const addRecord = async (rec) => {
    const data = await recordsService.createRecord(rec);
    dispatch({ type: "ADD_RECORD", payload: data });
  };
  const addGrooming = async (appt) => {
    const data = await groomingService.createGrooming(appt);
    dispatch({ type: "ADD_GROOMING", payload: data });
  };
  const updateGroomingStatus = async (id, status) => {
    const data = await groomingService.updateStatus(id, status);
    dispatch({ type: "UPDATE_GROOMING", payload: data });
  };
  const addVaccine = async (v) => {
    const data = await vaccinesService.createVaccine(v);
    dispatch({ type: "ADD_VACCINE", payload: data });
  };
  const addPayment = async (p) => {
    const data = await paymentsService.createPayment(p);
    dispatch({ type: "ADD_PAYMENT", payload: data });
  };
  const markPaid = async (id, method) => {
    const data = await paymentsService.markPaid(id, method);
    dispatch({ type: "UPDATE_PAYMENT", payload: data });
  };
  const addUser = async (u) => {
    const data = await usersService.createUser(u);
    dispatch({ type: "ADD_USER", payload: data });
  };
  const updateUser = async (id, fields) => {
    const data = await usersService.updateUser(id, fields);
    dispatch({ type: "UPDATE_USER", payload: data });
    return data;
  };
  const removeUser = async (id) => {
    await usersService.removeUser(id);
    dispatch({ type: "REMOVE_USER", payload: id });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout,
      addPet, addRecord, addGrooming, updateGroomingStatus,
      addVaccine, addPayment, markPaid, addUser, updateUser, removeUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
