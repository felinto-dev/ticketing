import request from 'supertest'
import mongoose from 'mongoose'
import { indexOrderRouter } from '..'


import { app } from '../../app'
import { OrderDoc } from '../../models/order'
import { Ticket, TicketDoc } from '../../models/ticket'

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	})
	await ticket.save()
	return ticket
}


describe(indexOrderRouter.name, () => {
	it('fetches orders for an particular user', async () => {
		const ticketOne = await buildTicket()
		const ticketTwo = await buildTicket()
		const ticketThree = await buildTicket()

		const userOne = global.signin()
		const userTwo = global.signin()

		const { body: orderOne } = await request(app)
			.post('/api/orders')
			.set('Cookie', userOne)
			.send({ ticketId: ticketOne.id })
			.expect(201)

		const { body: orderTwo } = await request(app)
			.post('/api/orders')
			.set('Cookie', userTwo)
			.send({ ticketId: ticketTwo.id })
			.expect(201)

		const { body: orderThree } = await request(app)
			.post('/api/orders')
			.set('Cookie', userTwo)
			.send({ ticketId: ticketThree.id })
			.expect(201)

		const { body: userOneOrders } = await request(app)
			.get('/api/orders')
			.set('Cookie', userOne)
			.expect(200)

		const { body: userTwoOrders } = await request(app)
			.get('/api/orders')
			.set('Cookie', userTwo)
			.expect(200)

		expect(
			userOneOrders.filter(
				(order: OrderDoc) => order.id === orderOne.id
			).length
		).toEqual(1)

		expect(
			userTwoOrders.filter(
				(order: OrderDoc) => order.id === orderTwo.id || orderThree.id
			).length
		).toEqual(2)
	})
})
