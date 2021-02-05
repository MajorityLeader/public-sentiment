const BillSection = require("../models/billsection.model");

exports.create = async function (data) {
	try {
		const result = await BillSection.create(data)
		return result.dataValues
	} catch (e) {
		throw Error(e.message)
	}
}