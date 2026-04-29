import ClinicSettings from "../models/ClinicSettings.js";

export const getSettings = async (req, res, next) => {
  try {
    const settings = await ClinicSettings.find(req.user.tenantId);
    res.json(settings || {});
  } catch (err) { next(err); }
};

export const saveSettings = async (req, res, next) => {
  try {
    const data = await ClinicSettings.upsert(req.user.tenantId, req.body);
    res.json(data);
  } catch (err) { next(err); }
};
