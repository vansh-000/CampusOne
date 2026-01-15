import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "university-import",
  brokers: ["localhost:9092"],
});
