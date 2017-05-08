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

const Button = component({
  render (text) {
    return this.html`
      <button>
        ${text}
      </button>
    `
  }
})

const myButton = Button()

app`${myButton.render('Hello world!')}`

setTimeout(myButton.render.bind(myButton), 1000, 'Hello there!')
```

### Implement update hooks similar to Reacts shouldUpdate API.

```js
const hyperHTML = require('hyperhtml')
const component = require('hypercomponent')
const app = hyperHTML.bind(document.body)

const Button = component({
  update (text) {
    return false // prevent updates!
  },
  render (text) {
    return this.html`
      <button>
        ${text}
      </button>
    `
  }
})

const myButton = Button()

// first call to render will produce `<button>Hello World!</button>`
app`${myButton.render('Hello world!')}`

// subsequent calls to render will not update the element
setTimeout(myButton.render.bind(myButton), 1000, 'Hello there!')
```

### Subscribe to lifecycle events

```js
const hyperHTML = require('hyperhtml')
const component = require('hypercomponent')
const app = hyperHTML.bind(document.body)

const Button = component({
  connect (element) {
    console.log(element, 'connected')
  },
  disconnect (element) {
    console.log(element, 'disconnected')
  },
  render (text) {
    return this.html`
      <button onclick="${this.onclick}">
        ${text}
      </button>
    `
  },
  onclick (event) {
    event.target.remove()
  }
})

const button1 = Button()
const button2 = Button()

app`${[
  button1.render('Hello world!'),
  button2.render('Hello again!')
]}`
```

### A Stateful Component

```js
const hyperHTML = require('hyperhtml')
const component = require('hypercomponent')
const app = hyperHTML.bind(document.body)

const Timer = component({
  constructor () {
    this.state = {
      secondsElapsed: 0
    }
  },
  tick () {
    this.state.secondsElapsed = this.state.secondsElapsed + 1
    this.render()
  },
  connect () {
    this.interval = setInterval(() => this.tick(), 1000)
  },
  disconnect () {
    clearInterval(this.interval)
  },
  render () {
    return this.html`
      <div>Seconds Elapsed: ${this.state.secondsElapsed}</div>
    `
  }
})

const myTimer = Timer()

app`${myTimer.render()}`
```

## See also:

- [yoshuawuyts/nanocomponent][nano]
- [yoshuawuyts/microcomponent][micro]

## License

MIT

[0]: https://travis-ci.org/joshgillies/hypercomponent.svg?branch=master
[1]: https://travis-ci.org/joshgillies/hypercomponent
[2]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[3]: http://standardjs.com/
[hyper]: https://github.com/WebReflection/hyperHTML
[wire]: https://github.com/WebReflection/hyperHTML#wait--there-is-a-wire--in-the-code
[nano]: https://github.com/yoshuawuyts/nanocomponent
[micro]: https://github.com/yoshuawuyts/microcomponent
