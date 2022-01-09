import faker from 'faker';
import request from 'supertest';

import { app } from '../../app';

const createTicket = () => {
	const title = faker.commerce.productName()
	const price = faker.datatype.number({ min: 1, max: 1000 })

	return request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
}

it('can fetch a list of tickets', async () => {
	const tickets = [
		await createTicket(),
		await createTicket(),
		await createTicket(),
	]

	const response = await request(app)
		.get('/api/tickets')
		.send()
		.expect(200)
	
	expect(response.body.length).toEqual(3)
})
