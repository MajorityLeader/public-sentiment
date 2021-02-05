const Event = require("../models/event.model");

exports.create = async function (data) {
	try {
		return await Event.create(data)
	} catch (e) {
		console.error(e)
		throw Error(e.message)
	}
}