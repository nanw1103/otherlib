
process.on('uncaughtException', err => {
	console.error('uncaughtException', err)
	process.exit(11)
}).on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
	process.exit(12)
})
