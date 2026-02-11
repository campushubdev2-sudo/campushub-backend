import mongoose from "mongoose";
import { MONGODB_URI, NODE_ENV } from "../config/env.js";

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Please set it in your environment variables inside .env<development/production>.local file.",
  );
}

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "campusHubDev" });
    console.log(`Connected to MongoDB Database in ${NODE_ENV} mode.`);
  } catch (error) {
    console.error("Error connecting to Database:", error.message);

    if (error.name === "MongoNetworkError" || error.code === "ECONNREFUSED") {
      console.error(
        "Diagnosis: Connection refused. Verify:\n" +
          "  1. MongoDB service is running\n" +
          "  2. IP address is whitelisted in MongoDB Atlas (if using cloud)\n" +
          "  3. MONGODB_URI is correctly formatted (mongodb+srv://... or mongodb://...)",
      );
    } else if (error.name === "MongoServerError" && error.code === 18) {
      console.error(
        "Authentication failed: Check username/password in MONGODB_URI",
      );
    } else if (error.name === "MongooseServerSelectionError") {
      console.error(
        "DNS/network issue: Verify URI hostname and network connectivity",
      );
    }
    process.exit(1);
  }
};

export default connectToDatabase;
