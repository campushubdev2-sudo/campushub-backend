import axios from "axios";
import querystring from "querystring";
import { SEMAPHORE_API_KEY, SEMAPHORE_SENDER_NAME } from "../config/env.js";
import { AppError } from "../middlewares/error.middleware.js";

class SmsService {
  constructor() {
    this.apikey = SEMAPHORE_API_KEY;
    this.senderName = SEMAPHORE_SENDER_NAME;

    this.axiosClient = axios.create({
      baseURL: "https://semaphore.co/api/v4",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  async sendSMS({ to, message }) {
    if (!to || !message) {
      throw new AppError("Missing sms parameters", 400);
    }

    const numbers = Array.isArray(to) ? to.join(",") : to;

    const payload = querystring.stringify({
      apikey: this.apikey,
      number: numbers,
      message,
      sendername: this.senderName,
    });

    console.log("api key: ", this.apikey);
    try {
      const { data } = await this.axiosClient.post("/messages", payload);
      console.log("data is ", data);
      return data;
    } catch (error) {
      console.error(
        "Semaphore SMS Error: ",
        error.response?.data || error.message,
      );
      throw new AppError(
        error.response?.data?.message || "SMS sending failed",
        error.response?.status || 500,
      );
    }
  }

  async getBalance() {
    try {
      const response = await this.axiosClient.get("/account", {
        params: {
          apikey: this.apikey,
        },
      });

      return response.data;
    } catch (error) {
      throw new AppError(
        error.response?.data?.message || "Failed to fetch balance",
        error.response?.status || 500,
      );
    }
  }
}

export default new SmsService();
