<<<<<<< HEAD
// server.js
=======
>>>>>>> main
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const apiRouter = require("./routes/api");
const errorHandler = require("./middleware/errorMiddleware");

// Load environment variables (.env)
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// Serve static files for images
=======
// Serve static files for images if any
>>>>>>> main
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Load all models (required for Mongoose populate to work correctly)
require('./models/User');
<<<<<<< HEAD
require('./models/Toys');
require('./models/Cart');
=======
require('./models/Toy');
>>>>>>> main
require('./models/Booking');
require('./models/Inspection');
require('./models/Transaction');
require('./models/Rating');

<<<<<<< HEAD


// Routes
app.use("/api", apiRouter);
=======
// Root Landing Page (Home Page Endpoint)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Toy Rental Management System API",
    version: "1.0.0",
    description: "SDN302 Project Backend API built with Node.js, Express, and MongoDB.",
    endpoints: {
      auth: "/api/auth/login, /api/auth/register, /api/auth/logout, /api/auth/refresh-token",
      users: "/api/users/me, /api/users (Admin)",
      toys: "/api/toys, /api/toys/:id, /api/toys/featured, /api/toys/pending",
      bookings: "/api/bookings, /api/bookings/:id, /api/bookings/:id/confirm, /api/bookings/:id/cancel",
      inspections: "/api/bookings/:bookingId/inspections",
      transactions: "/api/bookings/:bookingId/transactions",
      stats: "/api/stats"
    }
  });
});
>>>>>>> main

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running healthy",
    timestamp: new Date().toISOString()
  });
});

<<<<<<< HEAD

=======
// Routes
app.use("/api", apiRouter);

// 404 Route handler
>>>>>>> main
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Resource not found"
  });
});

<<<<<<< HEAD
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message
  });
});

// Error handling middleware (must be last)
=======
// Centralized error handler
>>>>>>> main
app.use(errorHandler);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Restaurant API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

=======
  console.log(`Toy Rental API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
>>>>>>> main
