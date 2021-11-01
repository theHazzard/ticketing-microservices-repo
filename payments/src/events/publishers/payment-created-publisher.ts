import { BasePublisher, PaymentCreatedEvent, Subjects } from "@hazzard-org/common";

export class PaymentCreatedPublisher extends BasePublisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
};