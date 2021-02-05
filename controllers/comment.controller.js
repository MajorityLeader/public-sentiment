const Comment = require("../models/comment.model");
const BillSection = require("../models/billsection.model");
const Vote = require("../models/vote.model");
const BillSectionController = require('../controllers/billSection.controller')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const convert = require('xml-js');
const dayjs = require('dayjs');
const parseFullName = require('parse-full-name').parseFullName;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios')

exports.create = async function (data) {
	try {
		const result = await Comment.create(data)
		for (let item of data.billSection) {
			await BillSectionController.create({name: item, commentId: result.id})
		}
		return result
	} catch (e) {
		// Add trace
		console.trace(e)
		console.error(e)
		throw Error(e.message)
	}
}

exports.findAllAdmin = async function () {
	try {
		const results = await Comment.findAll({
			attributes: ['id', 'name', 'zipcode', 'createdAt', 'updatedAt', 'body', 'geo',
				[Sequelize.literal('(SELECT COUNT(*) FROM Vote WHERE Vote.commentId = Comment.id AND Vote.voteType IN ("flag"))'), 'FlagCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS voteCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType IN ("solidarity", "empathize"))'), 'voteCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "solidarity")'), 'solidarityCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "empathize")'), 'empathizeCount']
			],
			where: {
				isProfane: false,
				status: true
			},
			order: [[Sequelize.literal('FlagCount'), 'DESC']]
		})
		return results
	} catch (e) {
		console.error(e)
		throw Error(e.message)
	}
}

exports.findByPk = async function (id) {
	try {
		return Comment.findByPk(id, {
			attributes: ['id', 'name', 'zipcode', 'createdAt', 'updatedAt', 'body',
				[Sequelize.literal('(SELECT COUNT(id) AS voteCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType IN ("solidarity", "empathize"))'), 'voteCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "solidarity")'), 'solidarityCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "empathize")'), 'empathizeCount']
			]
		})
	} catch (e) {
		console.error(e)
		throw Error(e.message)
	}
}

exports.delete = async function (id) {
	try {
		await Comment.update(
			{ status: false },
			{ where: { id: id } }
		)
	} catch (e) {
		console.error(e)
		throw Error(e.message)
	}
}

exports.findAll = async function (types) {
	try {
		const results = await Comment.findAll({
			attributes: ['id', 'name', 'zipcode', 'createdAt', 'updatedAt', 'body', 'geo',
				[Sequelize.literal('(SELECT COUNT(id) AS voteCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType IN ("solidarity", "empathize"))'), 'voteCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "solidarity")'), 'solidarityCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "empathize")'), 'empathizeCount']
			],
			where: {
				isProfane: false,
				status: true
			},
			include: [{
				model: BillSection,
				where: { name: {[Op.in]: types} }
			}],
			order: [[Sequelize.literal('voteCount'), 'DESC']],
			limit: 50
		})
		for (let i in results) {
			// Parse location data
			if (results[i].dataValues.geo && results[i].dataValues.geo.city) results[i].dataValues.city = results[i].dataValues.geo.city
			if (results[i].dataValues.geo && results[i].dataValues.geo.administrativeLevels) results[i].dataValues.administrativeLevels = results[i].dataValues.geo.administrativeLevels
			delete(results[i].dataValues.geo)
		}
		// Pop most recent to top of array.
		let pop = await this.findRecent(types)
		for (let recent of pop) {
			results.unshift(recent)
		}

		return results
	} catch (e) {
		throw Error(e.message)
	}
}

/* Send Comments to Communicate with Congress */
exports.cwc = async function () {
	try {
    const comments = await Comment.findAll(
			{
				where: {
					[Op.and]: {
						deliverToCongress: 1,
						deliveredToCongress: 0,
						isProfane: 0,
						geo: {
							[Op.ne]: null
						}
					}
				},
				raw: true
			}
		)
		for (let comment of comments) {
			try {
				let xml = await this.cwcXML(comment)
				await this.cwcSendMessage(xml)
				await Comment.update(
					{deliveredToCongress: true},
					{where: {id: comment.id}})
				console.log(`Success on ${comment.id}`)
			} catch(e) {
				console.error(e)
				// Ignore error and continue
			}
		}
	}
	catch (e) {
		throw Error(e)
	}
}

exports.cwcSendMessage = async function (xml) {
	try {
		let response = await axios.post(`https://test-cwc.house.gov/v2/validate?apikey=${process.env.CWC_KEY}`, xml, {
			headers: {'Content-Type': 'text/xml'}
		});
		return response;
	} catch (e) {
		console.error(e.response.data)
		throw Error(e)
	}
}

