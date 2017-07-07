# hypercomponent

[![Build Status][0]][1]
[![Standard - JavaScript Style Guide][2]][3]

> Fast and light component system, backed by [hyperHTML][hyper] :zap:

## Usage

### A Basic Component

```js
const HyperComponent = require('hypercomponent')

class HelloMessage extends HyperComponent {
  render () {
    return this.html`
      <div>Hello ${this.props.name}</div>
    `
  }
}

const greeting = new HelloMessage({ name: 'Jane'})

document.body.appendChild(greeting.render())
```

### A Stateful Component

```js
const HyperComponent = require('hypercomponent')

class Timer extends HyperComponent {
  constructor (props) {
    super(props)
    this.state = {
      secondsElapsed: 0
    }
  }
  tick () {
    this.setState({
      secondsElapsed = this.state.secondsElapsed + 1
    })
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

### An Application

```js
class TodoApp extends HyperComponent {
  constructor(props) {
    super(props)
    this.state = {items: [], text: ''}
  }
  render() {
    return this.html`
      <div>
        <h3>TODO</h3>
        <div>${
        this.child(TodoList, {items: this.state.items})
        }</div>
        <form onsubmit="${this}">
          <input onchange="${this}" value="${this.state.text}" />
          <button>Add #${this.state.items.length + 1}</button>
        </form>
      </div>
    `
  }
  onchange(e) {
    this.setState({text: e.target.value})
  }
  onsubmit(e) {
    e.preventDefault()
    var newItem = {
      text: this.state.text,
      id: Date.now()
    }
    this.setState({
      items: this.state.items.concat(newItem),
      text: ''
    })
  }
}

class TodoList extends HyperComponent {
  render() {
    return this.html`
      <ul>${this.props.items.map(item => this.wire(item)`
        <li>
          ${item.text}
        </li>`)
      }</ul>`
  }
}

const app = new TodoApp()

document.body.appendChild(app.render())
```

## License

MIT

[0]: https://travis-ci.org/joshgillies/hypercomponent.svg?branch=master
[1]: https://travis-ci.org/joshgillies/hypercomponent
[2]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[3]: http://standardjs.com/
[hyper]: https://github.com/WebReflection/hyperHTML
