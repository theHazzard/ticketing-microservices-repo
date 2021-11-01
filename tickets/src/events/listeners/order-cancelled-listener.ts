import { BaseListener, OrderCancelledEvent, Subjects } from "@hazzard-org/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], message: Message) {
    const { ticket: { id: ticketId } } = data;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found ')
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    });

    message.ack();
  }
}