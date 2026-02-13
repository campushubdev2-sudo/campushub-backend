// @ts-check
import mongoose from "mongoose";
import { MONGODB_URI, NODE_ENV } from "../config/env.js";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined. Please set it in your environment variables inside .env<development/production>.local file.");
}

/**
 * Resolve MongoDB database name based on environment
 * @returns {string}
 */
const resolveDbName = () => {
  switch (NODE_ENV) {
    case "production":
      return "campushub_prod";
    default:
      return "campushub_dev";
  }
};

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: resolveDbName() });
    console.log(`Connected to MongoDB Database in ${NODE_ENV} mode.`);
  } catch (error) {
    // Type guard to narrow the error type
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error connecting to Database:", err.message);

    // JSDoc type casting for MongoDB error properties
    const mongoError = /** @type {Error & { code?: string | number }} */ (err);

    if (mongoError.name === "MongoNetworkError" || mongoError.code === "ECONNREFUSED") {
      console.error("Diagnosis: Connection refused. Verify:\n" + "  1. MongoDB service is running\n" + "  2. IP address is whitelisted in MongoDB Atlas (if using cloud)\n" + "  3. MONGODB_URI is correctly formatted (mongodb+srv://... or mongodb://...)");
    } else if (mongoError.name === "MongoServerError" && mongoError.code === 18) {
      console.error("Authentication failed: Check username/password in MONGODB_URI");
    } else if (mongoError.name === "MongooseServerSelectionError") {
      console.error("DNS/network issue: Verify URI hostname and network connectivity");
    }
    process.exit(1);
  }
};

export default connectToDatabase;
