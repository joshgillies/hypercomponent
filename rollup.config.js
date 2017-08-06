import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'index.js',
  dest: 'dist/hypercomponent.js',
  moduleName: 'HyperComponent',
  format: 'iife',
  plugins: [
    nodeResolve({
      browser: true
    }),
    commonjs()
  ],
  sourceMap: true
}
