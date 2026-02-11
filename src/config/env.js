// @ts-check
import { config } from "dotenv";

config({ quiet: true });

/**
 * @param {string | undefined} value
 * @param {string} key
 * @returns {string}
 */
const requireEnv = (value, key) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const PORT = requireEnv(process.env.PORT, "PORT");
export const NODE_ENV = requireEnv(process.env.NODE_ENV, "NODE_ENV");
export const MONGODB_URI = requireEnv(process.env.MONGODB_URI, "MONGODB_URI");

export const JWT_SECRET = requireEnv(process.env.JWT_SECRET, "JWT_SECRET");
export const JWT_ISSUER = requireEnv(process.env.JWT_ISSUER, "JWT_ISSUER");
export const JWT_EXPIRES_IN = requireEnv(
  process.env.JWT_EXPIRES_IN,
  "JWT_EXPIRES_IN",
);

export const SEMAPHORE_API_KEY = requireEnv(
  process.env.SEMAPHORE_API_KEY,
  "SEMAPHORE_API_KEY",
);
export const SEMAPHORE_SENDER_NAME = requireEnv(
  process.env.SEMAPHORE_SENDER_NAME,
  "SEMAPHORE_SENDER_NAME",
);

export const EMAIL_SERVICE = requireEnv(
  process.env.EMAIL_SERVICE,
  "EMAIL_SERVICE",
);
export const EMAIL_USER = requireEnv(process.env.EMAIL_USER, "EMAIL_USER");
export const EMAIL_PASSWORD = requireEnv(
  process.env.EMAIL_PASSWORD,
  "EMAIL_PASSWORD",
);
