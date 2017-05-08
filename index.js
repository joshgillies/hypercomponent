var PicoComponent = require('picocomponent')
var render = require('hyperrender')

function createComponent (definition) {
  function Component (args) {
    HyperComponent.apply(this, args)
    if (typeof definition.constructor === 'function') {
      definition.constructor.apply(this, args)
    }
  }

  Component.prototype = Object.create(HyperComponent.prototype)
  Component.prototype.constructor = Component

  for (var prop in definition) {
    switch (prop) {
      case 'connect':
        Component.prototype._load = definition.connect
        break
      case 'constructor':
        break
      case 'disconnect':
        Component.prototype._unload = definition.disconnect
        break
      case 'render':
        Component.prototype._render = definition.render
        break
      case 'update':
        Component.prototype._update = definition.update
        break
      default:
        Component.prototype[prop] = definition[prop]
    }
  }

  return function componentFactory () {
    return new Component(arguments)
  }
}

function HyperComponent () {
  PicoComponent.call(this)

  this._html = render.html(this)
  this._svg = render.svg(this)
}

HyperComponent.prototype = Object.create(PicoComponent.prototype)
HyperComponent.prototype.constructor = HyperComponent

HyperComponent.prototype.html = function html () {
  return this._html.apply(this, arguments)
}

HyperComponent.prototype.svg = function svg () {
  return this._svg.apply(this, arguments)
}

HyperComponent.prototype.handleEvent = function handleEvent (event) {
  var type = event.type
  var handler = this[type] || this['on' + type] || this['on' + type.charAt(0).toUpperCase() + type.slice(1)]
  if (handler) handler.call(this, event)
}

module.exports = createComponent
module.exports.default = module.exports
module.exports.HyperComponent = HyperComponent
module.exports.render = render
