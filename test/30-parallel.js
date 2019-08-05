const assert = require('assert')
const parallel = require('../parallel.js')
const delay = require('../index.js').delay
require('./helper.js')

describe('parallel', function() {
	it('basic', ut)
})

async function ut() {
	let sum = 0
	let start = Date.now()
	let tasks = [...Array(10).keys()]
	let expectedResult = tasks.reduce((a,b)=>a+b)
	await parallel.run(tasks, delayProcess)

	let cost = Date.now() - start
	if (sum !== expectedResult)
		throw 'UT failed: invalid sum'
	if (cost > 200)
		throw 'UT failed: invalid time cost'

	async function delayProcess(n, w) {
		sum += n
		await delay(100)
	}
}