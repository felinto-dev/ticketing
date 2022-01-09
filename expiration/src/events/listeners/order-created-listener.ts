import { Listener, OrderCreatedEvent, Subjects } from "@felinto-gittix/common";
import { Message } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "../../consts";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated

	queueGroupName = QUEUE_GROUP_NAME

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
		console.log(
			'Waiting this many milliseconds to process the job:',
			delay,
		)

		await expirationQueue.add(
			{
				orderId: data.id
			},
			{
				delay: delay < 0 ? 0: delay,
			},
		)

		msg.ack()
	}
}
