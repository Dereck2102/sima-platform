import { Injectable } from '@nestjs/common';
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private producerConnected = false;
  private consumerConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: `${process.env.APP_NAME}-${process.env.NODE_ENV}`,
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      logLevel: logLevel.ERROR,
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'sima-group',
    });
  }

  async connect() {
    await this.ensureProducer();
    await this.ensureConsumer();
  }

  async disconnect() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    this.producerConnected = false;
    this.consumerConnected = false;
  }

  async sendMessage(topic: string, message: any) {
    await this.ensureProducer();
    await this.producer.send({
      topic,
      messages: [
        {
          key: message.id || null,
          value: JSON.stringify(message),
          headers: {
            'correlation-id': message.correlationId || '',
            'timestamp': new Date().toISOString(),
          },
        },
      ],
    });
  }

  async subscribe(topic: string, callback: (message: any) => Promise<void>) {
    await this.ensureConsumer();
    await this.consumer.subscribe({ topic });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          await callback(data);
        } catch (error) {
          console.error(`Error processing Kafka message from ${topic}:`, error);
        }
      },
    });
  }

  private async ensureProducer() {
    if (!this.producerConnected) {
      await this.producer.connect();
      this.producerConnected = true;
    }
  }

  private async ensureConsumer() {
    if (!this.consumerConnected) {
      await this.consumer.connect();
      this.consumerConnected = true;
    }
  }
}
