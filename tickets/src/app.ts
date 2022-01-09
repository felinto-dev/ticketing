import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';

import {
	currentUser,
	errorHandler,
	NotFoundError,
} from '@felinto-gittix/common';

import { indexTicketRouter } from './routes';
import { newTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { updateTicketRouter } from './routes/update';

export const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
	signed: false,
	secure: process.env.NODE_ENV !== 'test',
}))
app.use(currentUser)

app.use([
	newTicketRouter,
	showTicketRouter,
	indexTicketRouter,
	updateTicketRouter,
])

app.all('*', async (req, res, next) => {
	next(new NotFoundError())
})

app.use(errorHandler)
