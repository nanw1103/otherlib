'use strict'

function delay(millis, data) {
	return new Promise(resolve => setTimeout(() => resolve(data), millis))
}

/**
 * @param    {function}	task
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
async function retry(task, options) {
	let start = Date.now()
	for (let n = 0;;) {
		try {
			return await task()
		} catch (e) {
			if (options.filter(e)) {
				if (options.retry && ++n > options.retry) {
					options.log && options.log(`RetryTask [${options.name}] - Error=${e}. FAILED: Retry limit reached.`)
					throw e
				}
				if (options.timeoutMs && Date.now() - start > options.timeoutMs) {
					options.log && options.log(`RetryTask [${options.name}] - Error=${e}. FAILED: Retry Timeout.`)
					throw e
				}

				options.log && options.log(`RetryTask [${options.name}] - Error=${e}. Retry=${n}/${options.retry}...`)
				await delay(options.intervalMs)
				continue
			}
			throw e
		}
	}
}

module.exports = {
	delay: delay,
	retry: retry
}
