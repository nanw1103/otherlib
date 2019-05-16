'use strict'

/**
 * Return a promise which resolves the provided data after specified delay.
 *
 * @param    {number}	millis - Delay before resolving of the promise
 * @param    {promise|function|object}	obj - If promise, it will be resolved/rejected in a delayed manner; if function, it's return value will be resolved. Otherwise the obj is resolved directly.
 *
 * @return {Promise} - A promise that resolves after millis delay
 */
function delay(millis, obj) {
	return new Promise((resolve, reject) => {

		let resolveImpl = d => {
			if (d === null || d === undefined) {
				resolve(d)
			} else if (d instanceof Promise || typeof d.then === 'function' && typeof d.catch === 'function') {
				d.then(resolve).catch(reject)
			} else if (typeof d === 'function') {
				resolveImpl(d())
			} else {
				resolve(d)
			}
		}
		setTimeout(() => resolveImpl(obj), millis)
	})
}

/**
 * Retry the specific task conditionally
 *
 * @param    {function}	func
 * @param    {object}	options
 * @property {function}	options.filter		- A callback filter to control retry, based on result or error.
                                                  Retry on true return. The default filter is: (err, ret)=>err
 * @property {number}	options.retry		- max retry attempt. 0 indicates no limit
 * @property {number}	options.timeoutMs	- total timeout limit. 0 indicates no total timeout
 * @property {number}	options.intervalMs	- wait before retry
 * @property {function}	[options.log]		- optionally, log the details
 * @property {string}	[options.name]		- name shown in log
 *
 * @return {Promise}
 */
async function retry(func, options) {
	if (!options.timeoutMs && !options.retry)
		throw new Error('Invalid argument: either options.timeoutMs or options.retry must be specified')
	if (options.timeoutMs < 0)
		throw new Error('Invalid argument: options.timeoutMs < 0')
	if (options.retry < 0)
		throw new Error('Invalid argument: options.retry < 0')
	if (options.intervalMs < 0)
		throw new Error('Invalid argument: options.intervalMs < 0')
	if (!options.intervalMs && options.timeoutMs) {
		options.intervalMs = options.timeoutMs / 60
		if (options.intervalMs < 10000)
			options.intervalMs = 10000
	}

	let filter = options.filter || ((err, ret, _hasError) => _hasError)

	//start of backward compatibility
	if (options.filterReject || options.filterResolve) {
		filter = (err, ret, _hasError) => {
			if (_hasError)
				return options.filterReject && options.filterReject(err)
			return options.filterResolve && options.filterResolve(ret)
		}
	}
	//end of backward compatibility

	let start = Date.now()

	let log = options.log || (()=>0)
	let name = options.name || '<no name>'
	let n = 0
	let checkRetry = async (state) => {
		if (options.retry && ++n > options.retry) {
			let msg = `RetryTask [${name}] - State=${state}. FAILED: Retry limit reached.`
			log(msg)
			if (state instanceof Error) {
				state.message = state.message + ` (RetryTask [${name}] - FAILED: Retry limit reached.)`
				throw state
			}
			throw new Error(msg)
		}
		let now = Date.now()
		if (options.timeoutMs && now - start > options.timeoutMs) {
			let msg = `RetryTask [${name}] - State=${state}. FAILED: Retry Timeout.`
			log(msg)
			if (state instanceof Error) {
				state.message = state.message + ` (RetryTask [${name}] - FAILED: Retry Timeout.)`
				throw state
			}
			throw new Error(msg)
		}

		let msg = ''
		if (options.retry) {
			msg = `${n}/${options.retry}`
		}
		if (options.timeoutMs) {
			let percent = (now - start) / options.timeoutMs * 100 | 0
			if (options.retry)
				msg += ', '
			msg += `timeout ${percent}%`
		}
		log(`RetryTask [${name}] - State=${state}. Retry=${msg}...`)
		await delay(options.intervalMs)
	}

	let ret
	let err
	let _hasError
	for (;;) {
		ret = undefined
		err = undefined
		_hasError = undefined
		try {
			ret = await func()
		} catch (e) {
			err = e
			_hasError = true
		}

		if (await filter(err, ret, _hasError)) {
			await checkRetry(err || ret)
			continue
		}

		if (err)
			throw err
		return ret
	}
}

const _dedup = (function() {
	class PromiseHolder {
		promise() {
			return new Promise((resolve, reject) => {
				this.resolve = resolve
				this.reject = reject
			})
		}
	}

	const inProgress = {}

	class DedupAsync {
		constructor(task) {
			this.task = task
			this.callbacks = []
		}

		run(me) {
			if (this.callbacks.length === 0) {
				process.nextTick(() => {
					try {
						let ret = this.task.apply(me)
						if (typeof ret.then === 'function' && ret.catch === 'function')
							ret.then(d => this.resolve(d)).catch(e => this.reject(e))
						else
							this.resolve(ret)
					} catch (e) {
						this.reject(e)
					}
				})
			}
			let ph = new PromiseHolder()
			this.callbacks.push(ph)
			return ph.promise()
		}

		resolve(data) {
			this.callbacks.forEach(p => p.resolve(data))
			this.callbacks = []
			delete inProgress[this]
		}

		reject(err) {
			this.callbacks.forEach(p => p.reject(err))
			this.callbacks = []
			delete inProgress[this]
		}
	}

	return (func, THIS) => {
		let d = inProgress[func]
		if (!d)
			d = inProgress[func] = new DedupAsync(func)
		return d.run(THIS)
	}
})()

