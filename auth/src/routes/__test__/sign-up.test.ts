import faker from 'faker';
import request from 'supertest';

import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
	return request(app)
		.post('/api/users/sign-up')
		.send({
			email: faker.internet.email(),
			password: 'password',
		})
		.expect(201)
})

it('returns a 400 on invalid e-mail', async () => {
	return request(app)
		.post('/api/users/sign-up')
		.send({
			email: 'invalid-email@@mail.com',
			password: 'password',
		})
		.expect(400)
})

it('returns a 400 on invalid password', async () => {
	return request(app)
		.post('/api/users/sign-up')
		.send({
			email: faker.internet.email(),
			password: 'p',
		})
		.expect(400)
})

it('returns a 400 with missing e-mail and password', async () => {
	return request(app)
		.post('/api/users/sign-up')
		.send({})
		.expect(400)
})

it('disallows duplicate e-mails', async () => {
	const email = faker.internet.email()

	await request(app)
		.post('/api/users/sign-up')
		.send({
			email,
			password: 'password',
		})
		.expect(201)
	
	return request(app)
		.post('/api/users/sign-up')
		.send({
			email,
			password: 'password',
		})
		.expect(400)
})

it('sets a cookie after successful sign-up', async () => {
	const response = await request(app)
		.post('/api/users/sign-up')
		.send({
			email: faker.internet.email(),
			password: 'password',
		})
		.expect(201)
	
	expect(response.get('Set-Cookie')).toBeDefined()
})
