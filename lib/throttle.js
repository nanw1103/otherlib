const DEFAULT_OPTIONS = {
	concurrency: Number.MAX_SAFE_INTEGER,
	perTimeSpan: Number.MAX_SAFE_INTEGER,
	timeSpanMs: 1000
}

function throttle(fn, options) {
	if (typeof options === 'number') {
		let actual = {
			...DEFAULT_OPTIONS
		}
		actual.concurrency = options
		options = actual
	} else {
		options = {
			...DEFAULT_OPTIONS,
			...options
		}
	}

	let working = 0
	const queue = []
	let timeSpanStart = 0
	let numCallsInTimeSpan = 0

	function throttledFn(...args) {
		return new Promise((resolve, reject) => {
			function fnImpl() {
				throttledFn.working = ++working
				if (options.perTimeSpan !== Number.MAX_SAFE_INTEGER)
					++numCallsInTimeSpan
				//console.log('numCallsInTimeSpan', numCallsInTimeSpan)

				let safePromise = async () => fn(...args)
				return safePromise()
					.then(resolve)
					.catch(reject)
					.then(() => {
						throttledFn.working = --working
						tryProcessNext()
					})
			}
			queue.push(fnImpl)
			throttledFn.queue = queue.length
			tryProcessNext()
		})
	}

	let timer
	function tryProcessNext() {
		//console.log('tryProcessNext')
		if (queue.length === 0)
			return

		if (working >= options.concurrency)
			return

		//if per time span throttle control exists
		if (options.perTimeSpan !== Number.MAX_SAFE_INTEGER) {
			let now = Date.now()
			if (timeSpanStart + options.timeSpanMs < now) {
				//restart a new time span. This is not a smooth but simple algorithm.
				timeSpanStart = now
				numCallsInTimeSpan = 0
			}

			if (numCallsInTimeSpan >= options.perTimeSpan) {
				clearTimeout(timer)
				timer = setTimeout(tryProcessNext, options.timeSpanMs - (now - timeSpanStart))
				return
			}
		}

		queue.shift()()
		throttledFn.queue = queue.length
	}

	throttledFn.working = working
	return throttledFn
}

module.exports = throttle
