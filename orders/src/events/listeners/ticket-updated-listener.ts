import { BaseListener, Subjects, TicketUpdateEvent } from "@hazzard-org/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends BaseListener<TicketUpdateEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueName = queueGroupName;

  async onMessage(data: TicketUpdateEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();
    
    msg.ack();
  };
}