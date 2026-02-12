import { Router } from "express";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import eventNotificationController from "../controllers/event-notification.controller.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const eventNotificationRouter = Router();

eventNotificationRouter.use(
  createRateLimiter({
    limit: 60,
    windowMs: 60_000,
  }),
);

// overall stats
eventNotificationRouter.get(
  "/stats/overall",
  authenticate,
  authorize("admin"),
  eventNotificationController.getOverallStats,
);

// per-event stats
eventNotificationRouter.get(
  "/stats/event/:id",
  authenticate,
  authorize("admin"),
  eventNotificationController.getEventStats,
);

eventNotificationRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  eventNotificationController.createNotification,
);

eventNotificationRouter.post(
  "/bulk",
  authenticate,
  authorize("admin"),
  eventNotificationController.createBulkNotifications,
);

eventNotificationRouter.get(
  "/",
  authenticate,
  authorize("admin", "officer"),
  eventNotificationController.getAllEventNotifications,
);

eventNotificationRouter.get(
  "/:id",
  authenticate,
  authorize("admin", "officer"),
  eventNotificationController.getEventNotificationById,
);

eventNotificationRouter.put(
  "/:id",
  authenticate,
  authorize("admin"),
  eventNotificationController.updateEventNotification,
);

eventNotificationRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  eventNotificationController.deleteEventNotification,
);

export default eventNotificationRouter;
