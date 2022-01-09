import { Subjects, Publisher, PaymentCreatedEvent } from "@felinto-gittix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated

	onPublish() {}
}
