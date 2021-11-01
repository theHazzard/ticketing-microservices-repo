import { TicketCreatedEvent } from "@hazzard-org/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'asdasd',
    price: 50,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    message,
  };
};

it('creates and saves a ticket', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
})

it('acks the message', async () => {
  const { data, listener, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
})