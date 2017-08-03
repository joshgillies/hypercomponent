# hypercomponent

[![Build Status][0]][1]
[![Standard - JavaScript Style Guide][2]][3]

> A framework agnostic front-end component system, backed by [hyperHTML][hyper] :zap:

## API

### `HyperComponent`

`HyperComponent` is a base class for creating framework agnostic front-end components.

```js
class Component extends HyperComponent {
  constructor (props) {
    super(props)
  }
}
```

Instances of `HyperComponent` have the following internal properties:

- `this.el`: The DOM node a component has rendered to. Defaults to `null`.
- `this.props`: The initial properties passed to the `HyperComponent` constructor. Defaults to `Component.defaultProps` or `{}`
- `this.state`: The initial state of the `HyperComponent` constructor. Defaults to `Component.defaultState` or `{}`

### `HyperComponent.prototype.child(Component, props, children)`

`HyperComponent` provides a `this.child` method for managing component composition. The following arguments are available, and the returned value of `this.child` is the result of calling `Component.prototype.render()`.

#### `Component`

The first argument to `this.child` is the component class you wish to compose within your parent component. It's expected that your `Component` is an instance of `HyperComponent`.

#### `props`

The second argument to `this.child` is your props object. Internally this will effectively create a new instance of your child component by passing props to the constructor eg. `new Component(props)`

For managing multiple instances of the same component class, you can additionally assign a `key` property via `props.key`, which is used to ensure component instances are reused on subsequent calls to `render()`.

#### `children`

The last argument to `this.child` is `children`, and it's expected that this argument is a valid type for children within hyperHTML eg. a String of text or markup, DOM nodes, a Promise, or an Array of the previous types. Internally the `children` argument is assigned to `this.props.children`.

As an example, the following demonstrates all of the above.

```js
class Parent extends HyperComponent {
  render () {
    return this.html`<div id="parent">${
      this.child(Child, { key: 'child1' }, this.wire(':child')`<div>${[
        this.child(Child, { key: 'subchild1' }, `<div>woah!</div>`),
        this.child(Child, { key: 'subchild2' }, `<div>dude!</div>`)
      ]}</div>`)
    }</div>`
  }
}

class Child extends HyperComponent {
  render () {
    return this.html`<div id="${ this.props.key }">${
      this.props.children
    }</div>`
  }
}
```

### `HyperComponent.prototype.connect()`

When assigned, the `connect` handler will be called once your component has been inserted into the DOM.

### `HyperComponent.prototype.disconnect()`

When assigned, the `disconnect` handler will be called once your component has been removed from the DOM.

### `HyperComponent.prototype.handleEvent(event)`

Preconfigured to delegate any component method that's name matches a valid DOM event. eg. `onclick`/`click`.

```js
class Clicker extends HyperComponent {
  onclick (event) {
    console.log(event.target, " has been clicked!")
  }
}

// instead of this... 👎
class BoundButton extends Clicker {
  render () {
    return this.html`<button onclick="${this.onclick}">Click me</button>`
  }
}

// you can simply do this! 🎉
class DelegatedButton extends Clicker {
  render () {
    return this.html`<button onclick="${this}">Click me</button>`
  }
}
```

Of course the `handleEvent` method as provided by `HyperComponent` is simply a helper. You can always override it and create your own event delegation logic. For more information on `handleEvent` checkout this post by [@WebReflection][WebReflection]: [DOM handleEvent: a cross-platform standard since year 2000][handleEvent].

### `HyperComponent.prototype.html`

Tagged template literal for declaring your template tag. Generally used from within your `render()` function.

The output of your template literal is automatically assigned to `this.el`.

```js
class Component extends HyperComponent {}
const comp = new Component()
const el = comp.html`<div></div>`
el === comp.el // true
```

### `HyperComponent.prototype.render()`

You'll always want to implement a render function. This forms the public interface for your component. Your `render` method should always return DOM nodes.

### `HyperComponent.prototype.setState(obj)`

Sets the internal state of a component eg. `this.state` by extending previous state with next state. After the state is updated your components `render()` method will be called.

### `HyperComponent.prototype.wire(obj, type)`

A simple facade around [`hyperHTML.wire(obj, type)`][wire]. Useful as a shorthand for creating wires within a template.

```js
class Component extends HyperComponent {
  constructor (props) {
    super(props)
    this.items = [
      { text: 'Foo'},
      { text: 'Bar'}
    ]
  }
  render () {
    return this.html`
      <div>${this.items.map((item) => this.wire(item)`
        <div> ${item.text} </div>`
      )}</div>`
  }
}1
```

As an added convenience, for cases where you'd want to bind an additional type to your components instance eg. `this.wire(this, ':div')`. You can simply do `this.wire(':div')`.

## Examples

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
        <h3>TODO</h3>${
        this.child(TodoList, {items: this.state.items})
        }<form onsubmit="${this}">
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
[WebReflection]: https://twitter.com/WebReflection
[hyper]: https://github.com/WebReflection/hyperHTML
[wire]: https://github.com/WebReflection/hyperHTML#wait--there-is-a-wire--in-the-code
[handleEvent]: https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
