const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// --- Middleware
app.use(cors());
app.use(express.json());

// --- MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", () => console.log("✅ MongoDB Connected Successfully"));

// --- Routes (use lowercase route filenames)
const userRoutes = require("./routes/user.routes");
console.log("Registering user routes");
console.log("Available user routes:", userRoutes.stack.map(layer => layer.route?.path || 'no path'));
app.use("/api/users", userRoutes);

app.use("/api/complaints", require("./routes/complaint.routes"));
app.use("/api/feedbacks", require("./routes/feedback.routes"));
app.use("/api/departments", require("./routes/department.routes"));

// --- Health check
app.get("/", (req, res) => res.send("Citizen Department Backend API Running..."));

// --- Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err && err.stack ? err.stack : err);
  res.status(err?.status || 500).json({ message: err?.message || "Internal Server Error" });
});

// --- Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));