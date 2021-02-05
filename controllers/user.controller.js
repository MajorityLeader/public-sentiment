require('dotenv').config();
const User = require("../models/user.model");
const axios = require('axios');


exports.create = async function (req, res) {
	try {
		const result = await User.create(req.body)
		return result.dataValues
	} catch (e) {
		throw Error(e.message)
	}
}

exports.captcha = async function (captchaResponse, remoteip) {
	try {
		const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captchaResponse}&remoteip=${remoteip}`)
		if (response.data.success === false) {
			throw Error('Submission did not pass Captcha')
		}
		return response.data.score
	} catch (e) {
		throw Error(e.message)
	}
}