import faker from 'faker';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';

it('returns a 404 if the ticket is not found', async () => {
	const documentId = new mongoose.Types.ObjectId().toHexString()

	const response = await request(app)
		.get(`/api/tickets/${documentId}`)
		.send()
		.expect(404)
})

it('returns the ticket if the ticket is found', async () => {
	const title = faker.commerce.productName()
	const price = faker.datatype.number({ min: 1, max: 1000 })

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
		.expect(201)
	
	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200)
	
	expect(ticketResponse.body.title).toEqual(title)
	expect(ticketResponse.body.price).toEqual(price)
})
