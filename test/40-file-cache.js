const assert = require('assert')
const FileCache = require('../file-cache.js')

const file = 'otherlib-file-cache-ut.json'

describe('file-cache', function() {
	it('clear', clear)
	it('basic', basic)
	it('multiInstance', multiInstance)
	it('cleanup', clear)	//re-run clear, to cleanup.
})

async function clear() {
	let cache = FileCache(file)
	cache.clear()
}

async function basic() {
	let cache = FileCache(file)
	cache.clear()

	assert(cache.get('k1') === undefined)
	assert(cache.keys().length === 0)

	cache.put('k1', 'v1')
	assert(cache.get('k1') === 'v1')
	assert(cache.keys().length === 1)

	cache.put('k1', 'vv')
	assert(cache.get('k1') === 'vv')
	assert(cache.keys().length === 1)

	cache.remove('k1')
	assert(cache.get('k1') === undefined)
	assert(cache.keys().length === 0)

	cache.put('k1', 'v1')
	cache.put('k2', 'v2')
	assert(cache.get('k1') === 'v1')
	assert(cache.get('k2') === 'v2')
	assert(cache.keys().length === 2)
}

async function multiInstance() {
	let cache1 = FileCache(file)
	cache1.clear()
	let cache2 = FileCache(file)

	assert(cache1.get('k1') === undefined)
	assert(cache2.get('k1') === undefined)

	cache1.put('k1', 'v1')
	assert(cache2.get('k1') === 'v1')
}

