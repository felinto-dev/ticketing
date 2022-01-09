import express, {
	Request,
	Response,
} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import {
	BadRequestError,
	validateRequest,
} from '@felinto-gittix/common';

import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router()

router.post('/api/users/sign-in', [
	body('email')
		.isEmail()
		.withMessage('E-mail must be valid!'),
	body('password')
		.trim()
		.notEmpty()
		.withMessage('You must supply a password')
], validateRequest, async (req: Request, res: Response) => {
	const { email, password } = req.body

	const existingUser = await User.findOne({ email })

	if (!existingUser) {
		throw new BadRequestError('E-mail or password is incorrect')
	}

	const passwordsMatch = await Password.compare(
		existingUser.password,
		password
	)

	if (!passwordsMatch) {
		throw new BadRequestError('E-mail or password is incorrect')
	}

	const userJwt = jwt.sign({
		id: existingUser.id,
		email: existingUser.email,
	}, process.env.JWT_KEY!)

	req.session = {
		jwt: userJwt
	}

	return res.status(200).send(existingUser)

})

export { router as signInRouter };
