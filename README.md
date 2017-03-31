# hypercomponent

[![Build Status][0]][1]
[![Standard - JavaScript Style Guide][2]][3]

> Fast and light component system, backed by [hyperHTML][hyper] :zap:

## Usage

### Basic

```js
const hyperHTML = require('hyperhtml')
const component = require('hypercomponent')
const app = hyperHTML.bind(document.body)

const Button = component((render, text) => render`
  <button>
    ${text}
  </button>
`)

app`${Button('Hello world!')}`
```

### Pass your own [wire][wire] or bound node

```js
const hyperHTML = require('hyperhtml')
const component = require('hypercomponent')
const app = hyperHTML.bind(document.body)

const Button = component((render, text) => render`
  <button>
    ${text}
  </button>
`)

app`${[
  Button(hyperHTML.wire(), 'Hello world!'),
  Button(hyperHTML.wire(), 'Hello again!')
]}`
```

### Subscribe to lifecycle events

```js
const hyperHTML = require('hyperhtml')
const component = require('hypercomponent')
const app = hyperHTML.bind(document.body)

const Button = component({
  onload: (e) => {
    console.log(e, 'loaded')
  },
  onunload: (e) => {
    console.log(e, 'unloaded')
  },
  render: (render, text) => render`
    <button onclick="${(e) => e.target.parentNode.removeChild(e.target)}">
      ${text}
    </button>
  `
})

app`${[
  Button(hyperHTML.wire(), 'Hello world!'),
  Button(hyperHTML.wire(), 'Hello again!')
]}`
```

## See also:

- [yoshuawuyts/nanocomponent][nano]
- [joshgillies/microcomponent][micro]

## License

MIT

[0]: https://travis-ci.org/joshgillies/hypercomponent.svg?branch=master
[1]: https://travis-ci.org/joshgillies/hypercomponent
[2]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[3]: http://standardjs.com/
[hyper]: https://github.com/WebReflection/hyperHTML
[wire]: https://github.com/WebReflection/hyperHTML#wait--there-is-a-wire--in-the-code
[nano]: https://github.com/yoshuawuyts/nanocomponent
[micro]: https://github.com/joshgillies/microcomponent
