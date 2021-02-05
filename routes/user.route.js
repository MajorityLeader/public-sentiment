const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');

/* GET users listing. */
router.post('/', async function(req, res, next) {
	await UserController.create(req, res)
});

module.exports = router;
