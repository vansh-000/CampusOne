// kafka/producer.js
import { kafka } from "./kafka.js";
export const kafkaProducer = kafka.producer();

await kafkaProducer.connect();
