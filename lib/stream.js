const Readable = require('stream').Readable

function bufferToStream(buffer) {
	return new Readable({
		read() {
			this.push(buffer)
			this.push(null)
		}
	})
}

function streamToBuffer(readable) {
	return new Promise((resolve, reject) => {
		let buffers = []
		readable
			.on('data', d => buffers.push(d))
			.on('error', reject)
			.on('end', () => resolve(Buffer.concat(buffers)))
	})
}

function stringToStream(text) {
	let s = new Readable()
	s._read = () => {}
	s.push(text)
	s.push(null)
	return s
}

async function streamToString(stream, encoding='utf8') {
	let buf = await streamToBuffer(stream)
	return buf.toString(encoding)
}

module.exports = {
	bufferToStream,
	streamToBuffer,
	stringToStream,
	streamToString
}

class MemStream extends Readable {
	constructor(src) {
		if (typeof src === 'string') {
		} else if (src instanceof Buffer) {
		}
	}
	
	toBuffer() {
	}
	
	toString() {
	}
}
