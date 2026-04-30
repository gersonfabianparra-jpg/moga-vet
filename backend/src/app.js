import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import petsRoutes from "./routes/pets.routes.js";
import recordsRoutes from "./routes/records.routes.js";
import groomingRoutes from "./routes/grooming.routes.js";
import vaccinesRoutes from "./routes/vaccines.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import usersRoutes        from "./routes/users.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import tenantsRoutes      from "./routes/tenants.routes.js";
import blockedSlotsRoutes from "./routes/blockedSlots.routes.js";
import photosRoutes        from "./routes/photos.routes.js";
import settingsRoutes      from "./routes/settings.routes.js";
import publicRoutes        from "./routes/public.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:4173",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permitir sin origin (curl, apps móviles) y origins en lista
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) return cb(null, true);
    // Rutas públicas (reserva online) permiten cualquier origin
    cb(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: "12mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/grooming", groomingRoutes);
app.use("/api/vaccines", vaccinesRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/users",        usersRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/tenants",       tenantsRoutes);
app.use("/api/blocked-slots", blockedSlotsRoutes);
app.use("/api/photos",        photosRoutes);
app.use("/api/settings",      settingsRoutes);
app.use("/api/public",        publicRoutes);

app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🐾 MOGA Backend corriendo en http://localhost:${PORT}`);
  });
}

export default app;
