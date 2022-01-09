import { Subjects, Publisher, ExpirationCompleteEvent } from "@felinto-gittix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;

	onPublish() {}
}
