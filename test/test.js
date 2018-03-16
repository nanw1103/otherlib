const assert = require('assert')
const {
	delay,
	retry,
	dedup
} = require('../lib/index.js')

process.on('uncaughtException', err => {
	console.error('uncaughtException', err)
	process.exit()
}).on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
	process.exit()
})

describe('delay', function() {
	it('Delay value', function() {
		return delay(10, 'delayed promise completed')		
	})

	it('Delay undefined', function() {
		return delay(10).then(v => assert(v === undefined))
	})

	it('Delay function', function() {
		return delay(10, ()=>1).then(v => assert(v === 1))
	})

	it('Delay promise', function() {
		return delay(10, Promise.resolve(2)).then(v => assert(v === 2))
	})
})

describe('retry', function() {
	it('Retry 2 times, based on error condition', function() {
		let n = 0
		let task = () => {
			return new Promise((resolve, reject) => {
				if (++n > 2)
					resolve(n)
				else
					reject('planed reject: ' + n)
			})
		}
		
		return retry(task, {
			filterReject: e => true,	//retry with any error
			retry: 5,			//max retry attempt
			intervalMs: 1,		//wait before retry 
			timeoutMs: 0,		//total timeout limit. 0 indicates no total timeout			
			//log: console.log,	//optionally, log the details
			//name: 'test',		//name shown in log
		}).then(ret => assert(ret === 3))
	})

	it('Retry based on success/resolve value', function() {
		let n = 0
		let task = () => ++n
		
		return retry(task, {
			filterResolve: data => data < 3,	//retry when resolved data is less than 3
			retry: 5,			
			intervalMs: 1
		}).then(ret => assert(ret === 3))
	})
		
	it('Retry on resolve', function() {
		let n = 0
		let task = () => ++n
		
		return retry(task, {
			filterResolve: d => d < 3,	//retry when resolved value < 3
			retry: 5,
			intervalMs: 1
		}).then(() => assert(n === 3))
	})

	it('Retry on reject', function() {
		let n = 0
		let task = async () => ++n < 3 ? Promise.reject() : n
		
		return retry(task, {
			filterReject: () => true,	//retry with any error
			retry: 5,			
			intervalMs: 1,		
		}).then(() => assert(n === 3))
	})

	it('Limit reached', function() {
		let n = 0
		let task = () => ++n
		
		return retry(task, {
			filterResolve: () => true,	//retry on any resolved value
			retry: 1,			//max retry attempt
			intervalMs: 1,
		})
			.then(() => assert(false))
			.catch(() => assert(n === 2))
	})

	it('Timeout', function() {
		let n = 0
		let task = () => ++n
		
		return retry(task, {
			filterResolve: () => true,	//retry on any resolved value
			intervalMs: 1,
			timeoutMs: 100
		})
			.then(() => assert(false))
			.catch(() => Promise.resolve(assert(n > 1)))
	})
})

describe('dedup', function() {
	it('Dedup promise call', function() {
		let busy
		let n = 0

		function task() {
			return new Promise(resolve => {
				if (busy)
					throw 'Duplicated concurrent call!'
				busy = true
			
				setTimeout(() => {
					//console.log('Working...')
					busy = false
					resolve(n++)
				}, 100)
			})
		}

		let test = () => dedup(task)
		//.then (d => console.log('Finish:', d))
		//.catch(e => console.log('Error:', e))

		return Promise.all([
			test(),
			test(),
			delay(200, test)
		]).then(() => assert(n == 2)).then(()=>console.log(n))
	})
})