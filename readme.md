<h1 align="center">@fwd/api 🔐</h1>

> An NPM package for bootstraping a API in NodeJS.

## Install

```sh
npm install fwd/api
```

## Usage

```js

const api = require('@fwd/api')

api.add([
	{
		path: '/',
		method: 'get',
		action: (req) => {
			return new Promise((resolve, reject) => {
				resolve("Hello, World")
			})
		}
	},
	{
		path: '/login',
		method: 'post',
		parameters: [
			{
				name: "email",
				type: "string",
				required: true
			},
			{
				name: "password",
				type: "string",
				required: true
			},
		],
		action: (req) => {
			return new Promise((resolve, reject) => {
				var username = req.body.username
				resolve("Ok")
			})
		}
	}
])

api.start(8080)

```

## 👤 Author

**Forward Miami**

* Github: [@fwd](https://github.com/fwd)
* Website: [https://forward.miami](https://forward.miami)

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/fwd/api/issues).

## 📝 License

MIT License

Copyright © 2021 [Forward Miami](https://forward.miami).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
