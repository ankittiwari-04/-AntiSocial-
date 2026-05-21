const Story = require("../models/Story");
const cron = require("node-cron");

const startCronJobs = () => {
  cron.schedule("0 * * * *", async () => {
    await Story.deleteMany({ expiresAt: { $lte: new Date() } });
  });
};

module.exports = { startCronJobs };
