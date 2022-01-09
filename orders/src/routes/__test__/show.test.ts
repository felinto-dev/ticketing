import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	})
	await ticket.save()
	return ticket
}

it('fetches the order', async () => {
	const ticket = await buildTicket()

	const user = global.signin()

	const { body: sentOrder } = await request(app)
		.post(`/api/orders`)
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	const { body: receivedOrder } = await request(app)
		.get(`/api/orders/${sentOrder.id}`)
		.set('Cookie', user)
		.expect(200)

	expect(receivedOrder).toStrictEqual(sentOrder)
})

it('returns an error if one user tries to fetch another users order', async () => {
	const ticket = await buildTicket()

	const userOne = global.signin()
	const userTwo = global.signin()

	const { body: order } = await request(app)
		.post(`/api/orders`)
		.set('Cookie', userOne)
		.send({ ticketId: ticket.id })
		.expect(201)

	await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', userTwo)
		.expect(401)
})
