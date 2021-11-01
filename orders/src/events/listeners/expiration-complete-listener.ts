import { BaseListener, ExpirationCompleteEvent, OrderStatus, Subjects } from "@hazzard-org/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends BaseListener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], message: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.Complete) {
      return message.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version, 
      ticket: {
        id: order.ticket.id,
      },
    });

    await message.ack();
  };
}