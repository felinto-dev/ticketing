import { Message } from "node-nats-streaming";
import { ExpirationCompleteEvent, Listener, NotFoundError, OrderStatus, Subjects } from "@felinto-gittix/common";

import { QUEUE_GROUP_NAME } from "../../consts";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete

	queueGroupName = QUEUE_GROUP_NAME

	async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId).populate('ticket')

		if (!order) {
			throw new NotFoundError()
		}
		
		if (order.status === OrderStatus.Complete) {
			return msg.ack()
		}

		order.set({
			status: OrderStatus.Cancelled
		})
		await order.save()

		await new OrderCancelledPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id
			}
		})

		return msg.ack()
	}
}
