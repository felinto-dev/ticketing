import faker from 'faker';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from './src/app';

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = faker.random.words(3)

	mongo = await MongoMemoryServer.create()
	const mongoUri = await mongo.getUri()

	await mongoose.connect(mongoUri)
})

beforeEach(async () => {
	jest.clearAllMocks()
	jest.clearAllMocks()
const collections = await mongoose.connection.db.collections()


	for (let collection of collections) {
		await collection.deleteMany({})
	}
})

afterAll(async () => {
	mongo.stop()
	await mongoose.connection.close()
})

declare global {
	var signin: () => Promise<string[]>;
}

global.signin = async () => {
	const email = faker.internet.email()
	const password = 'password'

	const response = await request(app)
		.post('/api/users/sign-up')
		.send({
			email,
			password,
		})
		.expect(201)
	
	const cookie = response.get('Set-Cookie')
	return cookie
}
