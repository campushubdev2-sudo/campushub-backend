import { config } from "dotenv";

config({
  quiet: true,
});

export const {
  PORT,
  NODE_ENV,
  MONGODB_URI,
  JWT_SECRET,
  JWT_ISSUER,
  JWT_EXPIRES_IN,
  SEMAPHORE_API_KEY,
  SEMAPHORE_SENDER_NAME,
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASSWORD,
} = process.env;
