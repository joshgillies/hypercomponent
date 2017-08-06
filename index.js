var PicoComponent = require('picocomponent')
var viperHTML = require('viperhtml')
var extend = require('xtend')

// WeakMap fallback from hyperhtml HT @WebReflection
var EXPANDO = '__hypercomponent'
var $WeakMap = typeof WeakMap === 'undefined'
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

function createChild (Component, props, children) {
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

function HyperComponent (props) {
  if (this.connectedCallback) this.connect = this.connectedCallback
  if (this.disconnectedCallback) this.disconnect = this.disconnectedCallback
  PicoComponent.call(this)
  this.props = props || this.defaultProps || {}
  this.state = this.defaultState || {}
}

HyperComponent.prototype = Object.create(PicoComponent.prototype)
HyperComponent.prototype.constructor = HyperComponent

HyperComponent.prototype.render = function render () {
  var self = this
  if (this._wire === undefined) {
    this._wire = function wire () {
      var args = arguments
      var isStatic = args[0] && args[0].raw
      if (args.length > 1) {
        if (isStatic) {
          return viperHTML.wire(self).apply(viperHTML, args)
        }
        return viperHTML.wire.apply(viperHTML, args)
      }
      switch (typeof args[0]) {
        case 'string':
          return viperHTML.wire(self, args[0])
        case 'object':
          if (isStatic) {
            return viperHTML.wire(self).apply(viperHTML, args)
          }
          return viperHTML.wire(args[0])
        default:
          return viperHTML.wire(self)
      }
    }
  }
  this.el = this.renderCallback(this._wire, createChild.bind(this))
  return this.el
}

HyperComponent.prototype.setState = function setState (state) {
  this.state = extend(this.state, state)
  this.render()
}

module.exports = HyperComponent
module.exports.default = module.exports
