import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { OrderStatus } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	})
	await ticket.save()
	return ticket
}

it('marks an order as cancelled', async () => {
	const ticket = await buildTicket()
	const user = global.signin()

	const { body: createdOrder } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	const { body: updatedOrder } = await request(app)
		.delete(`/api/orders/${createdOrder.id}`)
		.set('Cookie', user)
		.expect(200)

	expect(updatedOrder.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
	const ticket = await buildTicket()
	const user = global.signin()

	const { body: createdOrder } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	await request(app)
		.delete(`/api/orders/${createdOrder.id}`)
		.set('Cookie', user)
		.expect(200)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
