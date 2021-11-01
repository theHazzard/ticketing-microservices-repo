import { BasePublisher, ExpirationCompleteEvent, Subjects } from "@hazzard-org/common";

export class ExpirationCompletePublisher extends BasePublisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}