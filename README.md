# otherlib
Yet another utility library

**delay**

```
await delay(1000, 'the result to be resolved')
await delay(1000)
```

**retry**

```
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
