import {
	Publisher,
	Subjects,
	TicketCreatedEvent,
} from '@felinto-gittix/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated

	onPublish() {}
}
