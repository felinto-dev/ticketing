import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { natsWrapper } from './nats-wrapper';

const bootstrap = async () => {
	console.log('Starting orders service...')

	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined!')
	}

	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined')
	}

	if (
		!process.env.NATS_URL ||
		!process.env.NATS_CLUSTER_ID ||
		!process.env.NATS_CLIENT_ID
	) {
		throw new Error()
	}

	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL,
		)

		new TicketCreatedListener(natsWrapper.client).listen()
		new TicketUpdatedListener(natsWrapper.client).listen()
		new ExpirationCompleteListener(natsWrapper.client).listen()
		new PaymentCreatedListener(natsWrapper.client).listen()

		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed!')
			console.log('exiting application...')
			process.exit(1)
		})

		process.on('SIGINT', () => natsWrapper.client.close())
		process.on('SIGTERM', () => natsWrapper.client.close())

		await mongoose.connect(process.env.MONGO_URI)
		console.log('Connected to MongoDB')
	} catch (err) {
		console.error(err)
	}

	app.listen(process.env.PORT || 3000, () => {
		console.log('Listening on port 3000!')
	})
}

bootstrap()
