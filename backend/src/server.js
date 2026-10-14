require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/db");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

require("./models");

app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database connected and synced");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Unable to connect to DB:", err);
    process.exit(1);
  }
})();
