const express = require('express');
const router = express.Router();
const VoteController = require('../controllers/vote.controller');
const UserController = require('../controllers/user.controller');

router.get('/count/admin', async function(req, res, next) {
	try {
		if (!req.query.adminKey || req.query.adminKey !== process.env.ADMIN_KEY) throw Error('Missing or Incorrect Admin Key')
		let sresults = await VoteController.count(req.query.commentId, 'solidarity')
		let eresults = await VoteController.count(req.query.commentId, 'empathize')
		let fresults = await VoteController.count(req.query.commentId, 'flag')
		const count = {
			solidarity: sresults,
			empathize: eresults,
			flag: fresults
		}
		res.json(count)
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

router.get('/count', async function(req, res, next) {
	try {
		let sresults = await VoteController.count(req.query.commentId, 'solidarity')
		let eresults = await VoteController.count(req.query.commentId, 'empathize')
		const count = {
			solidarity: sresults,
			empathize: eresults
		}
		res.json(count)
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

router.post('/', async function(req, res, next) {
	try {
		// Get captcha score
		req.body.submissionScore = await UserController.captcha(req.body.captcha, req.headers['x-forwarded-for'] || req._remoteAddress)
		req.body.ipAddress = req.headers['x-forwarded-for'] || req._remoteAddress
		// Avoid duplicate submissions
		let alreadyExists = await VoteController.findOne({commentId: req.body.commentId, ipAddress: req.body.ipAddress, voteType:req.body.voteType})
		if (alreadyExists) throw Error('Vote already counted.')
		// Make sure vote type is allowed.
		let voteTypes = ['empathize', 'solidarity', 'flag']
		if (!voteTypes.includes(req.body.voteType)) throw Error('Vote type not allowed')
		await VoteController.create(req.body)
		return res.status(200).json()
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

module.exports = router;
