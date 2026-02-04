import { connect } from "mongoose";
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
    await connect(MONGODB_URI);
    console.log(
      `Connected to MongoDB Database in ${NODE_ENV || "development"} mode.`,
    );
  } catch (error) {
    console.error("Error connecting to Database:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
