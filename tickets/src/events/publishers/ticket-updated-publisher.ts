import {
	Publisher,
	Subjects,
	TicketUpdatedEvent,
} from '@felinto-gittix/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated

	onPublish() {}
}
