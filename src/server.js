import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { dbConnect } from "./db/index.js";

const PORT = process.env.PORT;

const startServer = async () => {
  const { default: app } = await import("./app.js");
  dbConnect()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.log("🔴 MongoDB connection failed !!!", error);
    });
};

startServer();
