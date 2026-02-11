// @ts-check

// EXTERNAL DEPENDENCIES
import express from "express";
import cors from "cors";

// INTERNAL DEPENDENCIES
import { PORT, NODE_ENV } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import requestLogger from "./middlewares/request-logger.middleware.js";

// ROUTES
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import schoolEventRoutes from "./routes/school-event.routes.js";
import orgRoutes from "./routes/org.routes.js";
import officerRoutes from "./routes/officer.route.js";
import calendarEntryRoutes from "./routes/calendar-entry.route.js";
import eventNotificationRoutes from "./routes/event-notification.route.js";
import reportsRoutes from "./routes/report.route.js";
import auditLogRoutes from "./routes/audit-log.route.js";

const app = express();

app.set("trust proxy", 1);

if (NODE_ENV === "development") {
  app.use(cors({ origin: "http://localhost:5173" }));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (NODE_ENV === "development") {
  app.use(requestLogger);
}

app.get("/", (_, res) => {
  res.send("Welcome to the campushub API!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/school-events", schoolEventRoutes);
app.use("/api/v1/orgs", orgRoutes);
app.use("/api/v1/officers", officerRoutes);
app.use("/api/v1/calendar-entries", calendarEntryRoutes);
app.use("/api/v1/event-notifications", eventNotificationRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorMiddleware);

const server = app.listen(PORT, async () => {
  await connectToDatabase();

  if (NODE_ENV === "development") {
    console.log(`Server is listening at http://localhost:${PORT}`);
  } else {
    console.log(`Server is running on on port ${PORT}`);
  }
});

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});
