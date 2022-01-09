import faker from 'faker';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('./src/nats-wrapper.ts')

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = faker.random.words(3)

	mongo = await MongoMemoryServer.create()
	const mongoUri = await mongo.getUri()

	await mongoose.connect(mongoUri)
})

beforeEach(async () => {
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
	var signin: () => string[];
}

global.signin = () => {
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: faker.internet.email(),
	}
	const token = jwt.sign(payload, process.env.JWT_KEY!)
	const session = { jwt: token }
	const sessionJSON = JSON.stringify(session)
	const sessionBase64Encoded = Buffer.from(sessionJSON).toString('base64')
	return [`session=${sessionBase64Encoded}`]
}
