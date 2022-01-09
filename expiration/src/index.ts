import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const bootstrap = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined!')
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

		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed!')
			console.log('exiting application...')
			process.exit(1)
		})

		process.on('SIGINT', () => natsWrapper.client.close())
		process.on('SIGTERM', () => natsWrapper.client.close())

		new OrderCreatedListener(natsWrapper.client).listen()
	} catch (err) {
		console.error(err)
	}
}

bootstrap()
