import faker from 'faker';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { updateTicketRouter } from '../update';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

jest.mock('../../nats-wrapper.ts')

describe(updateTicketRouter.name, () => {
	const title = faker.commerce.productName()
	const price = faker.datatype.number({ min: 1, max: 1000 })

	it('returns a 404 if the provided id does not exists', async () => {
		const documentId = new mongoose.Types.ObjectId().toHexString()

		return request(app)
			.put(`/api/tickets/${documentId}`)
			.set('Cookie', global.signin())
			.send({
				title,
				price,
			})
			.expect(404)
	})

	it('returns a 401 if the user is not authenticated', async () => {
		const documentId = new mongoose.Types.ObjectId().toHexString()

		return request(app)
			.put(`/api/tickets/${documentId}`)
			.send({
				title,
				price,
			})
			.expect(401)
	})

	it('returns a 401 if the user does not own the ticket', async () => {
		const response = await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin())
			.send({
				title,
				price,
			})

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', global.signin())
			.send({
				title,
				price,
			})
			.expect(401)
	})

	it('returns a 400 if the user provided an invalid title or price', async () => {
		const userCredentials = global.signin()

		const response = await request(app)
			.post('/api/tickets')
			.set('Cookie', userCredentials)
			.send({
				title,
				price,
			})

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', userCredentials)
			.send({
				title: '',
				price,
			})
			.expect(400)

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', userCredentials)
			.send({
				title,
				price: -10,
			})
			.expect(400)
	})

	it('rejects updates if the ticket is reserved', async () => {
		const userCredentials = global.signin()

		const newTitle = faker.commerce.productName()
		const newPrice = faker.datatype.number({ min: 1, max: 1000 })

		const { body: { id: ticketId } } = await request(app)
			.post('/api/tickets')
			.set('Cookie', userCredentials)
			.send({
				title,
				price,
			})
		
		const ticket = await Ticket.findById(ticketId)
		ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
		await ticket!.save()

		await request(app)
			.put(`/api/tickets/${ticketId}`)
			.set('Cookie', userCredentials)
			.send({
				title: newTitle,
				price: newPrice,

			})
			.expect(400)
	})


	it('updates the ticket provided valid inputs', async () => {
		const userCredentials = global.signin()

		const newTitle = faker.commerce.productName()
		const newPrice = faker.datatype.number({ min: 1, max: 1000 })

		const response = await request(app)
			.post('/api/tickets')
			.set('Cookie', userCredentials)
			.send({
				title,
				price,
			})

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', userCredentials)
			.send({
				title: newTitle,
				price: newPrice,
			})
			.expect(200)

		const updatedTicket = await request(app)
			.get(`/api/tickets/${response.body.id}`)
			.expect(200)

		expect(updatedTicket.body.title).toEqual(newTitle)
		expect(updatedTicket.body.price).toEqual(newPrice)
	})


	it('published an event', async () => {
		const userCredentials = global.signin()

		const response = await request(app)
			.post('/api/tickets')
			.set('Cookie', userCredentials)
			.send({
				title,
				price,
			})

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', userCredentials)
			.send({
				title: '',
				price,
			})
			.expect(400)

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', userCredentials)
			.send({
				title,
				price: -10,
			})
			.expect(400)

		expect(natsWrapper.client.publish).toHaveBeenCalled()
	})
})
