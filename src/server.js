import app from './app.js';
import dotenv from 'dotenv';
import { dbConnect } from './db/index.js';

dotenv.config();
const PORT = process.env.PORT;

dbConnect()
  .then(() => {
    app.on("error", (error) => {
      console.error("🔴 Error interacting with database:", error);
    });

    const PORT = process.env.PORT || 4020;
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("🔴 MongoDB connection failed !!!", error);
  });