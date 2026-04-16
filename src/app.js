const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./modules/auth/auth.routes"));
app.use("/leads", require("./modules/leads/lead.routes"));
app.use("/dashboard", require("./modules/dashboard/dashboard.routes"));
module.exports = app;
