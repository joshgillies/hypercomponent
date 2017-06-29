# hypercomponent

[![Build Status][0]][1]
[![Standard - JavaScript Style Guide][2]][3]

> Fast and light component system, backed by [hyperHTML][hyper] :zap:

## Usage

### A Basic Component

```js
const HyperComponent = require('hypercomponent')

class Button extends HyperComponent {
  render (text) {
    return this.html`
      <button onclick="${this}">
        ${text}
      </button>
    `
  }
  onclick () {
    this.render(`I've been clicked!`)
  }
}

const myButton = new Button()

document.body.appendChild(myButton.render('Click me?'))
```

### A Stateful Component

```js
const HyperComponent = require('hypercomponent')

class Timer extends HyperComponent {
  constructor () {
    super()
    this.state = {
      secondsElapsed: 0
    }
  }
  tick () {
    this.state.secondsElapsed = this.state.secondsElapsed + 1
    this.render()
  }
  connect () {
    this.interval = setInterval(() => this.tick(), 1000)
  }
  disconnect () {
    clearInterval(this.interval)
  }
  render () {
    return this.html`
      <div>Seconds Elapsed: ${this.state.secondsElapsed}</div>
    `
  }
}

const myTimer = new Timer()

document.body.appendChild(myTimer.render())
```

## License

MIT

[0]: https://travis-ci.org/joshgillies/hypercomponent.svg?branch=master
[1]: https://travis-ci.org/joshgillies/hypercomponent
[2]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[3]: http://standardjs.com/
[hyper]: https://github.com/WebReflection/hyperHTML
