const assert = require('assert')
const {
	bufferToStream,
	streamToBuffer,
	stringToStream
} = require('../stream')

describe('stream', function() {
	it('basic', async function() {
		let text = 'Hello, mortal.'
		let buffer1 = Buffer.alloc(text.length, text)
		let stream = stringToStream(text)

		let buffer2 = await streamToBuffer(stream)
		let stream2 = bufferToStream(buffer2)
		let buffer3 = await streamToBuffer(stream2)

		assert(Buffer.compare(buffer1, buffer3) === 0)
	})

	it('streamToBuffer', function() {
	})

	it('stringToStream', function() {
	})
})
