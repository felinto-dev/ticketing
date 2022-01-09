import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@felinto-gittix/common'

import { Ticket } from '../../models/ticket'
import { QUEUE_GROUP_NAME } from '../../consts';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated
	queueGroupName = QUEUE_GROUP_NAME;

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		const ticket = await Ticket.findByEvent(data)

		if (!ticket) {
			throw new Error('Ticket not found')
		}

		const { title, price } = data;
		ticket.set({ title, price })
		await ticket.save()

		msg.ack()
	}
}
