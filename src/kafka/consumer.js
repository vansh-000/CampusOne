// kafka/consumer.js
import { kafka } from "./kafka.js";
import { registerStudentService } from "../services/registerStudent.service.js";
import { StudentImport } from "../models/import.model.js";

const consumer = kafka.consumer({ groupId: "student-import-group" });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "student-import", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const { importId, rowNumber, student } = payload;

      try {
        await registerStudentService(student);

        await StudentImport.updateOne(
          { _id: importId },
          { $inc: { processed: 1, success: 1 } }
        );
      } catch (err) {
        await StudentImport.updateOne(
          { _id: importId },
          {
            $inc: { processed: 1, failed: 1 },
            $push: { errors: { row: rowNumber, reason: err.message } },
          }
        );
      }

      const record = await StudentImport.findById(importId);
      if (record.processed === record.total) {
        await StudentImport.updateOne(
          { _id: importId },
          { $set: { status: "completed", finishedAt: new Date() } }
        );
      }
    },
  });
};
