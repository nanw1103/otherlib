const assert = require('assert')
const { retry } = require('../index.js')
require('./helper.js')

describe('retry (new api)', function() {
	it('Happy path, no retry', function() {
		let n = 0
		let task = () => {
			++n
			return 12345
		}

		return retry(task, {
			//filter: (err, ret) => err,	//use default filter: retry with any error
			retry: 5,			//max retry attempt
			intervalMs: 1,		//wait before retry
			timeoutMs: 0,		//total timeout limit. 0 indicates no total timeout
			//log: console.log,	//optionally, log the details
			//name: 'test',		//name shown in log
		}).then(() => assert(n === 1))
	})

	it('Retry twice, based on error condition', function() {
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
			//filter: (err, ret) => err,	//use default filter: retry with any error
			retry: 5,			//max retry attempt
			intervalMs: 1,		//wait before retry
			timeoutMs: 0,		//total timeout limit. 0 indicates no total timeout
			//log: console.log,	//optionally, log the details
			//name: 'test',		//name shown in log
		}).then(ret => assert(ret === 3))
	})

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
			//filter: (err, ret) => err,	//use default filter: retry with any error
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
			filter: (err, ret) => console.log(err) || ret < 3,	//retry when resolved ret is less than 3
			retry: 5,
			intervalMs: 1
		}).then(ret => assert(ret === 3))
	})

	it('Retry on resolve', function() {
		let n = 0
		let task = () => ++n

		return retry(task, {
			filter: (err, ret) => console.log(err) || ret < 3,	//retry when resolved value < 3
			retry: 5,
			intervalMs: 1
		}).then(() => assert(n === 3))
	})

	it('Retry on reject', function() {
		let n = 0
		let task = async () => ++n < 3 ? Promise.reject() : n

		return retry(task, {
			//filter: (err, ret) => err,	//use default filter: retry with any error
			retry: 5,
			intervalMs: 1,
		}).then(() => assert(n === 3))
	})

	it('Limit reached', function() {
		let n = 0
		let task = () => ++n

		return retry(task, {
			filter: (err, _ret) => console.log(err) || true,	//retry regardless of err/ret, a dead loop
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

describe('retry - (legacy api)', function() {
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
			filterReject: e => console.log(e) || true,	//retry with any error
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
