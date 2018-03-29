const assert = require('assert')
const { delay } = require('../lib/index.js')

process.on('uncaughtException', err => {
	console.error('uncaughtException', err)
	process.exit()
}).on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
	process.exit()
})

describe('delay', function() {
	it('Delay value', function() {
		return delay(10, 'delayed promise completed')		
	})

	it('Delay undefined', function() {
		return delay(10).then(v => assert(v === undefined))
	})

	it('Delay function', function() {
		return delay(10, ()=>1).then(v => assert(v === 1))
	})

	it('Delay promise', function() {
		return delay(10, Promise.resolve(2)).then(v => assert(v === 2))
	})
})
