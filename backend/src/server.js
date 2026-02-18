const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

// Routes
const seedRoutes = require("./routes/seed");
const advisorsRoutes = require("./routes/advisors");
const availabilityRoutes = require("./routes/availability");

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.send("API Running");
});

// API routes
app.use("/advisors", advisorsRoutes);
app.use("/availability", availabilityRoutes);

// (temporary) seed routes
app.use("/seed", seedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));