exports.cwcOfficeCode = async function (geo) {
	try {
		let {data} = await axios.get(`https://www.googleapis.com/civicinfo/v2/representatives?address=${geo.formattedAddress}&includeOffices=true&level=country&roles=legislatorLowerBody&key=${process.env.GOOGLE_KEY}`);
		let divisionId = null;
		for (let office of data.offices) {
			if (office.name === 'U.S. Representative') {
				divisionId = office.divisionId;
				break;
			}
		}
		let identifiers = divisionId.split('/')
		let ids = {}
		for (let identifier of identifiers) {
			let arr = identifier.split(':')
			ids[arr[0]] = arr[1]
		}
		let districtNumber = ("0" + ids.cd).slice(-2)
		let officeId = `H${ids.state.toUpperCase()}${districtNumber}`
		return officeId;
	} catch (e) {
		console.error(e)
	}
}

exports.cwcXML = async function (comment) {
	try {
		const name = parseFullName(comment.name)
		const json  = {
			_declaration: {
				_attributes: {
					version: '1.0',
					encoding: 'utf-8'
				}
			},
			CWC: {
				CWCVersion: {
					_text: "2.0"
				},
				Delivery: {
					DeliveryId: {
						_text: uuidv4().replace(/-/g, '')
					},
					DeliveryDate: {
						_text: dayjs().format('YYYYMMDD')
					},
					DeliveryAgent: {
						_text: "JusticeInPolicing.us"
					},
					DeliveryAgentAckEmailAddress: {
						_text: "DomeWatch@mail.house.gov"
					},
					DeliveryAgentContact: {
						DeliveryAgentContactName: {
							_text: "Shaun Brown"
						},
						DeliveryAgentContactEmail: {
							_text: "shaun.brown@mail.house.gov"
						},
						DeliveryAgentContactPhone: {
							_text: "949-873-3014"
						}
					},
					Organization: {
						_text: "Majority Leader"
					},
					CampaignId: {
						_text: `Justice in Policing: https://justiceinpolicing.us ${comment.id}`
					}
				},
				Recipient: {
					MemberOffice: {
						_text: await this.cwcOfficeCode(comment.geo)
					},
					IsResponseRequested: {
						_text: "N"
					},
					NewsletterOptIn: {
						_text: "N"
					}
				},
				Constituent: {
					Prefix: {
						_text: name.title ? name.title : ' '
					},
					FirstName: {
						_text: name.first
					},
					LastName: {
						_text: name.last
					},
					Address1: {
						_text: `${comment.geo.streetNumber} ${comment.geo.streetName}`
					},
					City: {
						_text: comment.geo.city
					},
					StateAbbreviation: {
						_text: comment.geo.administrativeLevels.level1short
					},
					Zip: {
						_text: comment.geo.zipcode
					},
					AddressValidation: {
						_text: "N"
					},
					Email: {
						_text: comment.email
					},
					EmailValidation: {
						_text: "N"
					}
				},
				Message: {
					Subject: {
						_text: "Justice In Policing support/opposition"
					},
					LibraryOfCongressTopics: {
						LibraryOfCongressTopic: {
							_text: "Crime and Law Enforcement"
						}
					},
					Bills: {
						Bill: {
							BillCongress: {
								_text: '116'
							},
							BillTypeAbbreviation: {
								_text: 'hr'
							},
							BillNumber: {
								_text: '7120'
							}
						}
					},
					ConstituentMessage: {
						_text: comment.body
					}
				}
			}
		}
		let xml = convert.js2xml(json, {compact: true});
		return xml

	}
	catch (e) {
		throw Error(e)
	}
}

exports.findRecent = async function (types) {
	try {
		const results = await Comment.findAll({
			attributes: ['id', 'name', 'zipcode', 'createdAt', 'updatedAt', 'body', 'geo',
				[Sequelize.literal('(SELECT COUNT(id) AS voteCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType IN ("solidarity", "empathize"))'), 'voteCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "solidarity")'), 'solidarityCount'],
				[Sequelize.literal('(SELECT COUNT(id) AS solidarityCount FROM Vote WHERE Vote.commentId = Comment.id AND Vote.submissionScore > 0.5 AND Vote.voteType = "empathize")'), 'empathizeCount']
			],
			where: {
				isProfane: false,
				status: true
			},
			include: [{
				model: BillSection,
				where: { name: {[Op.in]: types} }
			}],
			order: [['createdAt', 'DESC']],
			limit: 3
		})
		for (let i in results) {
			// Parse location data
			if (results[i].dataValues.geo && results[i].dataValues.geo.city) results[i].dataValues.city = results[i].dataValues.geo.city
			if (results[i].dataValues.geo && results[i].dataValues.geo.administrativeLevels) results[i].dataValues.administrativeLevels = results[i].dataValues.geo.administrativeLevels
			delete(results[i].dataValues.geo)
		}

		return results
	} catch (e) {
		throw Error(e.message)
	}
}
