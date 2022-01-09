import express from 'express'

const router = express.Router()

router.post('/api/users/sign-out', (req, res) => {
	req.session = null
	return res.send({})
})

export { router as signOutRouter }
