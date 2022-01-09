import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';

import {
	errorHandler,
	NotFoundError,
} from '@felinto-gittix/common';

import { currentUserRouter } from './routes/current-user';
import { signUpRouter } from './routes/sign-up';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';

export const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
	signed: false,
	secure: process.env.NODE_ENV !== 'test',
}))

app.use([
	currentUserRouter,
	signUpRouter,
	signInRouter,
	signOutRouter,
])

app.all('*', async (req, res, next) => {
	// throw new NotFoundError()
	next(new NotFoundError())
})

app.use(errorHandler)
