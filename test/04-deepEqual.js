const assert = require('assert')
const { deepEqual } = require('../index.js')
require('./helper.js')

describe('deepEqual', function() {
	it('basic equal', function() {
		let obj1 = {
			a: 1,
			b: {
				a: 2
			}
		}
		let obj2 = {
			a: 1,
			b: {
				a: 2
			}
		}		
		assert(deepEqual(obj1, obj2))
	})

	it('basic not equal', function() {
		let obj1 = {
			a: 1,
			b: {
				a: 2
			}
		}
		let obj2 = {
			a: 1,
			b: {
				a: 3
			}
		}
		let obj3 = {
			a: 1,
			b: {
				b: 2
			}
		}
		assert(!deepEqual(obj1, obj2))
		assert(!deepEqual(obj1, obj3))
	})
	
	it('types', function() {
		
		let f1 = ()=>{}
		let f2 = ()=>{}
		
		let t1 = {
			a: 2,
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
		
		let obj1 = {
			a: 1,
			b: t1,
		}
		let obj2 = {
			a: 1,
			b: t1
		}
		let obj3 = {
			a: 1,
			b: {
				b: 2
			}
		}
		assert(deepEqual(obj1, obj2))
		assert(!deepEqual(obj1, obj3))
	})
})

