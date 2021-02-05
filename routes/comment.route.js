const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const UserController = require('../controllers/user.controller');
const Filter = require('bad-words');
const filter = new Filter();
const NodeGeocoder = require('node-geocoder');
const options = {
	provider: 'google',
	apiKey: 'AIzaSyBjISgqRC4F4J2IBB8bQE6nJry2_r576ek'
};
const geocoder = NodeGeocoder(options)
cache = require('apicache').middleware,

router.get('/admin', async function(req, res, next) {
	try {
		if (!req.query.adminKey || req.query.adminKey !== process.env.ADMIN_KEY) throw Error('Missing or Incorrect Admin Key')
		let results = await CommentController.findAllAdmin()

		return res.json(results)
	} catch(e) {
		console.error(e)
		res.status(400).send(e.message.toString())
	}
});

router.get('/admin/cwc', async function(req, res, next) {
	try {
		if (!req.query.adminKey || req.query.adminKey !== process.env.ADMIN_KEY) throw Error('Missing or Incorrect Admin Key');
		await CommentController.cwc();
		res.status(200).end();
	} catch (e) {
		res.status(400).send(e.message.toString())
	}

})

router.get('/:id', async function(req, res, next) {
	try {
		let results = await CommentController.findByPk(req.params.id)

		return res.json(results)
	} catch(e) {
		console.error(e)
		res.status(400).send(e.message.toString())
	}
});

router.get('/',
	cache('15 seconds'),
	async function(req, res, next) {
	try {
		let results = await CommentController.findAll(req.query.type.split(','))

		return res.json(results)
	} catch(e) {
		console.error(e)
		res.status(400).send(e.message.toString())
	}
});

router.delete('/:id', async function(req, res, next) {
	try {
		if (!req.query.adminKey || req.query.adminKey !== process.env.ADMIN_KEY) throw Error('Missing or Incorrect Admin Key')
		await CommentController.delete(req.params.id)

		return res.status(200).end()
	} catch(e) {
		console.error(e)
		res.status(400).send(e.message.toString())
	}
});

router.post('/', async function(req, res, next) {
	try {
		// Get captcha score
		req.body.submissionScore = await UserController.captcha(req.body.captcha, req.headers['x-forwarded-for'])
		// Profane flagging
		req.body.isProfane = filter.isProfane(req.body.name)
		if (req.body.isProfane) req.body.isProfane = filter.isProfane(req.body.body)

		req.body.name = filter.clean(req.body.name)
		req.body.body = filter.clean(req.body.body)
		if (!req.body.billSection) throw Error('Bill Section is required')
		req.body.ipAddress = req.headers['x-forwarded-for']
		// Parse Google Places Address into JSON
		if (req.body.address) {
			let geocode = await geocoder.geocode(req.body.address)
			if (geocode[0]) req.body.geo = geocode[0]
		}
		await CommentController.create(req.body)
		return res.status(200).json()
	} catch (e) {
		console.trace(e)
		res.status(400).send(e.message.toString())
	}
});

module.exports = router;
