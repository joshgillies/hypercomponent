const hyperHTML = require('hyperhtml')
const slice = Array.prototype.slice
const WIRE_OR_BOUND_NODE = /(update|hyperHTML)$/

module.exports = function hypercomponent (component) {
  const render = hyperHTML.wire()

  return function wireComponent () {
    const args = slice.call(arguments)

    if (typeof args[0] === 'function' && WIRE_OR_BOUND_NODE.test(args[0].name)) {
      return component.apply(component, args)
    }

    args.unshift(render)
    return component.apply(component, args)
  }
}
