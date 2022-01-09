import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"
import { OrderCreatedEvent, OrderStatus } from '@felinto-gittix/common'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)
	const ticket = Ticket.build({
		title: 'concert',
		price: 99,
		userId: new mongoose.Types.ObjectId().toHexString(),
	})
	await ticket.save()

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'FAKE_VALUE',
    version: 0,
    ticket: {
        id: ticket.id,
        price: ticket.price,
    },
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, ticket, data, msg }
}

it('sets the userId of the ticket', async () => { 
	const { listener, ticket, data, msg } = await setup()
	await listener.onMessage(data, msg)
	const updatedTicket = await Ticket.findById(ticket.id)
	expect(updatedTicket?.orderId).toEqual(data.id)
})


it('acks the message', async () => {
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)
	expect(msg.ack).toHaveBeenCalledTimes(1)
})

it('publishes a ticket updated event', async () => {
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)
	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
