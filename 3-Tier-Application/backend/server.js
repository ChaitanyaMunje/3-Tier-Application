const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3030;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ MONGO_URL is not defined");
  process.exit(1);
}
// Middleware
app.use(express.json());

/**
 * Health / Root Route
 */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "🚀 Task API server is running"
  });
});

// MongoDB connection
// for local Docker with setup
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected (local Docker)"))
  .catch(err => console.log(err));

  
// for local development without Docker to do local testing of our application
// mongoose
//   .connect("mongodb://localhost:27017/taskdb")
//   .then(() => console.log("MongoDB connected (local development)"))
//   .catch(err => console.log(err));

// Routes
const taskRoutes = require("./routes/tasksRoutes");
app.use("/", taskRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
