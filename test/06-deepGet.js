const assert = require('assert')
const { deepEqual, deepGet } = require('../lib/index.js')
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
		
		assert(1 === deepGet(o, 'a.b.x.y.z'))
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
		
		assert(1 === deepGet(o, 'a.n'))
		assert(true === deepGet(o, 'a.b'))
		assert('asdf' === deepGet(o, 'a.s'))
		assert(null === deepGet(o, 'a.e'))
		assert(Array.isArray(deepGet(o, 'a.v')))
		assert(11 === deepGet(o, 'a.v.0'))
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
		assert(33 === deepGet(o, 'a.inexist', 33))
		assert(33 === deepGet(o, 'a.n.inexist', 33))
		assert(33 === deepGet(o, 'a.b.inexist', 33))
		assert(33 === deepGet(o, 'a.s.inexist', 33))
		assert(33 === deepGet(o, 'a.e.inexist', 33))
		assert(33 === deepGet(o, 'a.v.inexist', 33))
		assert(33 === deepGet(o, 'a.v.0.inexist', 33))
		assert(33 === deepGet(o, 'a.u.inexist', 33))
	})
	
})