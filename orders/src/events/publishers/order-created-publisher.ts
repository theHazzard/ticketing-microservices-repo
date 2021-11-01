import { BasePublisher, OrderCreatedEvent, Subjects } from "@hazzard-org/common";

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
};