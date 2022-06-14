const api = require('./index.js')

api.add({
	path: '/',
	action: (req, res) => {

	}
})

api.start({ docs: true })