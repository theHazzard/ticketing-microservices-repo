import { BaseListener, OrderCancelledEvent, OrderStatus, Subjects } from "@hazzard-org/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueName = queueGroupName;
  
  async onMessage(data: OrderCancelledEvent['data'], message: Message) {
    const order = await Order.findByEvent({
      id: data.id,
      version: data.version,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();

    message.ack();
  }
}