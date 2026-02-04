// @ts-check

import { Router } from "express";

const smsRouter = Router();

smsRouter.post("/send", (req, res) => {
  res.json({ endpoint: "POST /api/v1/sms/send" });
});

smsRouter.post("/send/bulk", (req, res) => {
  res.json({ endpoint: "POST /api/v1/sms/send/bulk" });
});

smsRouter.get("/balance", (req, res) => {
  res.json({ endpoint: "GET /api/v1/sms/balance" });
});

smsRouter.get("/messages", (req, res) => {
  res.json({ endpoint: "GET /api/v1/sms/messages" });
});

smsRouter.get("/validate-phone", (req, res) => {
  res.json({ endpoint: "GET /api/v1/sms/validate-phone" });
});

smsRouter.get("/format-phone", (req, res) => {
  res.json({ endpoint: "GET /api/v1/sms/format-phone" });
});

smsRouter.get("/test", (req, res) => {
  res.json({ endpoint: "GET /api/v1/sms/test" });
});

smsRouter.post("/send/method", (req, res) => {
  res.json({ endpoint: "POST /api/v1/sms/send/method" });
});

smsRouter.get("/status/:messageId", (req, res) => {
  res.json({ endpoint: "GET /api/v1/sms/status/:messageId" });
});

export default smsRouter;
