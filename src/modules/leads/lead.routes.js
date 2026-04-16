const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth.middleware");
const controller = require("../../controllers/lead.controller");
const rbac = require("../../middleware/rbac.middleware");


// router.post("/", auth, controller.createLead);

router.post(
  "/",
  auth,
  rbac(["admin", "manager"]), //  only these roles allowed
  controller.createLead
);

//console.log("USER:", req.user);
module.exports = router;
