const service = require("../services/lead.service");

exports.createLead = async (req, res) => {
  const io = req.app.get("io");

  await service.createLead({
    name: req.body.name,
    status: req.body.status,
    tenantId: req.tenantId
  }, io, req.user); // pass user

  res.json({ message: "Lead created" });
};