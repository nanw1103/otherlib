const assert = require('assert')
const { delay, dedup } = require('../lib/index.js')

process.on('uncaughtException', err => {
	console.error('uncaughtException', err)
	process.exit()
}).on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
	process.exit()
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
		]).then(() => assert(n == 2)).then(()=>{})
	})
})