const repo = require("../repositories/lead.repository");
const activityRepo = require("../repositories/activity.repository");
const redisClient = require("../config/redis");

exports.createLead = async (data, io, user) => {
  await repo.createLead(data);

    // Socket event
  io.to(`tenant_${data.tenantId}`).emit("leadCreated", data);

  // Create activity
  await activityRepo.createActivity({
    action: "CREATE_LEAD",
    description: `Lead ${data.name} created`,
    userId: user.id,
    tenantId: data.tenantId
  });



   //  Clear cache
  await redisClient.del(`dashboard_${data.tenantId}`);

  if (!redisClient.isOpen) {
  console.log("Redis not connected → using DB");
}

  // activity + socket
};