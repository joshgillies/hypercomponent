var PicoComponent = require('picocomponent')
var viperHTML = require('viperhtml')

function HyperComponent () {
  PicoComponent.call(this)
}

HyperComponent.prototype = Object.create(PicoComponent.prototype)
HyperComponent.prototype.constructor = HyperComponent

HyperComponent.prototype.adopt = function adopt (node, type) {
  this['_' + type || 'html'] = viperHTML.adopt(node)
  return this
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

HyperComponent.prototype.svg = function svg () {
  if (this._svg === undefined) this._svg = this.wire(this, 'svg')
  this.el = this._svg.apply(this, arguments)
  return this.el
}

HyperComponent.prototype.wire = function wire () {
  return viperHTML.wire.apply(viperHTML, arguments)
}

module.exports = HyperComponent
module.exports.default = module.exports
