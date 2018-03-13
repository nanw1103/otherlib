const assert = require('assert')
const {
	delay,
	retry
} = require('./index.js')

describe('delay', function() {
	it('Delayed promise', function() {
		return delay(100, 'delayed promise completed')		
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
			filter: () => true,	//retry with any error
			retry: 5,			//max retry attempt
			intervalMs: 50,		//wait before retry 
			timeoutMs: 0,		//total timeout limit. 0 indicates no total timeout			
			log: console.log,	//optionally, log the details
			name: 'test',		//name shown in log
		})		
	})
})