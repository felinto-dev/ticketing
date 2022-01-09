import request from 'supertest';

import { app } from '../../app';

it('responds with details about the current user', async () => {
	const cookies = await global.signin()

	const response = await request(app)
		.get('/api/users/current-user')
		.set('Cookie', cookies)
		.send()
		.expect(200)

	expect(response.body.currentUser).toBeDefined()
})

it('responds with null if not authenticated', async () => {
	const response = await request(app)
		.get('/api/users/current-user')
		.send()
		.expect(200)

	expect(response.body.currentUser).toBeNull()
})
