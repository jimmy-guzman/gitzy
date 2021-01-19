import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import eslint from '@rollup/plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import visualizer from 'rollup-plugin-visualizer'
import externals from 'rollup-plugin-node-externals'

import pkg from '../package.json'

const extensions = ['.js', '.ts']
const include = 'src/**/*'

export default {
  input: 'src/index.ts',
  output: {
    file: pkg.main,
    format: 'cjs',
    plugins: [terser()],
  },
  plugins: [
    eslint({ throwOnError: !process.env.DEV, include }),
    externals({ builtins: true, devDeps: false, deps: true }),
    commonjs(),
    resolve({ extensions, preferBuiltins: true }),
    babel({ babelHelpers: 'bundled', extensions, include }),
    process.env.DEBUG_MODE
      ? visualizer({
          filename: './.reports/bundle-stats.html',
          title: `rollup: ${pkg.name}`,
        })
      : null,
  ],
}
