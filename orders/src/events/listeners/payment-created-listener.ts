import { BaseListener, OrderStatus, PaymentCreatedEvent, Subjects } from "@hazzard-org/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends BaseListener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], message: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    message.ack();
  }
}