// @ts-check

import { Router } from "express";

const calendarEntryRouter = Router();

// CREATE
calendarEntryRouter.post("/", (req, res) => {
  res.json({
    endpoint: "POST /api/v1/calendar-entries/",
  });
});

// READ all
calendarEntryRouter.get("/", (req, res) => {
  res.json({
    endpoint: "GET /api/v1/calendar-entries/",
  });
});

// READ by ID
calendarEntryRouter.get("/:id", (req, res) => {
  res.json({
    endpoint: "GET /api/v1/calendar-entries/:id",
  });
});

// READ by event ID
calendarEntryRouter.get("/event/:eventId", (req, res) => {
  res.json({
    endpoint: "GET /api/v1/calendar-entries/event/:eventId",
  });
});

// READ by user ID
calendarEntryRouter.get("/user/:userId", (req, res) => {
  res.json({
    endpoint: "GET /api/v1/calendar-entries/user/:userId",
  });
});

// Check if user has added event
calendarEntryRouter.get("/check/event-added", (req, res) => {
  res.json({
    endpoint: "GET /api/v1/calendar-entries/check/event-added",
  });
});

// UPDATE
calendarEntryRouter.put("/:id", (req, res) => {
  res.json({
    endpoint: "PUT /api/v1/calendar-entries/:id",
  });
});

// DELETE
calendarEntryRouter.delete("/:id", (req, res) => {
  res.json({
    endpoint: "DELETE /api/v1/calendar-entries/:id",
  });
});

// Statistics
calendarEntryRouter.get("/stats/overview", (req, res) => {
  res.json({
    endpoint: "GET /api/v1/calendar-entries/stats/overview",
  });
});

export default calendarEntryRouter;
