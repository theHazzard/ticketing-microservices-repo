import { TicketUpdateEvent } from "@hazzard-org/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  const data: TicketUpdateEvent['data'] = {
    id: ticket.id,
    title: 'concierto',
    price: 200,
    version: ticket.version + 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    ticket,
    message,
  };
};

it('find updates and saves a ticket', async () => {
  const { listener, data, message, ticket } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { message, data, listener } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it('does not ack the message on error', async () => {
  const { message, data, listener, } = await setup();

  data.version = 10;
  await expect(listener.onMessage(data, message)).rejects.toThrow();
});