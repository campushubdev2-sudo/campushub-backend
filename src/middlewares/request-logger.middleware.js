// @ts-check

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  console.log("Incoming request");
  console.log({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    protocol: req.protocol,
    userAgent: req.get("user-agent"),
  });

  // ---- RESPONSE (SERVER) INFO ----
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log("Outgoing Response");
    console.log({
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    console.log("======================================================");
  });

  next();
};

export default requestLogger;
