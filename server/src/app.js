const express = require("express");
const cors = require("cors");
const api = require("./routes/api");
const { errorHandler } = require("./middleware/middleware");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api", api);
app.use(errorHandler);

module.exports = app;
