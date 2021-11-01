import { BasePublisher, OrderCancelledEvent, Subjects } from "@hazzard-org/common";

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
};