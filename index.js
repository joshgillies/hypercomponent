var PicoComponent = require('picocomponent')
var viperHTML = require('viperhtml')
var extend = require('xtend')

// WeakMap fallback from hyperhtml HT @WebReflection
var EXPANDO = '__hypercomponent'
var $WeakMap = typeof WeakMap === undefined
  ? function () {
    return {
      get: function (obj) { return obj[EXPANDO] },
      set: function (obj, value) {
        Object.defineProperty(obj, EXPANDO, {
          configurable: true,
          value: value
        })
      }
    }
  } : WeakMap

var Components = new $WeakMap()

function HyperComponent (props) {
  PicoComponent.call(this)
  this.props = props || this.defaultProps || {}
  this.state = this.defaultState || {}
}

HyperComponent.prototype = Object.create(PicoComponent.prototype)
HyperComponent.prototype.constructor = HyperComponent

HyperComponent.prototype.adopt = function adopt (node, type) {
  this['_' + type || 'html'] = viperHTML.adopt(node)
  return this
}

HyperComponent.prototype.child = function child (Component, props, children) {
  if (Components.get(this) === undefined) Components.set(this, {})

  var components = Components.get(this)
  var key = props && props.key ? Component.name + ':' + props.key : Component.name

  if (components[key] === undefined) {
    return (components[key] = new Component(
      extend(
        Component.defaultProps || {},
        props || {},
        children ? { children: children } : {}
      )
    )).render()
  }

  var instance = components[key]
  instance.props = extend(instance.props, props, { children: children })
  return instance.render()
}

HyperComponent.prototype.handleEvent = function handleEvent (event) {
  var handler = this[event.type] || this['on' + event.type]
  if (handler) handler.call(this, event)
}

HyperComponent.prototype.html = function html () {
  if (this._html === undefined) this._html = this.wire(this, 'html')
  this.el = this._html.apply(this, arguments)
  return this.el
}

HyperComponent.prototype.setState = function setState (state) {
  this.state = extend(this.state, state)
  this.render()
}

HyperComponent.prototype.svg = function svg () {
  if (this._svg === undefined) this._svg = this.wire(this, 'svg')
  this.el = this._svg.apply(this, arguments)
  return this.el
}

HyperComponent.prototype.wire = function wire (obj, type) {
  if (typeof obj === 'string') return viperHTML.wire(this, obj)
  return viperHTML.wire(obj, type)
}

module.exports = HyperComponent
module.exports.default = module.exports
