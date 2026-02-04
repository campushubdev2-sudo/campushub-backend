import { Router } from "express";

import { authorize, authenticate } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";
import calendarEntryController from "../controllers/calendar-entry.controller.js";

const calendarEntryRouter = Router();

calendarEntryRouter.use(
  createRateLimiter({
    limit: 60,
    windowMs: 60_000,
  }),
);

calendarEntryRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  calendarEntryController.createCalendarEntry,
);

calendarEntryRouter.get(
  "/",
  authenticate,
  authorize("admin"),
  calendarEntryController.getAll,
);

calendarEntryRouter.get(
  "/stats",
  authenticate,
  authorize("admin"),
  calendarEntryController.getCalendarStats,
);

calendarEntryRouter.put(
  "/:id",
  authenticate,
  authorize("admin"),
  calendarEntryController.updateCalendarEntry,
);

calendarEntryRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  calendarEntryController.deleteCalendarEntry,
);

export default calendarEntryRouter;
