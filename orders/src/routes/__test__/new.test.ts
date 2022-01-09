import request from 'supertest'
import mongoose from 'mongoose'
import faker from 'faker'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'

it('returns an error if the ticket does not exists', async () => {
	const ticketId = new mongoose.Types.ObjectId()

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId,
		})
		.expect(404)
})
it('returns an error if the ticket is already reserved', async () => { 
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: faker.commerce.productName(),
		price: faker.datatype.number({ min: 1, max: 100 })
	})
	await ticket.save()

	const order = Order.build({
		ticket,
		userId: new mongoose.Types.ObjectId().toString(),
		status: OrderStatus.Created,
		expiresAt: new Date(),
	})
	await order.save()

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(400)
})

it('reserves a ticket', async () => { 
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: faker.commerce.productName(),
		price: faker.datatype.number({ min: 1, max: 100 }),
	})
	await ticket.save()

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201)
})

it('emits an order created event', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: faker.commerce.productName(),
		price: faker.datatype.number({ min: 1, max: 100 }),
	})
	await ticket.save()

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
