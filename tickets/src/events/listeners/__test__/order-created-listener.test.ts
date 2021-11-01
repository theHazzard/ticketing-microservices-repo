import { OrderCreatedEvent, OrderStatus } from "@hazzard-org/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: 'concert',
    price: 24,
    userId: 'asd',
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asd',
    expiresAt: 'asdasd',
    ticket: {
        id: ticket.id,
        price: ticket.price,
    },
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    ticket,
    data,
    message,
  };
}

it('sets the orderId of the ticket', async() => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
})