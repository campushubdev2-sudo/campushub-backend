// @ts-check

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // ---- REQUEST (CLIENT) INFO ----
  console.log("======================================================");
  console.log("Incoming request");
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    protocol: req.protocol,
    userAgent: req.get("user-agent"),
    contentType: req.get("content-type"),
  });

  // ---- RESPONSE (SERVER) INFO ----
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log("Outgoing Response");
    console.log({
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      contentType: res.get("content-type"),
    });
    console.log("======================================================");
  });

  next();
};

export default requestLogger;
