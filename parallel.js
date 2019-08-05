const delay = require('./index.js').delay
const throttle = require('./throttle.js')

async function runParallel(taskQueue, workerFn, options) {

	if (Number.isInteger(options)) {
		options = {
			concurrency: options
		}
	}

	options = {
		...throttle.DEFAULT_OPTIONS,
		...options
	}

	let concurrency = options.concurrency
	let numWorking = concurrency

	let workers = []
	for (let i = 0; i < concurrency; i++)
		workers.push(worker(i))
	return Promise.all(workers)

	async function worker(index) {
		let working = true
		do {
			let obj = taskQueue.shift()
			if (obj) {
				if (!working) {
					working = true
					++numWorking
					//console.log('Worker resumed', index)
				}
				await workerFn(obj, index)
			} else {
				if (working) {
					working = false
					--numWorking
					//console.log('Worker sleeping', index)
				}
				await delay(10)
			}
		} while (numWorking > 0)

		//console.log('Worker exits', index)
	}
}

module.exports = {
	run: runParallel
}