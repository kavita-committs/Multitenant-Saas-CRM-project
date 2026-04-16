module.exports = (io) => {
  io.on("connection", (socket) => {
    const tenantId = socket.handshake.auth?.tenantId || 1;
    socket.join(`tenant_${tenantId}`);
  });
};
