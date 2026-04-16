require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const { Server } = require("socket.io");
const express = require("express");
app.use(express.static("src"));

const server = http.createServer(app);

//  Socket setup
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Make io accessible everywhere
app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join tenant room
  socket.on("joinTenant", (tenantId) => {
    socket.join(`tenant_${tenantId}`);
    console.log(`User joined tenant_${tenantId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});