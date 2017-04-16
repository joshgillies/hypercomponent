const onload = require('on-load')
const html = require('hyperrender').html
const svg = require('hyperrender').svg
const slice = Array.prototype.slice

module.exports = function hypercomponent (component) {
  const symbol = {
    render: typeof component === 'function' ? component : component.render,
    load: component && component.load,
    unload: component && component.unload
  }
  return function wireComponent () {
    const instance = new Component()
    instance._symbol = symbol
    instance._loaded = !(symbol.load || symbol.unload)
    instance._defaultArgs = slice.call(arguments)
    return instance
  }
}

function Component () {
  const self = this

  function wire () {
    return wire.html.apply(self, arguments)
  }

  wire.html = html(this)
  wire.svg = svg(this)

  this._wire = wire
}

Component.prototype.render = function render () {
  const self = this
  let args = [this._wire] // first arg is always our wire

  for (var
    i = 0,
    length = arguments.length;
    i < length; i++
  ) {
    args[i + 1] = arguments[i] === undefined
      ? this._defaultArgs[i] // assign default arg if incomming is undefined
      : arguments[i]
  }

  if (this._loaded === false) {
    return onload(this._symbol.render.apply(this, args), load, unload)
  }

  return this._symbol.render.apply(this, args)

  function load () {
    self._loaded = true
    self._symbol.load.apply(null, arguments)
  }

  function unload () {
    self._loaded = false
    self._symbol.unload.apply(null, arguments)
  }
}
