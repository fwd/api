const fs = require('fs')
const ejs = require('ejs')
const _ = require('lodash')
const path = require('path')
const server = require('@fwd/server')
const rateLimit = require("express-rate-limit")

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = {

	server: server,

	endpoints: [],

	config: {},

	use(action) {
		this.server.use(action)
	},

	serve(endpoints) {

		if (!endpoints) {
			console.log("Invalid endpoints provided", endpoints)
			return
		}

		if (Array.isArray(endpoints) && !endpoints.length) {
			console.log("Empty endpoints array provided", endpoints)
			return
		}

		if (Array.isArray(endpoints)) {
			endpoints.map(a => this.endpoints.push(a))
			return
		}

		if (!Array.isArray(endpoints)) {
			this.endpoints.push(endpoints)
			return
		}

	},

	// add endpoint method
	add(endpoints) { this.serve(endpoints) },

	// nicknames
	handle(endpoints) { this.add(endpoints) },
	watch(endpoints) { this.add(endpoints) },

	render(template, data, contentType) {

		return new Promise((resolve, reject) => {

			if (!template || typeof template !== 'string') return reject({ message: "template is required"})

			try	{

				var templatePath = template && template.includes('.') ? template : path.join(__dirname, `./views/${template}.ejs`)

				fs.readFile(templatePath, 'utf-8', function(err, body) {
					
					try {
						var response = {}
						response['Content-Type'] = contentType || 'text/html; charset=utf-8'
						response.data = ejs.render(body, data)
						resolve(response)
					} catch (e) {
						resolve({
							error: true,
							code: 500,
							message: e.message || `Template ${template} could not be found`
						})
					}
					

				});

			} catch (e) {
				resolve(e)
			}

		})

	},

	methods() {

		var methods = this.endpoints.map((item) => {
			var b = {}
			b.name = item.name || ''
			b.slug = b.name.toLowerCase().split(' ').join('-')
			b.group = item.group
			b.cached = item.cached
			b.minify = item.minify
			b.obfuscate = item.obfuscate
			b.version = item.version
			b.path = item.path
			b.method = item.method.toUpperCase()
			b.endpoint = item.path
			b.endpoint = req.protocol + '://' + req.get('host') + b.endpoint
			b.parameters = item.parameters
			return b
		})

		return _.groupBy(methods, 'group')

	},

	load() {

		var self = this

		this.endpoints.map((item) => {

			if (!item.method || !item.path) {
				console.log("Invalid method", item)
				return
			}

			if (item.limit) {

				var limits = Array.isArray(item.limit) ? [item.limit[0], (item.limit[1] * 1000)] : [60, 60000]

				server.use(item.path, rateLimit({
					windowMs: limits[1], // 60 seconds
					max: limits[0],
					handler: function (req, res) {
					    res.send({
					    	code: 429,
					    	error: true,
					    	message: `You're doing that too much. Please wait before trying again.`
					    })
					}
				}))

			}

			self.server[item.method](item.path, async (req, res) => {
				
				var serverStart = new Date().getTime()

				if (item.auth && typeof item.auth == 'function' && !await item.auth(req)) {
					res.send({
						code: 401,
						error: true,
						message: "Unauthorized"
					})
					return
				}

				var localhost = req.get('host')
					localhost = localhost.includes('localhost')

				var package = require('./package.json')

				if (!item.harden) {			
					res.setHeader('X-Powered-By', package.name)
					res.setHeader('X-Powered-Version', package.version)
				}

				var cache = self.server.cache(item.path)

				if (item.cached && cache && !localhost) {

					res.setHeader('X-Cached', true)

					if (cache && cache['Content-Type']) {
						var headers = {
							'Content-Type': cache['Content-Type']
						}
						if (cache['Content-Length']) {
							headers['Content-Length'] = cache['Content-Length']
						}
						res.writeHead(200, headers);
						res.write(cache.data);
						res.end()
						return
					}

					res.send(cache)
					
					return

				}
			
				let send = {}
				
				return new Promise(async () => {

					if (item.parameters && item.parameters.filter(a => a.required).length) {

						var errors = []

						item.parameters.map(a => {

							var exists = req.query[a.name] || req.body[a.name]

							if (a.required && !exists) {
								errors.push(a.name + ' is required')
							}
							
							a.type = a.type || 'string'

							if (req.query[a.name] && typeof exists != a.type) {
								errors.push(a.name + ' needs to be type ' + a.type)
							}

							if (req.query[a.name] && a.type == "email" && !validateEmail(exists)) {
								errors.push(a.name + ' is not a valid ' + a.type)
							}

						})

						if (errors.length) {

							send.code = 400

							send.error = errors

							res.send(send)

							return
						}
						
					}

					try {
						
						var functionStart = new Date().getTime()
						
						req.render = self.render

						item.action(req).then(async (response) => {

							var expiration = item.cached ? self.server.time( (typeof item.cached === "number" ? item.cached : 24 ) , 'hours') : null

							response = response || {}

							if (response && response.redirect) {
								res.redirect(response.redirect)
								return
							}

							if (response['Content-Type'] && item.obfuscate && !localhost) {

								var settings = typeof item.obfuscate === "object" ? item.obfuscate : {
								    compact: false,
								    controlFlowFlattening: true,
								    controlFlowFlatteningThreshold: 1,
								    numbersToExpressions: true,
								    simplify: true,
								    shuffleStringArray: true,
								    splitStrings: true,
								    stringArrayThreshold: 1
								}

								var obfuscationResult = require('@fwd/obfuscate').obfuscate(response.data, settings)

								response.data = obfuscationResult.getObfuscatedCode()

							}

							if (response['Content-Type'] && item.minify && !localhost) {

								if (item.minify === 'js') {

									const minify = require('@node-minify/core');
									const uglifyES = require('@node-minify/uglify-es');

									response.data = await minify({
									  compressor: uglifyES,
									  content: response.data,
									  options: {
									    compress: {
									    	passes: 2
									    }
									  },
									  callback: function(err, min) {}
									})

								}

							}
							
							if (item.flag) {
							    response.data = `${item.flag}\n${response.data}`
							}

							if (item.cached) {
								self.server.cache(item.path, response, expiration)
							}

							if (response && response['Content-Type']) {
								var headers = {
									'Content-Type': response['Content-Type']
								}
								if (response['Content-Length']) {
									headers['Content-Length'] = response['Content-Length']
								}
								res.writeHead(200, headers);
								res.write(response.data);
								res.end()
								return
							}
							
							if (response.cached) send.cached = response.cached
							if (response.message) send.message = response.message
							
							if (response.error) {
								send.error = response.error
							} else {
								send.response = response
							}
							
							send.code = response.code || response.error ? 400 : 200
							
							delete response.error
							delete response.code

							if (send.code == 404) {
								send.response = []
							}
							
							if (item.debug || self.config && self.config.debug) {
								var functionEnd = new Date().getTime();
								send.debug = {
									time: server.timestamp('LLL'),
									config: self.config,
									version: package.version,
									runtime: {
										server: functionStart - serverStart +  ' ms',
										function: functionEnd - functionStart + ' ms',
									}
								}
							}
							
							if (item.cached) {
								self.server.cache(item.path, send, expiration)
							}

							function isCircular(d) {
							  try {JSON.stringify(d)}
							  catch (e) {return true}
							  return false
							}

							if (self.config.response == false) {
								res.send(isCircular(send) ? {} : send.response ? send.response : send)
							} else {
								res.send(isCircular(send) ? {} : send)
							}
							
						})

					} catch (e) {
						send.response = e.message
						res.send(send)
					}
					
				})

			})

		})

	},

	start(port, path, config) {
		this.load()
		if (config) Object.keys(config).map(a => this.config[a] = config[a])
		this.server.start(port || 80, path || __dirname, this.config)
	}

}
