import faker from 'faker';
import request from 'supertest';

import { app } from '../../app';

it('fails when a e-mail that does not exists is supplied', async () => {
	await request(app)
		.post('/api/users/sign-in')
		.send({
			email: faker.internet.email(),
			password: 'password',
		})
		.expect(400)
})

it('fail when an incorrect password is supplied', async () => {
	await request(app)
		.post('/api/users/sign-up')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201)
	
	return request(app)
		.post('/api/users/sign-in')
		.send({
			email: 'test@test.com',
			password: 'WRONG-PASSWORD',
		})
		.expect(400)
})

it('responds with a cookie when given valid credentials', async () => {
	const email = faker.internet.email()
	const password = 'password'

	await request(app)
		.post('/api/users/sign-up')
		.send({
			email,
			password,
		})
		.expect(201)
	
	const response = await request(app)
		.post('/api/users/sign-in')
		.send({
			email,
			password,
		})
		.expect(200)
	
	expect(response.get('Set-Cookie')).toBeDefined()
})
