import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { dbConnect } from "./db/index.js";
import { startConsumer } from "./kafka/consumer.js";

const startWorker = async () => {
  try {
    await dbConnect();
    console.log("📦 Worker MongoDB connected");

    await startConsumer();
    console.log("⚙️ Worker Kafka Consumer running");

  } catch (error) {
    console.error("🔴 Worker failed:", error);
  }
};

startWorker();
