const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { openStorage } = require("./storage");
const { createApp } = require("./app");
async function start() {
  const storage = await openStorage(process.env.DATA_FILE || path.resolve(__dirname, "../data/tutorin.json"));
  const app = await createApp(storage);
  const port = Number(process.env.PORT || 5000);
  const server = app.listen(port, process.env.HOST || "127.0.0.1", () => console.log(`Tutor.in API: http://localhost:${port}/api (persistent file storage)`));
  server.on("error", (error) => { console.error(`Server gagal dijalankan: ${error.message}`); process.exitCode = 1; });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
  return server;
}
if (require.main === module) start().catch((error) => { console.error(`Backend gagal dijalankan: ${error.message}`); process.exitCode = 1; });
module.exports = { start };
