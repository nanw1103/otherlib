const throttle = require('../throttle.js')

describe('throttle', function() {
	it('basic', ut)
})

async function ut() {
	function taskFn(n) {
		return Promise.resolve(n)
	}

	let throttledTaskFn = throttle(taskFn, {
		concurrency: 5000,
		perTimeSpan: 2000,
		timeSpanMs: 200
	})

	function dumpStat() {
		console.log('queue:', throttledTaskFn.queue, 'working:', throttledTaskFn.working)
	}
	let monitor = setInterval(dumpStat, 100)

	let tasks = []
	for (let i = 0; i < 10000; i++) {
		tasks.push(throttledTaskFn(i))
		//throttledTask(i)
		//.then(console.log)
		//	.catch(console.error)
	}
	dumpStat()

	return Promise.all(tasks)
		.then(() => clearInterval(monitor))
}
