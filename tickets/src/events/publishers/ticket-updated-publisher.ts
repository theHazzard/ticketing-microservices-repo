import { BasePublisher, Subjects, TicketUpdateEvent } from '@hazzard-org/common';

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdateEvent> {
  readonly subject = Subjects.TicketUpdated;
}