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

api.add({
	path: '/login',
	method: 'post',
	limit: true, // rate limiting
	auth: (req) => {
		if (isNotBot) { // pseudo code
			return true
		}
	},
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
			resolve("Ok")
		})
	}
})

api.start(80, __dirname)

```

## 👤 Author

**Forward Miami**

* Github: [@fwd](https://github.com/fwd)
* Website: [https://forward.miami](https://forward.miami)

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/fwd/api/issues).

## ⭐️ Show your support

Give a star if this project helped you, and help us continue maintaining this project by contributing to it or becoming a sponsor.

[Become a sponsor to fwd](https://github.com/sponsors/fwd)

## 📝 License

Copyright © 2020 [Forward Miami](https://forward.miami). This project is [Apache-2.0](https://spdx.org/licenses/Apache-2.0.html) licensed.
