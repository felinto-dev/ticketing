import mongoose from 'mongoose'
import { ExpirationCompleteEvent, OrderStatus } from '@felinto-gittix/common'
import { Message } from 'node-nats-streaming'

import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client)

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	})
	await ticket.save()

	const order = Order.build({
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		expiresAt: new Date(),
		ticket,
	})
	await order.save()

	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, ticket, order, data, msg }
}

it('updates the order status to cancelled', async () => { 
	const { listener, order, data, msg } = await setup()
	await listener.onMessage(data, msg)
	const updatedOrder = await Order.findById(order.id)
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an OrderCancelled event', async () => { 
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})

it('ack the message', async () => { 
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})
