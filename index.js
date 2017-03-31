const hyperHTML = require('hyperhtml')
const onload = require('on-load')
const slice = Array.prototype.slice

const WIRE_OR_BOUND_NODE = /(update|hyperHTML)$/
const ONLOAD_ATTR = /^data-onloadid/

module.exports = function hypercomponent (component) {
  const render = hyperHTML.wire()
  const renderer = typeof component === 'function'
    ? component
    : component.render

  return function wireComponent () {
    const onloadHandler = component.onload
    const onunloadHandler = component.onunload
    const args = slice.call(arguments)

    let isMounted = false
    let el = null

    if (
      typeof args[0] === 'function' &&
      WIRE_OR_BOUND_NODE.test(args[0].name)
    ) {
      el = renderer.apply(renderer, args)
    } else {
      args.unshift(render) // asign default renderer
      el = renderer.apply(renderer, args)
    }

    if (!onloadHandler && !onunloadHandler) return el

    if (Array.isArray(el)) {
      return el // A root elelemnt is required if you want to use mount/unmmount
    }

    let len = (el.attributes && el.attributes.length) || 0
    while (len--) {
      if (ONLOAD_ATTR.test(el.attributes[len].name)) {
        isMounted = true
        break
      }
    }

    if (!isMounted) {
      return onload(el, onloadHandler, onunloadHandler)
    }

    return el
  }
}
