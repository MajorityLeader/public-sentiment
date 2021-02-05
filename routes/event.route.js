const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');

router.post('/', async function(req, res, next) {
	try {
		EventController.create(req.body)
		res.status(200).end()
	} catch(e) {
		res.status(400).send(e.message.toString())
		console.log(e)
	}
});

module.exports = router;
