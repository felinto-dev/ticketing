import faker from 'faker'
import request from 'supertest'
import mongoose from 'mongoose'
import { OrderStatus } from '@felinto-gittix/common'

import { app } from '../../app'
import { Order } from '../../models/order'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

it('returns a 404 when purchasing an order that does not exists', async () => { 
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: faker.datatype.uuid(),
			orderId: new mongoose.Types.ObjectId().toHexString()
		})
		.expect(404)
})

it('returns a 401 when purchasing an order that does not belong to the user', async () => { 
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		price: 10,
		status: OrderStatus.Created,
		version: 0,
	})
	await order.save()

	await request(app)
	.post('/api/payments')
	.set('Cookie', global.signin())
	.send({
		token: faker.datatype.uuid(),
		orderId: order.id,
	})
	.expect(401)
})

it('returns a 400 when purchasing an cancelled order', async () => { 
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 10,
		status: OrderStatus.Cancelled,
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
	})
	await order.save()

	await request(app)
	.post('/api/payments')
	.set('Cookie', global.signin(order.userId))
	.send({
		token: faker.datatype.uuid(),
		orderId: order.id,
	})
	.expect(400)
})

it('returns a 201 with valid inputs', async () => {
	const price = Math.floor(Math.random() * 100000)

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price,
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
	})
	await order.save()

	const token = 'tok_visa'

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin( order.userId))
		.send({
			token,
			orderId: order.id,
		})
		.expect(201)

	const stripeCharges = await stripe.charges.list({ limit: 50 })

	const stripeCharge = stripeCharges.data.find((charge) => {
		return charge.amount === price * 100
	})
	expect(stripeCharge).toBeDefined()

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id,
	})
	expect(payment).not.toBeNull()
})
