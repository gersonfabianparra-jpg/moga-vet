import supabase from "../config/supabase.js";
import User from "../models/User.js";

export const getGlobalStats = async (req, res, next) => {
  try {
    const [
      { count: totalTenants },
      { count: totalUsers },
      { count: totalPets },
      { count: totalAppointments },
      { count: totalRecords },
      { count: totalPayments },
      { count: totalVaccines },
    ] = await Promise.all([
      supabase.from("tenants").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("pets").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("records").select("*", { count: "exact", head: true }),
      supabase.from("payments").select("*", { count: "exact", head: true }),
      supabase.from("vaccines").select("*", { count: "exact", head: true }),
    ]);

    // Revenue totals
    const { data: paidPayments } = await supabase
      .from("payments").select("amount,tenantId").eq("status", "pagado");
    const totalRevenue = (paidPayments || []).reduce((s, p) => s + (p.amount || 0), 0);

    // Per-tenant stats
    const { data: tenantStats } = await supabase
      .from("users").select("tenantId").not("tenantId", "is", null);
    const usersByTenant = {};
    (tenantStats || []).forEach(({ tenantId }) => {
      usersByTenant[tenantId] = (usersByTenant[tenantId] || 0) + 1;
    });

    const { data: petStats } = await supabase
      .from("pets").select("tenantId");
    const petsByTenant = {};
    (petStats || []).forEach(({ tenantId }) => {
      petsByTenant[tenantId] = (petsByTenant[tenantId] || 0) + 1;
    });

    res.json({
      totals: { tenants: totalTenants, users: totalUsers, pets: totalPets, appointments: totalAppointments, records: totalRecords, payments: totalPayments, vaccines: totalVaccines, revenue: totalRevenue },
      byTenant: { users: usersByTenant, pets: petsByTenant },
    });
  } catch (err) {
    next(err);
  }
};

export const getUsersByTenant = async (req, res, next) => {
  try {
    const tenantId = Number(req.params.tenantId);
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,phone,rut,tenantId,avatar")
      .eq("tenantId", tenantId)
      .order("id");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }
    const { data, error } = await supabase
      .from("users").update({ password }).eq("id", id).select("id,name,email").single();
    if (error) throw error;
    res.json({ ok: true, user: data });
  } catch (err) {
    next(err);
  }
};

export const deleteUserAdmin = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "Usuario no encontrado." });
    if (target.rut === "__root__") return res.status(403).json({ message: "No se puede eliminar el root." });
    await User.remove(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
