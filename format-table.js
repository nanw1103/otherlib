const defaultOptions = {
	header: true,
	footer: true
}

function formatTable(data, columns, override) {
	let options = {
		...defaultOptions,
		...override
	}

	columns = columns || Object.keys(data[0] || {})

	let headerNames = []
	let headerOpts = []
	let sort
	for (let i in columns) {
		let opt = columns[i]
		if (typeof opt === 'string') {
			opt = {
				key: opt
			}
		}

		let name = opt.name || opt.key.charAt(0).toUpperCase() + opt.key.substring(1)
		headerNames.push(name)

		opt.width = name.length
		headerOpts.push(opt)

		if (opt.sort)
			sort = {
				fn: opt.sort,
				index: i
			}
	}

	let rows = []
	for (let obj of data) {
		let row = []
		for (let opt of headerOpts) {
			let v = obj[opt.key]
			if (v !== undefined) {
				v = String(v)
			} else {
				v = ''
			}
			row.push(v)
			opt.width = Math.max(opt.width, v.length)
			if (opt.max && opt.max < opt.width)
				opt.width = opt.max
		}
		rows.push(row)
	}

	//sort
	if (sort) {
		let sortFn
		if (typeof sort.fn === 'function') {
			sortFn = sort.fn
		} else if (Number.isInteger(sort.fn)) {
			let sign = Math.sign(sort.fn)
			sortFn = (a, b) => a[sort.index].localeCompare(b[sort.index]) * sign
		} else {
			sortFn = (a, b) => a[sort.index].localeCompare(b[sort.index])
		}
		rows.sort(sortFn)
	}

	// convert to text
	let lines = []

	let headerLine = formatRow(headerNames)
	let seperatorLine = ''.padEnd(headerLine.length, '-')

	if (options.header) {
		lines.push(headerLine)
		lines.push(seperatorLine)
	}

	for (let row of rows)
		lines.push(formatRow(row))
	if (options.footer)
		lines.push(seperatorLine)
	lines.push('')

	return lines.join('\n')

	function formatRow(cells) {
		let line = []
		for (let i = 0; i < cells.length; i++) {
			let c = cells[i]
			let opt = headerOpts[i]

			if (c.length < opt.width)
				c = c.padEnd(opt.width)
			else
				c = c.substring(0, opt.width)
			line.push(c)
		}
		return line.join(' ')
	}
}

module.exports = formatTable