import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';
import { BaseListener } from './base-listener';

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueName = 'payment-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message ) {
    console.log('Event data!', data);

    console.log(data.price);
    console.log(data.title);

    msg.ack();
  }
}