import { Router } from "express";

import {
  authorize,
  authenticate,
  optionalAuthenticate,
} from "../middlewares/auth.middleware.js";
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
  authorize("admin", "adviser"),
  calendarEntryController.createCalendarEntry,
);

calendarEntryRouter.get(
  "/",
  optionalAuthenticate,
  authorize("admin", "student", "officer", "guest"),
  calendarEntryController.getAll,
);

calendarEntryRouter.get(
  "/:id",
  optionalAuthenticate,
  authorize("admin", "student", "guest", "officer"),
  calendarEntryController.getCalendarEntryById,
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
