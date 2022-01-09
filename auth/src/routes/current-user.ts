import express from 'express';

import { currentUser } from '@felinto-gittix/common';

const router = express.Router()

router.get(
	'/api/users/current-user',
	currentUser,
	(req, res) => {
		return res.send({ currentUser: req.user || null })
	}
)

export { router as currentUserRouter };
