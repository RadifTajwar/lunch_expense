// server/plugins/cron.js
import { startCronJobs, finalizeMonth } from "~/server/utils/cron.js";

export default defineNitroPlugin(async () => {
  console.log("✅ Cron scheduler initialized");

  // Start the scheduled job(s)
  startCronJobs();

  // ⚡ Uncomment this line if you want to run it immediately for testing
  // await finalizeMonth();
});
