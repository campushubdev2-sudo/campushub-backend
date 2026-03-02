// @ts-check

// EXTERNAL DEPENDENCIES
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// INTERNAL DEPENDENCIES
import { PORT, NODE_ENV, CLIENT_URL } from "./config/env.js";
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
const isDev = NODE_ENV === "development";
/** @type {import("http").Server} */
let server;

app.set("trust proxy", true);

if (isDev) {
  app.use(requestLogger);
}

app.use(cors({ origin: NODE_ENV === "development" ? "http://localhost:5173" : CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
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

(async () => {
  try {
    await connectToDatabase();

    server = app.listen(PORT, () => {
      if (isDev) {
        console.log(`Server is listening at http://localhost:${PORT}`);
      } else {
        console.log(`Server is running on port ${PORT}`);
      }
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();

const shutdown = () => {
  console.log("Shutting down...");
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
