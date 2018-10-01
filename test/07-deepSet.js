const assert = require('assert')
const { deepEqual, deepSet, deepGet } = require('../lib/index.js')

process.on('uncaughtException', err => {
	console.error('uncaughtException', err)
	process.exit()
}).on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
	process.exit()
})


describe('deepSet', function() {
	it('basic 1', function() {
		let t = {}
		
		deepSet(t, 'a', 1)
		assert(1 === t.a)
		deepSet(t, 'aa.bb', 2)
		assert(2 === t.aa.bb)
	})
	it('Exception when setting to existing non-obj', function() {
		let t = {a:1}
		try {
			deepSet(t, 'a.b', 2)
			assert(false)
		} catch (e) {
		}
	})
	it('basic 2', function() {
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
		
		deepSet(o, 'a.b.x.y.z', 2)
		assert(2 === t.x.y.z)
		deepSet(o, 'a.b.x.y.zz', 3)
		assert(3 === t.x.y.zz)
		deepSet(o, 'aa.bb.cc', 4)
		assert(4 === o.aa.bb.cc)
	})
})