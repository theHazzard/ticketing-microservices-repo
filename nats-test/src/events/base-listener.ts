import { Message, Stan } from "node-nats-streaming";

import { Subjects } from "./subjects";

interface Event {
  subject: Subjects,
  data: any,
}

export abstract class BaseListener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueName);
  }

  listen() {
    const subscription = this.client.subscribe(this.subject, this.queueName, this.subscriptionOptions());

    subscription.on('message', (msg: Message) => {
      console.log(
        `Message received: ${this.subject} / ${this.queueName}`
      );
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf-8'));
  }
}
