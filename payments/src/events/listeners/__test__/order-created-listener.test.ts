import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from "@felinto-gittix/common"

import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { Order } from '../../../models/order'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		expiresAt: new Date().toString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
			price: 10,
		},
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	}

	return { listener, data, msg }
}

it('replicates the order info', async () => {
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)
	const order = await Order.findById(data.id)
	expect(order).toBeInstanceOf(Order)
})

it('acks the message', async () => {
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)
	expect(msg.ack).toHaveBeenCalled()
})
