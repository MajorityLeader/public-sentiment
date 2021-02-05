const express = require('express');
const router = express.Router();
const SupporterController = require('../controllers/supporter.controller');
const UserController = require('../controllers/user.controller');
const zipcodes = require('zipcodes');
const Filter = require('bad-words');
const filter = new Filter();
const nev = require('node-email-validator');
cache = require('apicache').middleware

router.get('/report', async function(req, res, next) {
	try {
		if (req.query.adminKey !== 'yrQExD5keeMMo4M4B67i1FUAUJuFC3pUW5xboGlfJPBF') throw Error('Invalid Key')
		let results = await SupporterController.findAllReport()
		return res.json(results)
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

router.get('/count', cache('5 seconds'), async function(req, res, next) {
	try {
		let results = await SupporterController.count(req.query.supports)
		return res.json(results)
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

router.get('/sponsorTotalByState', cache('5 minutes'), async function(req, res, next) {
		try {
			let results = await SupporterController.configureSponsorTotalByState()
			return res.json(results)
		} catch(e) {
			res.status(400).send(e.message.toString())
			console.log(e)
		}
	});

router.get('/sponsorTotalByCity', cache('5 minutes'), async function(req, res, next) {
		try {
			let results = await SupporterController.configureSponsorTotalByCity()
			return res.json(results)
		} catch(e) {
			res.status(400).send(e.message.toString())
			console.log(e)
		}
	});

router.get('/', cache('5 seconds'), async function(req, res, next) {
	try {
		let limit = 7
		let offset = 0
		let supports = true
		if (req.query.limit) limit = req.query.limit
		if (req.query.offset) offset = req.query.offset
		if (req.query.supports) supports = req.query.supports
		let results = await SupporterController.findAll(limit, offset, supports)
		return res.json(results)
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

router.post('/', async function(req, res, next) {
	try {
		console.log(req)
		// Validate email
		const validation = await nev(req.body.email)
		if (!validation.isEmailValid) throw Error('That is not a valid email address')
		// Get captcha score
		req.body.submissionScore = await UserController.captcha(req.body.captcha, req.headers['x-forwarded-for'])
		// Profane flagging
		req.body.isProfane = filter.isProfane(req.body.name)
		let forbiddenWords = ['biden', 'trump', 'pelosi', 'floyd', '2020', 'antifa', 'police', 'america', 'president', 'social', 'blm', 'nypd', 'obama', 'matter'],
		length = forbiddenWords.length;
		// Check for forbidden words, if not already flagged.
		if (!req.body.isProfane) {
			while(length--) {
				let name = req.body.name.toLowerCase()
				let email = req.body.email.toLowerCase()
				if (name.indexOf(forbiddenWords[length])!==-1 || email.indexOf(forbiddenWords[length])!==-1) {
					req.body.isProfane = true
				}
			}
		}
		req.body.name = filter.clean(req.body.name)
		req.body.geo = zipcodes.lookup(req.body.zipcode)
		if (!req.body.geo) throw Error('That is not a known zipcode')
		req.body.ipAddress = req.headers['x-forwarded-for']
		// Avoid duplicate submissions
		let alreadyExists = await SupporterController.findOne({email: req.body.email})
		if (alreadyExists) {
			// Do not throw an error, to prevent revealing matching email submissions.
			return res.status(200).json()
		}
		await SupporterController.create(req.body)
		return res.status(200).json()
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

router.get('/lat-lng', async function(req, res, next) {
	try {
		let results = await SupporterController.findAllLatLng()
		return res.json(results)
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

router.put('/', async function(req, res, next) {
	try {
		if (req.query.adminKey !== process.env.ADMIN_KEY) throw Error('Invalid Key')
		await SupporterController.update(req.body)
		res.status(200).end()
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.error(e)
	}
});

module.exports = router;
