import { BasePublisher, Subjects, TicketCreatedEvent } from '@hazzard-org/common';

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}