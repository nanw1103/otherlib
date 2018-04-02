const assert = require('assert')
const { deepEqual, deepGet } = require('../lib/index.js')

process.on('uncaughtException', err => {
	console.error('uncaughtException', err)
	process.exit()
}).on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
	process.exit()
})


describe('deepGet', function() {
	it('basic', function() {
		let t = {
			x: {
				y: {
					z: 1
				}
			}
		}
		let o = {
			a: {
				b: t
			}
		}
		
		assert(1 === deepGet(o, 'a.b.x.y.z'))
		assert(t === deepGet(o, 'a.b'))
	})
	
	it('defaultVal', function() {
		let t = {
			x: {
				y: {
					z: 1
				}
			}
		}
		let o = {
			a: {
				b: t
			}
		}
		
		assert(1 === deepGet(o, 'a.b.x.y.z', 33))
		assert(33 === deepGet(o, 'a.b.x.y.inexist', 33))
	})
})