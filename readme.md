![Cover](https://raw.githubusercontent.com/fwd/api/master/.github/cover.png)

<h1 align="center">@fwd/api 🧩 (Under Development)</h1>

> A NodeJS library to simplify API building.

## Install

```sh
npm install @fwd/api
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

api.start(80, __dirname)

```

## 👤 Author

**Forward Miami**

* Github: [@fwd](https://github.com/fwd)
* Website: [https://forward.miami](https://forward.miami)

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/fwd/api/issues).

## 📝 License

Copyright © 2020 [Forward Miami](https://forward.miami).
