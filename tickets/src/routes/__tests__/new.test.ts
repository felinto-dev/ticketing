import faker from 'faker';
import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

jest.mock('../../nats-wrapper.ts')

it('has a route handler listening to /api/tickets for post requests', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.send({})

	expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
	await request(app)
		.post('/api/tickets')
		.send({})
		.expect(401)
})

it('returns a status other than 401 if the user is signed in', async () => {	
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({})

	expect(response.status).not.toEqual(401)
})

it('returns an error if invalid title is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: '',
			price: faker.datatype.number({ min: 1, max: 1000 }),
		})
		.expect(400)
	
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			price: faker.datatype.number({ min: 1, max: 1000 }),
		})
		.expect(400)
})

it('returns an error if an invalid price is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: faker.commerce.productName(),
			price: -10,
		})
		.expect(400)
	
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: faker.commerce.productName(),
		})
		.expect(400)

})

it('creates a ticket with valid inputs', async () => {
	let tickets = await Ticket.find({})
	expect(tickets.length).toEqual(0)

	const title = faker.commerce.productName()
	const price = faker.datatype.number({ min: 1, max: 1000 })

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
		.expect(201)
	
	tickets = await Ticket.find({})
	expect(tickets.length).toEqual(1)
	const ticket = tickets[0]
	expect(ticket.title).toEqual(title)
	expect(ticket.price).toEqual(price)
})

it('publishes an event', async () => {
	const title = faker.commerce.productName()

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price: 20,
		})
		.expect(201)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
