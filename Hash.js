const Hashids = require('hashids/cjs')
const hashids = new Hashids("order number eccommerce")

module.exports.generateOrderNumber = (id) => {
	const start = (Math.random() * 10000000) + 10000000
	const end = id.toString().substring(0,16)
	const hash  = hashids.encodeHex(start.toString().substring(0,8) + end);
	return hash.substring(0,8)
};


