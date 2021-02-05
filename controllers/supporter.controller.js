const Supporter = require("../models/supporter.model");

const stateArray = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

exports.create = async function (data) {
	try {
		const result = await Supporter.create(data)
		return result
	} catch (e) {
		throw Error(e.message)
	}
}

exports.count = async function (supports = true) {
	try {
		return await Supporter.count({where: {isProfane: false, supports: supports}})
	} catch (e) {
		throw Error(e.message)
	}
}

exports.findOne = async function (fields) {
	try {
		const result = await Supporter.findOne({where: fields})
		return result
	} catch (e) {
		throw Error(e.message)
	}
}

exports.findAll = async function (limit = 7, offset = 0, supports = true) {
	try {
		const result = await Supporter.findAll({
			limit: parseInt(limit),
			offset: parseInt(offset),
			attributes: ['id', 'name', 'zipcode', 'createdAt', 'updatedAt', 'geo'],
			where: {isProfane: false, supports: supports},
			order: [['createdAt', 'DESC']]
		})
		return result
	} catch (e) {
		throw Error(e.message)
	}
}

exports.findAllReport = async function () {
	try {
		return await Supporter.findAll({
			order: [['createdAt', 'DESC']]
		})
	} catch (e) {
		throw Error(e.message)
	}
}

exports.update = async function (data) {
	try {
		return await Supporter.update(data, {
			where: {
				id: data.id
			}
		})
	} catch (e) {
		throw Error(e.message)
	}
}

exports.findByPk = async function (id) {
	try {
		return await Supporter.findByPk(id)
	} catch (e) {
		throw Error(e.message)
	}
}

exports.findAllLatLng = async function () {
	try {
		let items = []
		let results = await Supporter.findAll({
			attributes: ['geo'],
			where: {isProfane: false, supports: true}
		})
		for (let result of results) {
			items.push({latitude: result.geo.latitude, longitude: result.geo.longitude, city: result.geo.city})
		}
		return items
	} catch (e) {
		throw Error(e.message)
	}
}

exports.configureSponsorTotalByState = async function(){
	try{
		const sponsorObject = await findSponsorNameAndGeo();

		return buildFinalSponsorObject(sponsorObject);
	}catch(e){
		throw Error(e.message);
	}
}

exports.configureSponsorTotalByCity = async function(){
	try{
		const sponsorObject = await findSponsorNameAndGeo();

		return buildSponsorObjectByCity(sponsorObject);
	}catch(e){
		throw Error(e.message);
	}
}

async function findSponsorNameAndGeo(){
	return await Supporter.findAll({
		attributes: ['name', 'geo'],
		where: {isProfane: false, supports: true},
		order: [['createdAt', 'DESC']]
	});
}

function buildFinalSponsorObject(sponsorObject){
	var sponsorTotalObj = {
		cosponsorDetails: []
	};

	for (state = 0; state < stateArray.length; state++ ){
		var stateAbbreviation = stateArray[state];
		var numberOfSponsorByState = totalNumberOfSponsors(stateAbbreviation, sponsorObject);
		sponsorTotalObj.cosponsorDetails.push({ 'state': stateAbbreviation, 'cosponserTotal': numberOfSponsorByState });
	}

	return sponsorTotalObj;
}

function totalNumberOfSponsors(state, sponsorObject){
	return sponsorObject.filter(sponsor => sponsor.geo.state == state).length;
}

function buildSponsorObjectByCity(sponsorObject){
	let sponsorTotalObj = {
		cosponsorDetails: []
	};

	sponsorObject.forEach((sponsor) => {
		let city = sponsor.geo.city;
		let latitude = sponsor.geo.latitude;
		let longitude = sponsor.geo.longitude;


		let totalSponsors = sponsorObject.filter(sponsor => sponsor.geo.city == city).length;
		sponsorTotalObj.cosponsorDetails.push({ 'latitude': latitude, 'longitude': longitude, 'city': city, 'cosponserTotal': totalSponsors });
	});

	let removeDuplicatesFromObject = removeDuplicateCities(sponsorTotalObj);


	return removeDuplicatesFromObject;
}

function removeDuplicateCities(sponsorTotalObj){
	return [...new Map(sponsorTotalObj.cosponsorDetails.map(item => [item['city'], item])).values()]
}

