const assert = require('assert')
const { deepEqual, deepGet } = require('../index.js')
require('./helper.js')

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

		assert(deepGet(o, 'a.b.x.y.z') === 1)
		assert(t === deepGet(o, 'a.b'))
	})

	it('types', function() {
		let o = {
			a: {
				n: 1,
				b: true,
				s: 'asdf',
				e: null,
				v: [11, 'asdf', true, null, undefined],
				u: undefined,
			}
		}

		assert(deepGet(o, 'a.n') === 1)
		assert(deepGet(o, 'a.b') === true)
		assert(deepGet(o, 'a.s') === 'asdf')
		assert(deepGet(o, 'a.e') === null)
		assert(Array.isArray(deepGet(o, 'a.v')))
		assert(deepGet(o, 'a.v.0') === 11)
		assert(undefined === deepGet(o, 'a.u'))
	})


	it('defaultValue', function() {
		let o = {
			a: {
				n: 1,
				b: true,
				s: 'asdf',
				e: null,
				v: [11, 'asdf', true, null, undefined],
				u: undefined,
			}
		}

		assert(undefined === deepGet(o, 'a.inexist'))
		assert(deepGet(o, 'a.inexist', 33) === 33)
		assert(deepGet(o, 'a.n.inexist', 33) === 33)
		assert(deepGet(o, 'a.b.inexist', 33) === 33)
		assert(deepGet(o, 'a.s.inexist', 33) === 33)
		assert(deepGet(o, 'a.e.inexist', 33) === 33)
		assert(deepGet(o, 'a.v.inexist', 33) === 33)
		assert(deepGet(o, 'a.v.0.inexist', 33) === 33)
		assert(deepGet(o, 'a.u.inexist', 33) === 33)
	})

})