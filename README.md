# otherlib
Yet another javascript utility library

[![npm version](http://img.shields.io/npm/v/otherlib.svg?style=flat)](https://npmjs.org/package/otherlib "View this project on npm")

[API Doc](docs/index.html)

* dedup
* delay
* retry

**dedup**

Deduplicate concurrent generation of the same promise task. If there's an ongoing pending promise, succeeding calls to the same promise-generator function resolves/rejects along with the pending promise.

Deduplicate concurrent promise calls by resolving them together.

dedup wraps any function that returns promise. Succeeding call to the same function will get a promise that resolves/rejects along with the previous pending promise if any, but does not trigger the actual logic.

```javascript
const dedupa = require('dedup-async')

let evil
let n = 0

function task() {
	return new Promise((resolve, reject) => {
		if (evil)
			throw 'Duplicated concurrent call!'
		evil = true
    
		setTimeout(() => {
			console.log('Working...')
			evil = false
			resolve(n++)
		}, 100)
	})
}

function test() {
	dedupa(task)
		.then (d => console.log('Finish:', d))
		.catch(e => console.log('Error:', e))
}

test()                //Prints 'Working...', resolves 0. (Starts a new pending promise)
test()                //No print,            resolves 0. (Resolves together with the previous promise)
test()                //No print,            resolves 0. (Resolves together with the previous promise)
setTimeout(test, 200) //Prints 'Working...', resolves 1. (Starts a new pending promise since the previous one has completed)
```

**delay**

Wrap the provided data/function/promise in a delayed a promise.

```javascript
await delay(1000)
await delay(1000, 'the result to be resolved')
await delay(1000, a_func)
```

**retry**

Retry the specific task conditionally

```javascript
(function() {
    let n = 0
    let task = () => {
        return new Promise((resolve, reject) => {
            if (++n > 2)
                resolve(n)
            else
                reject('Something wrong: ' + n)
        })
    }
    return retry(task, {
        filter: err => true,		//retry with any error
        retry: 5,			//max retry attempt
        intervalMs: 50,			//wait before retry 
        timeoutMs: 0,			//total timeout limit. 0 indicates no total timeout			
        log: console.log,		//optionally, log the details
        name: 'test',			//name shown in log
    })
})().then(console.log).catch(console.error)
```

