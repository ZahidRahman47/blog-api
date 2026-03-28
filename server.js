require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Immediately Invoked Async Function to handle DB connection
(async () => {
  try {
    await connectDB(); // Connect to MongoDB
    console.log("MongoDB connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
})();