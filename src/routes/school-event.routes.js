// @ts-check
import { Router } from "express";

import schoolEventController from "../controllers/school-event.controller.js";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const eventRouter = Router();

eventRouter.use(
  createRateLimiter({
    limit: 60,
    windowMs: 60_000,
  }),
);

// CREATE
eventRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  schoolEventController.createNewEvent,
);

/**
 * Fetch All Events (Default)
 *  GET /events
 *
 * Fetch Upcoming Events Only
 *  GET /events?type=upcoming
 *
 * Fetch Past Events Only
 *  GET /events?type=past
 *
 * Fetch Events by Title
 *  GET /events?title=exam
 *
 * Fetch Events by Venue
 *  GET /events?venue=hall
 *
 * Fetch Events Organized by a Specific Department or Admin
 *  GET /events?organizedBy=department
 *
 * Fetch Events for a Specific Date
 *  GET /events?date=2026-02-15
 *
 * Fetch Events with Pagination
 *  GET /events?page=2&limit=5
 *
 * Fetch Events Sorted by Date (Descending)
 *  GET /events?sortBy=date&order=desc
 *
 * Fetch Events Sorted by Title
 *  GET /events?sortBy=title&order=asc
 *
 * Fetch Events with Multiple Filters
 *  GET /events?title=exam&venue=hall&page=1&limit=5&type=upcoming&sortBy=date&order=asc
 *
 */
eventRouter.get(
  "/",
  optionalAuthenticate,
  authorize("admin", "guest", "adviser", "officer"), // for everyone, read only
  schoolEventController.getAllEvents,
);

eventRouter.get(
  "/filter/date-range",
  authenticate,
  authorize("admin"),
  schoolEventController.filterEvents,
);

// STATISTICS
eventRouter.get(
  "/stats",
  authenticate,
  authorize("admin"),
  schoolEventController.getStats,
);
eventRouter.get(
  "/stats/monthly",
  authenticate,
  authorize("admin"),
  schoolEventController.getMonthlyStats,
);
eventRouter.get(
  "/stats/venues",
  authenticate,
  authorize("admin"),
  schoolEventController.getVenueStats,
);
eventRouter.get(
  "/recent",
  authenticate,
  authorize("admin"),
  schoolEventController.getRecentEvents,
);

// READ by ID
eventRouter.get(
  "/:id",
  authenticate,
  authorize("admin"),
  schoolEventController.getSchoolEventById,
);

// UPDATE
eventRouter.put(
  "/:id",
  authenticate,
  authorize("admin"),
  schoolEventController.updateEvent,
);

// DELETE
eventRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  schoolEventController.deleteSchoolEvent,
);

export default eventRouter;
