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
  authorize("admin"),
  eventNotificationController.getAllEventNotifications,
);

eventNotificationRouter.get(
  "/:id",
  authenticate,
  authorize("admin"),
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
