var PicoComponent = require('picocomponent')
var viperHTML = require('viperhtml')

function extend (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i]

    for (var key in source) {
      target[key] = source[key]
    }
  }

  return target
}

function HyperComponent (props) {
  if (this.connectedCallback) this.connect = this.connectedCallback
  if (this.disconnectedCallback) this.disconnect = this.disconnectedCallback
  PicoComponent.call(this)
  this.props = props || this.defaultProps || {}
  this.state = this.defaultState || {}
}

extend((HyperComponent.prototype = Object.create(PicoComponent.prototype)), {
  constructor: HyperComponent,
  handleEvent: handleEvent,
  render: render,
  setState: setState
})

function handleEvent (event) {
  this['on' + event.type](event)
}

function render (node) {
  var self = this
  this.el = this.renderCallback(
    this._wire || (self._wire = function wire () {
      var args = arguments
      var value = args[0]
      var isStatic = value && value.raw

      if (args.length > 1) {
        if (isStatic) {
          return (node ? viperHTML.bind(node) : viperHTML.wire(self)).apply(viperHTML, args)
        }
        return viperHTML.wire.apply(viperHTML, args)
      }

      if (typeof value === 'object') {
        if (isStatic) {
          return viperHTML.wire(self).apply(viperHTML, args)
        }
        return viperHTML.wire(value)
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

function setState (state) {
  extend(this.state, state)
  this.render()
}

module.exports = HyperComponent
module.exports.default = module.exports
