const Vote = require("../models/vote.model");
const Op = require('sequelize').Op

exports.create = async function (data) {
	try {
		return await Vote.create(data)
	} catch (e) {
		throw Error(e.message)
	}
}

exports.count = async function (commentId, type) {
	try {
		return await Vote.count(
			{ where:
					{
						'commentId': commentId,
						'voteType': type,
						'submissionScore': {
							[Op.gte]: 0.5
						}
					}
			})
	} catch (e) {
		throw Error(e.message)
	}
}

exports.findOne = async function (fields) {
	try {
		let result = await Vote.findOne({where: fields})
		return result
	} catch (e) {
		throw Error(e.message)
	}
}

exports.findAll = async function () {
	try {
		const result = await Vote.findAll({
			limit: 7,
			attributes: ['name', 'zipcode', 'createdAt', 'updatedAt', 'geo'],
			where: {isProfane: false},
			order: [['createdAt', 'DESC']]
		})
		return result
	} catch (e) {
		throw Error(e.message)
	}
}
//
// exports.findByPk = async function (id) {
// 	try {
// 		return await Supporter.findByPk(id)
// 	} catch (e) {
// 		throw Error(e.message)
// 	}
// }