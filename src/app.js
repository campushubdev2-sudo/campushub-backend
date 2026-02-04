// @ts-check

// EXTERNAL DEPENDENCIES
import express from "express";
import cors from "cors";

// INTERNAL DEPENDENCIES
import { PORT } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import schoolEventRoutes from "./routes/school-event.routes.js";
import orgRoutes from "./routes/org.routes.js";
import officerRoutes from "./routes/officer.route.js";
import calendarEntryRoutes from "./routes/calendar-entry.route.js";
import eventNotificationRoutes from "./routes/event-notification.route.js";
import reportsRoutes from "./routes/report.route.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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

app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectToDatabase();
});
