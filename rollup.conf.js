import coverage from 'rollup-plugin-istanbul'
import common from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import presetEnv from 'babel-preset-env'
const env = process.env.NODE_ENV || 'test' // eslint-disable-line no-process-env
const plugins = [
  common(),
  resolve(),
  babel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [[presetEnv, { modules: false, targets: { browsers: ['IE 11'] } }]],
  }),
]

if (env === 'test') {
  plugins.unshift(coverage({ exclude: 'test.js' }))
}
export default {
  input: env === 'test' ? 'test.js' : 'index.js',
  output: {
    file: env === 'test' ? 'function-guard.test.js' : 'function-guard.js',
    name: 'functionGuard',
    globals: { chai: 'chai' },
    format: 'umd',
  },
  external: ['chai'],
  plugins,
}
