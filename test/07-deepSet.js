const assert = require('assert')
const { deepSet } = require('../index.js')
require('./helper.js')


describe('deepSet', function() {
	it('basic 1', function() {
		let t = {}

		deepSet(t, 'a', 1)
		assert(t.a === 1)
		deepSet(t, 'aa.bb', 2)
		assert(t.aa.bb === 2)
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
		assert(t.x.y.z === 2)
		deepSet(o, 'a.b.x.y.zz', 3)
		assert(t.x.y.zz === 3)
		deepSet(o, 'aa.bb.cc', 4)
		assert(o.aa.bb.cc === 4)
	})
	it('Auto convert null to empty obj', function() {
		let o = {
			x: null
		}

		deepSet(o, 'x.a', 2)
		assert(o.x.a === 2)
	})
})