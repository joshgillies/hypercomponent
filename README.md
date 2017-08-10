# hypercomponent

[![Build Status][0]][1]
[![Standard - JavaScript Style Guide][2]][3]

> :zap: Fast and light component system, backed by [hyperHTML][hyper]

`HyperComponent` is an abstract component system designed to be fast, and light - weighing in at ~4kb.

```js
const HyperComponent = require('hypercomponent')

class HelloMessage extends HyperComponent {
  renderCallback (wire) {
    return wire`
      <div>Hello ${this.props.name}</div>
    `
  }
}

const greeting = new HelloMessage({ name: 'Jane'})

greeting.render(document.body)
```

## Install

### npm

`npm install hypercomponent --save`

### cdn

`<script src="https://unpkg.com/hypercomponent@latest/dist/hypercomponent.min.js"></scrpt>`

## API

### `HyperComponent`

`HyperComponent` is a base class for creating generic front-end components.

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

### `HyperComponent.prototype.renderCallback(wire, component)`

You'll always want to implement a render function. This forms the public interface for your component. Your `renderCallback` method should always return DOM nodes, and the output of your `renderCallback` is automatically assigned to `this.el`.

The following arguments are available:

#### `wire`

The `wire` argument is a tagged template literal for turning your template into DOM.

Internally your template is cached against the instance of a component, and as such additional calls to `wire` with different templates will result in errors.

For cases where you want sub templates, you can simply pass a optional `type` argument, eg.

```js
class Component extends HyperComponent {
  constructor (props) {
    super(props)
    this.winning = true
  }
  renderCallback (wire) {
    return wire`
      <div>${this.winning
        ? wire(':winning')`<span>Winning!</span>`
        : wire(':not-winning')`<span>Not winning!</span>`
      }</div>
    `
  }
```

For those familiar with `hyperHTML` a `wire` in this case is literally a facade around [`hyperHTML.wire([obj[, type]])`][wire], and can be used in the same way, eg.

```js
class Component extends HyperComponent {
  constructor (props) {
    super(props)
    this.items = [
      { text: 'Foo' },
      { text: 'Bar' }
    ]
  }
  renderCallback (wire) {
    return wire`
      <div>
        <ul>${this.items.map((item) => wire(item, ':unordered')`
          <li> ${item.text} </li>`
        )}</ul>
        <ol>${this.items.map((item) => wire(item, ':ordered')`
          <li> ${item.text} </li>`
        )}</ol>
      </div>`
  }
}
```

#### `component(Component, props, children)`

The `component` argument is useful for managing component composition, and the returned value of `component` is the result of calling `Component.prototype.renderCallback()`. The following arguments are available.

##### `Component`

The `Component` argument is a component class you wish to compose within your parent component. It's expected that `Component` is an instance of `HyperComponent`.

##### `props`

Internally this will effectively create a new instance of your child component by passing props to the constructor eg. `new Component(props)`

For managing multiple instances of the same component class, you can additionally assign a `key` property via `props.key`, which is used to ensure component instances are reused on subsequent calls to `renderCallback()`.

##### `children`

It's expected that the `children` argument is a [valid type for children][types] within hyperHTML eg. a String of text or markup, DOM nodes, a Promise, or an Array of the previous types. Internally the `children` argument is assigned to `this.props.children`.

As an example, the following demonstrates all of the above.

```js
class Parent extends HyperComponent {
  renderCallback (wire, component) {
    return wire`<div id="parent">${
      component(Child, { key: 'child1' },
      wire(':child')`<div>${[
        component(Child, { key: 'subchild1' }, `<div>woah!</div>`),
        component(Child, { key: 'subchild2' }, `<div>dude!</div>`)
      ]}</div>`)
    }</div>`
  }
}

class Child extends HyperComponent {
  renderCallback (wire) {
    return wire`<div id="${ this.props.key }">${
      this.props.children
    }</div>`
  }
}
```

### `HyperComponent.prototype.render(node)`

Renders a component returning it's rendered DOM tree. When the optional argument `node` is provided the contents of the target DOM node will be replaced by your rendered component.

### `HyperComponent.prototype.handleEvent(event)`

By default `handleEvent` is preconfigured to delegate any component method whose name matches a valid DOM event. eg. `onclick`.

