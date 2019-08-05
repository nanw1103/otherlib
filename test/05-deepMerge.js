const assert = require('assert')
const { deepEqual, deepMerge } = require('../index.js')
require('./helper.js')


describe('deepMerge', function() {
	it('basic', function() {
		let target = {
			a: 1,
			b: {
				a: 2
			}
		}
		let src = {
			a: 3,
			b: {
				x: 3
			}
		}
		let expected = {
			a: 3,
			b: {
				a: 2,
				x: 3
			}
		}
		let ret = deepMerge(target, src)
		assert(JSON.stringify(expected) === JSON.stringify(ret))
	})

	it('types', function() {

		let f1 = ()=>{}
		let f2 = ()=>{}

		let target = {
			a: 1,
			b: {
				a: 2
			}
		}
		let src1 = {
			a: 3,
			b: {
				a: 3,
				b: true,
				c: null,
				d: undefined,
				e: '',
				f: 'hi',
				g: f1,
				h: NaN,
				i: 0.1,
				j: {},
				k: {a: 1},
				l: [],
				m: [11,22]
			}
		}
		let src2 = {
			a: 3,
			b: {
				a: 4,
				g: f2,
			}
		}
		let expected = {
			a: 3,
			b: {
				a: 4,
				b: true,
				c: null,
				d: undefined,
				e: '',
				f: 'hi',
				g: f2,
				h: NaN,
				i: 0.1,
				j: {},
				k: {a: 1},
				l: [],
				m: [11,22]
			}
		}
		let ret = deepMerge(target, src1, src2)
		assert(deepEqual(expected, ret))

	})
	it('with array', function() {
		//TODO
	})

	it('Accept undefined object', function() {
		let target = {
			a: 1,
			b: 22
		}
		let src1 = {
			a: 2,
			c: 33
		}
		let src2 = {
			a: 11
		}
		let expected = {
			a: 11,
			b: 22,
			c: 33
		}
		let ret = deepMerge(target, undefined, src1, undefined, src2, undefined)
		assert(JSON.stringify(expected) === JSON.stringify(ret))
	})

})