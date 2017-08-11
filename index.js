var PicoComponent = require('picocomponent')
var viperHTML = require('viperhtml')
var extend = require('xtend')

function HyperComponent (props) {
  if (this.connectedCallback) this.connect = this.connectedCallback
  if (this.disconnectedCallback) this.disconnect = this.disconnectedCallback
  PicoComponent.call(this)
  this.props = props || this.defaultProps || {}
  this.state = this.defaultState || {}
}

HyperComponent.prototype = Object.create(PicoComponent.prototype)
HyperComponent.prototype.constructor = HyperComponent

HyperComponent.prototype.handleEvent = function handleEvent (event) {
  this['on' + event.type](event)
}

HyperComponent.prototype.render = function render (node) {
  var self = this
  this.el = this.renderCallback(
    this._wire || (self._wire = function wire () {
      var args = arguments
      var isStatic = args[0] && args[0].raw
      if (args.length > 1) {
        if (isStatic) {
          return (node ? viperHTML.bind(node) : viperHTML.wire(self)).apply(viperHTML, args)
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
    }),
    this._component || (function (componentCache) {
      // leverage this closure as an in-memory store for child component instances
      return (self._component = function component (Component, props, children) {
        var key = props && props.key ? Component.name + ':' + props.key : Component.name
        var instance = componentCache[key]

        if (instance === undefined) {
          instance = componentCache[key] = new Component(
            extend(
              Component.defaultProps || {},
              props || {},
              children ? { children: children } : {}
            )
          )
        } else {
          instance.props = extend(instance.props, props, { children: children })
        }
        return instance.render()
      })
    })({})
  )
  return this.el
}

HyperComponent.prototype.setState = function setState (state) {
  this.state = extend(this.state, state)
  this.render()
}

module.exports = HyperComponent
module.exports.default = module.exports
