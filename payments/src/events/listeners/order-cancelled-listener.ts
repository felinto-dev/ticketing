import { Message } from "node-nats-streaming";
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@felinto-gittix/common";

import { Order } from "../../models/order";
import { QUEUE_GROUP_NAME } from "../../consts";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled

	queueGroupName = QUEUE_GROUP_NAME

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const order = await Order.findOne({
			_id: data.id,
			version: data.version - 1,
		})

		if (!order) {
			throw new Error('Order not found!')
		}

		order.set({ status: OrderStatus.Cancelled })
		await order.save()

		msg.ack()
	}
}
