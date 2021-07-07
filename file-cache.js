const fs = require('fs')

class FileCache {
	constructor(filePath) {
		this.filePath = filePath
		this.cacheMap = {}
		this.lastModifiedTime = 0
	}

	_reload(force) {
		let stat
		try {
			stat = fs.statSync(this.filePath)
		} catch (e) {
			if (isFileNotFound(e))
				return this.cacheMap = {}
			throw e
		}
		if (stat.mtimeMs === this.lastModifiedTime && !force)
			return this.cacheMap

		let text = fs.readFileSync(this.filePath, 'utf8')
		this.cacheMap = JSON.parse(text)
		this.lastModifiedTime = stat.mtimeMs
		//console.log(`FileCache loaded ${this.filePath}: ${text}`)
		return this.cacheMap
	}

	get(k) {
		return this._reload()[k]
	}

	put(k, data) {
		this._reload()
		this.cacheMap[k] = data
		this._flush()
	}

	remove(k) {
		this._reload()
		delete this.cacheMap[k]
		this._flush()
	}

	_flush() {
		fs.writeFileSync(this.filePath, JSON.stringify(this.cacheMap, null, 4))
		let stat = fs.statSync(this.filePath)
		this.lastModifiedTime = stat.mtimeMs
	}

	keys() {
		return Object.keys(this.cacheMap)
	}

	clear() {
		try {
			fs.unlinkSync(this.filePath)
		} catch (e) {
			if (isFileNotFound(e)) {
				// skip
			} else {
				throw e
			}
		}
		this.cacheMap = {}
	}
}

function isFileNotFound(e) {
	return e.code === 'ENOENT' && e.toString().indexOf('no such file') > 0
}

function createFileCache(file) {
	let cache = new FileCache(file)
	cache._reload()
	return {
		get: (k, defaultVal) => cache.get(k, defaultVal),
		put: (k, data) => cache.put(k, data),
		remove: k => cache.remove(k),
		keys: () => cache.keys(),
		clear: () => cache.clear()
	}
}

module.exports = createFileCache