The benefit being that instead of binding event handlers individually to your components, you can simply pass your `HyperComponent` instance to your event handler, and delegate all event handling logic through the `handleEvent` API.

As an example:

```js
// instead of this... 👎
class BoundButton extends HyperComponent {
  constructor (props) {
    super(props)
    this.onclick = this.onclick.bind(this)
  }
  onclick (event) {
    console.log(event.target, " has been clicked!")
  }
  renderCallback (wire) {
    return wire`
      <button onclick="${this.onclick}">Click me</button>
    `
  }
}

// you can simply do this! 🎉
class DelegatedButton extends HyperComponent {
  onclick (event) {
    console.log(event.target, " has been clicked!")
  }
  renderCallback (wire) {
    return wire`
      <button onclick="${this}">Click me</button>
    `
  }
}
```

Of course the `HyperComponent.prototype.handleEvent` method is simply a helper. You can always override it to create your own event delegation logic.

As an example, if `camelCase` handlers are more your style:

```js
class Button extends HyperComponent {
  handleEvent (event) {
    const type = event.type
    this[`on${type.substr(0, 1).toUpperCase() + type.substr(1)}`](event)
  }
  onClick (event) {
    console.log(event.target, " has been clicked!")
  }
  renderCallback (wire) {
    return wire`
      <button onclick="${this}">Click me</button>
    `
  }
}
```

For more information on the benefits of `handleEvent` checkout this post by [@WebReflection][WebReflection]: [DOM handleEvent: a cross-platform standard since year 2000][handleEvent].

### `HyperComponent.prototype.connectedCallback()`

When assigned, the `connectedCallback` handler will be called once your component has been inserted into the DOM.

### `HyperComponent.prototype.disconnectedCallback()`

When assigned, the `disconnectedCallback` handler will be called once your component has been removed from the DOM.

### `HyperComponent.prototype.setState(obj)`

Sets the internal state of a component eg. `this.state` by extending previous state with next state. After the state is updated your components `renderCallback()` method will be called.

## Examples

### A Basic Component

```js
const HyperComponent = require('hypercomponent')

class HelloMessage extends HyperComponent {
  renderCallback (wire) {
    return wire`
      <div>Hello ${this.props.name}</div>
    `
  }
}

const greeting = new HelloMessage({ name: 'Jane'})

greeting.render(document.body)
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
      secondsElapsed: this.state.secondsElapsed + 1
    })
  }
  connectedCallback () {
    this.interval = setInterval(() => this.tick(), 1000)
  }
  disconnectedCallback () {
    clearInterval(this.interval)
  }
  renderCallback (wire) {
    return wire`
      <div>Seconds Elapsed: ${this.state.secondsElapsed}</div>
    `
  }
}

const myTimer = new Timer()

myTimer.render(document.body)
```

### An Application

```js
class TodoApp extends HyperComponent {
  constructor (props) {
    super(props)
    this.state = {items: [], text: ''}
  }
  renderCallback (wire, component) {
    return wire`
      <div>
        <h3>TODO</h3>${
        component(TodoList, {items: this.state.items})
        }<form onsubmit="${this}">
          <input onchange="${this}" value="${this.state.text}" />
          <button>Add #${this.state.items.length + 1}</button>
        </form>
      </div>
    `
  }
  onchange (event) {
    this.setState({text: event.target.value})
  }
  onsubmit (event) {
    event.preventDefault()
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
  renderCallback (wire) {
    return wire`
      <ul>${this.props.items.map(item => wire(item)`
        <li>
          ${item.text}
        </li>`)
      }</ul>`
  }
}

const app = new TodoApp()

app.render(document.body)
```

## License

MIT

[0]: https://travis-ci.org/joshgillies/hypercomponent.svg?branch=master
[1]: https://travis-ci.org/joshgillies/hypercomponent
[2]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[3]: http://standardjs.com/
[WebReflection]: https://twitter.com/WebReflection
[handleEvent]: https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
[hyper]: https://github.com/WebReflection/hyperHTML
[types]: https://github.com/WebReflection/hyperHTML/blob/master/DEEPDIVE.md#good
[wire]: https://github.com/WebReflection/hyperHTML#wait--there-is-a-wire--in-the-code
