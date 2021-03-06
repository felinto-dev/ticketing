import { body } from 'express-validator'
import express, { Request, Response } from 'express'
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
	OrderStatus,
	BadRequestError
} from '@felinto-gittix/common'
import { stripe } from '../stripe'

import { Order } from '../models/order'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post(
	'/api/payments',
	requireAuth,
	[
		body('token')
			.not()
			.isEmpty(),
		body('orderId')
			.not()
			.isEmpty()
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body

		const order = await Order.findById(orderId)

		if (!order) {
			throw new NotFoundError()
		}

		if (order.userId !== req.user!.id) {
			throw new NotAuthorizedError()
		}

		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for an cancelled order')
		}

		const charge = await stripe.charges.create({
			currency: 'BRL',
			amount: order.price * 100,
			source: token,
		})

		const payment = Payment.build({
			orderId: order.id,
			stripeId: charge.id,
		})
		await payment.save()

		await new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		})

		return res.status(201).send({ success: true })
	}
)

export { router as createChargeRouter }
