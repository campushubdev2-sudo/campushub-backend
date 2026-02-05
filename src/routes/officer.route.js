// @ts-check
import { Router } from "express";

import officerController from "../controllers/officer.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const officerRouter = Router();

officerRouter.use(
  createRateLimiter({
    limit: 60,
    windowMs: 60_000,
  }),
);

officerRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  officerController.createOfficer,
); // Static

officerRouter.get(
  "/",
  authenticate,
  authorize("admin"),
  officerController.getOfficers,
); // Static

officerRouter.get(
  "/stats/overview",
  authenticate,
  authorize("admin"),
  officerController.getOfficerStats,
);

officerRouter.get(
  "/stats/period",
  authenticate,
  authorize("admin"),
  officerController.getOfficersByPeriod,
);

officerRouter.get(
  "/stats/detailed",
  authenticate,
  authorize("admin"),
  officerController.getOfficersDetailed,
);

officerRouter.get(
  "/stats/near-term-end",
  authenticate,
  authorize("admin"),
  officerController.getOfficersNearTermEnd,
);

officerRouter.get(
  "/stats/organization/:orgId",
  authenticate,
  authorize("admin"),
  officerController.getOrganizationOfficerStats,
);

officerRouter.get(
  "/:id",
  authenticate,
  authorize("admin"),
  officerController.getOfficerById,
);
officerRouter.put(
  "/:id",
  authenticate,
  authorize("admin"),
  officerController.updateOfficer,
);

officerRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  officerController.deleteOfficer,
);

export default officerRouter;
