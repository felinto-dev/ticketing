import faker from 'faker';
import request from 'supertest';

import { app } from '../../app';

it('clears the cookie after signing out', async () => {
	await request(app)
		.post('/api/users/sign-up')
		.send({
			email: faker.internet.email(),
			password: 'password',
		})
		.expect(201)

	const response = await request(app)
		.post('/api/users/sign-out')
		.send({})
		.expect(200)

	expect(response.get('Set-Cookie')).toBeDefined()
})
