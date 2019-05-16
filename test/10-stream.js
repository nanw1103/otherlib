const assert = require('assert')
const {
	bufferToStream,
	streamToBuffer,
	stringToStream
} = require('../lib/stream')

describe('stream', function() {
	it('basic', async function() {
		let text = 'Hello, mortal.'
		let buffer1 = Buffer.alloc(text.length, text)
		let stream = stringToStream(text)
		
		let buffer2 = await streamToBuffer(stream)
		let stream2 = bufferToStream(buffer2)
		
		assert(0 === Buffer.compare(buffer1, buffer2))
	})

	it('streamToBuffer', function() {
	})
	
	it('stringToStream', function() {
	})
})

