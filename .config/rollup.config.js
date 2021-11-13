import commonjs from '@rollup/plugin-commonjs'
import eslint from '@rollup/plugin-eslint'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import externals from 'rollup-plugin-node-externals'
import visualizer from 'rollup-plugin-visualizer'

import pkg from '../package.json'

const rollupConfig = {
  input: 'src/index.ts',
  output: { file: pkg.main, format: 'cjs' },
  plugins: [
    process.env.WATCH
      ? eslint({ throwOnError: false, include: 'src/**/*' })
      : null,
    externals({ builtins: true, devDeps: false, deps: true }),
    commonjs(),
    resolve({ extensions: ['.js', '.ts'], preferBuiltins: true }),
    esbuild({
      minify: true,
      minifyWhitespace: true,
      target: 'node12',
    }),
    process.env.DEBUG_MODE
      ? visualizer({
          filename: './.reports/bundle-stats.html',
          title: `rollup: ${pkg.name}`,
        })
      : null,
  ],
}

export default rollupConfig
