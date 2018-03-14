const assert = require('assert')
const {
	delay,
	retry,
	dedup
} = require('./index.js')

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
	it('Retry 2 times', function() {
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
			filter: e => true,	//retry with any error
			retry: 5,			//max retry attempt
			intervalMs: 50,		//wait before retry 
			timeoutMs: 0,		//total timeout limit. 0 indicates no total timeout			
			//log: console.log,	//optionally, log the details
			//name: 'test',		//name shown in log
		})		
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