/**
 * Deduplicate concurrent generation of the same promise task. If there's an ongoing pending promise,
 * succeeding calls to the same promise-generator function resolves/rejects along with the pending promise.
 *
 * @param    {function}	func - Task function to be invoked.
 *
 * @return {Promise}
 */
function dedup(func, _THIS) {
	if (typeof func !== 'function')
		throw 'dedup: Illegal argument: func. Expect function, but: ' + typeof func
	return _dedup(func, _THIS)
}

function deepEqual(a, b) {
	if (a === b)
		return true

	let type = typeof a
	if (type !== typeof b)
		return false

	if (Number.isNaN(a) && Number.isNaN(b))
		return true

	if (type === 'function' || a === null || type !== 'object')	//NOTE: typeof null === 'object'
		return a === b

	//check buffer
	let aIsBuffer = a instanceof Buffer
	let bIsBuffer = b instanceof Buffer
	if (aIsBuffer !== bIsBuffer)
		return false
	if (aIsBuffer)
		return a.equals(b)
		
	//object, array
	if (Array.isArray(a) !== Array.isArray(b))
		return false

	let keys = Object.keys(a)
	if (keys.length != Object.keys(b).length)
		return false
	for (let k of keys) {
		if (!deepEqual(a[k], b[k]))
			return false
	}
	return true
}

/**
 * Like Object.assign, but works in a deep manner.
 *
 * @param	{object}	target - Target object to be merged into
 * @param	{object}	sources - Source objects to be merged onto target
 *
 * @return	{object} The target object
 */
function deepMerge(target, ...sources) {
	let src
	while (true) {
		if (!sources.length)
			return target
		src = sources.shift()
		if (src)
			break
	}

	for (let k in src) {

		let v = src[k]
		let existing = target[k]

		if (typeof v === 'object') {
			if (v === null) {
				target[k] = null
			} else if (Array.isArray(v)) {
				target[k] = v.slice()
			} else {
				if (typeof existing !== 'object')
					target[k] = deepMerge({}, v)
				else
					deepMerge(existing, v)
			}
		} else {
			//v is not object/array
			target[k] = v
		}
	}

	return deepMerge(target, ...sources)
}

/**
 *	Converting string to javascript primitive types: Boolean, Null, Undefined, Number
 * @param	{object}	str - target string convert from
 * @return	{object}	The converted primitive, if possible. Otherwise the original string
 */
function primitive(str) {
	if (typeof str !== 'string')
		return str
	if (str === 'null')
		return null
	if (str === 'undefined')
		return undefined
	if (str === 'true')
		return true
	if (str === 'false')
		return false
	if (str === 'true')
		return true
	if (str === 'NaN')
		return NaN
	//if (str === 'Infinity')
	//	return Number.POSITIVE_INFINITY
	let ret
	if (str.indexOf('.') >= 0)
		ret = Number.parseFloat(str)
	else
		ret = Number.parseInt(str)
	if (!Number.isNaN(ret))
		return ret
	return str
}

/**
 * Deep get property from object.
 * E.g. deepGet({a:{b:1}}, 'a.b') === 1
 *
 * @param	{object}	obj        - Target object to get value from
 * @param	{object}	deepKey    - Dot separated key names
 * @param	{object}	defaultVal - Default value, if the property does not exist
 * @return	{object}	The deep property, or undefined if any part of the key does not exist
 */
function deepGet(obj, deepKey, defaultVal) {
	let parts = deepKey.split('.')
	let t = obj
	for (let k of parts) {
		if (typeof t !== 'object' || t === null || !(k in t))
			return defaultVal
		t = t[k]
	}
	return t
}

/**
 * Deep set property into object.
 * E.g. deepSet({}, 'a.b', 1) === {a:{b:1}}
 *
 * @param	{object}	obj        - Target object to set value into
 * @param	{object}	deepKey    - Dot separated key names
 * @param	{object}	v          - The value to be set
 * @return	{object}	The passed-in obj
 */
function deepSet(obj, deepKey, v) {
	if (typeof obj !== 'object')
		throw new Error(`deepSet failure. Not an object. type=${typeof obj}, key=${deepKey}`)
	
	if (typeof obj === null)
		throw new Error(`deepSet failure. Setting into null object. key=${deepKey}`)

	let parts = deepKey.split('.')
	let t = obj

	for (let i = 0; i < parts.length; i++) {
		let k = parts[i]

		if (i === parts.length - 1) {
			t[k] = v
			break
		}

		if (t[k] === undefined || t[k] === null) {
			t[k] = {}
		} else if (typeof t[k] !== 'object') {
			throw new Error(`deepSet failure. Not an object. key=${deepKey}, part=${k}`)
		}
		t = t[k]
	}
	return obj
}

module.exports = {
	delay,
	retry,
	dedup,
	deepEqual,
	deepMerge,
	deepGet,
	deepSet,
	primitive
}
