import mongoose from "mongoose";
import { ExpirationCompleteEvent, OrderStatus } from "@hazzard-org/common";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import { Message } from "node-nats-streaming";


const setUp = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concerto',
    price: 30,
  });

  await ticket.save()

  const order = Order.build({
    userId: 'test',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),    
  };

  return { listener, order, ticket, data, message };
}

it('updates the order status to cancelled', async () => {
  const { listener, order, data, message } = await setUp();

  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order:cancelled event', async () => {
  const { listener, order, data, message } = await setUp();

  await listener.onMessage(data, message);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(eventData.id).toEqual(order.id)
});

it('acks the message', async () => {
  const { listener, data, message } = await setUp();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});