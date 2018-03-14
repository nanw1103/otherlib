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
			} else if (d instanceof Promise || (typeof d.then === 'function' && typeof d.catch === 'function')) {
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
 * @property {function}	options.filter		- filter reject object. Retry happens on and only on returning true
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
		throw 'Invalid argument: either options.timeoutMs or options.retry must be specified'
	if (options.timeoutMs < 0)
		throw 'Invalid argument: options.timeoutMs < 0'
	if (options.retry < 0)
		throw 'Invalid argument: options.retry < 0'
	if (options.intervalMs < 0)
		throw 'Invalid argument: options.intervalMs < 0'

	let start = Date.now()
	for (let n = 0;;) {
		try {
			return await func()
		} catch (e) {
			if (options.filter(e)) {
				if (options.retry && ++n > options.retry) {
					options.log && options.log(`RetryTask [${options.name}] - Error=${e}. FAILED: Retry limit reached.`)
					throw e
				}
				let now = Date.now()
				if (options.timeoutMs && now - start > options.timeoutMs) {
					options.log && options.log(`RetryTask [${options.name}] - Error=${e}. FAILED: Retry Timeout.`)
					throw e
				}

				let msg = ''
				if (options.retry) {
					msg = `${n}/${options.retry}`
				}				
				if (options.timeoutMs) {
					let percent = ((now - start) / options.timeoutMs * 100) | 0
					if (options.retry)
						msg += ', '
					msg += `timeout ${percent}%`
				}
				options.log && options.log(`RetryTask [${options.name}] - Error=${e}. Retry=${msg}...`)
				await delay(options.intervalMs)
				continue
			}
			throw e
		}
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
	
	const inProgress = {}

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

module.exports = {
	delay: delay,
	retry: retry,
	dedup: dedup
}
