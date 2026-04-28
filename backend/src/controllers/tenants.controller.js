import Tenant from "../models/Tenant.js";
import User   from "../models/User.js";
import jwt    from "jsonwebtoken";

export const getAll = async (req, res, next) => {
  try {
    const tenants = await Tenant.findAll();
    res.json(tenants);
  } catch (err) { next(err); }
};

export const register = async (req, res, next) => {
  try {
    const { clinicName, ownerName, email, password, phone, city, plan } = req.body;

    if (!clinicName || !email || !password) {
      return res.status(400).json({ message: "clinicName, email y password son obligatorios." });
    }

    // Verificar email duplicado
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Ya existe una cuenta con ese correo." });
    }

    // Crear tenant
    const tenant = await Tenant.create({
      name:       clinicName,
      adminEmail: email,
      phone:      phone || null,
      city:       city  || null,
      plan:       plan  || "Starter",
      status:     "active",
      createdAt:  new Date().toISOString().slice(0, 10),
    });

    // Crear usuario admin para el tenant
    const adminUser = await User.create({
      name:     ownerName || clinicName,
      email,
      password,
      role:     "admin",
      tenantId: tenant.id,
      phone:    phone || null,
      avatar:   (ownerName || clinicName).slice(0, 2).toUpperCase(),
    });

    const token = jwt.sign(
      { id: adminUser.id, role: adminUser.role, tenantId: tenant.id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const { password: _, ...safeUser } = adminUser;
    res.status(201).json({ token, user: safeUser, tenant });
  } catch (err) { next(err); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const tenant = await Tenant.update(+req.params.id, { status: req.body.status });
    res.json(tenant);
  } catch (err) { next(err); }
};
