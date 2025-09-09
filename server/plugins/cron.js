// server/plugins/cron.js
import "~/server/utils/cron.js";

export default defineNitroPlugin(() => {
  console.log("✅ Cron scheduler initialized");
});
