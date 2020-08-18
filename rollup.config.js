import htmlMinifier from 'rollup-plugin-html-minifier';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel';
import html from '@rollup/plugin-html';
import del from 'rollup-plugin-delete';
import url from '@rollup/plugin-url';
import pkg from './package.json';

import { terser } from 'rollup-plugin-terser';
import { string } from "rollup-plugin-string";

import { readFileSync } from 'fs';
import * as path from 'path';

const { formatToRollupPluginHtml } = require('./building/format-to-rollup-plugin-html');
const argv = require('minimist')(process.argv.slice(2));

const extensions = [
  '.js', '.ts',
];

const CONFIG = {
  isProduction: process.env.NODE_ENV === 'production',
  iifeWindowScope: 'RollupTypeScriptBabel',
  buildPath: './dist',
  isWatching: argv.watch
}

console.log("Rollup config. command line parameters:", JSON.stringify(argv, null, 2));
console.log("Rollup config. Is Production:", CONFIG.isProduction);

const globalPlugins = [
  del({
    targets: CONFIG.buildPath + "/*",
    runOnce: CONFIG.isWatching
  }),
  // Add support to shaders as external files
  string({
    include: "**/*.(glsl|frag|vert)",
  }),
  // Allows node_modules resolution
  resolve({ extensions }),

  // Allow bundling cjs modules. Rollup doesn't understand cjs
  commonjs(),

  // Compile TypeScript/JavaScript files
  babel({
    extensions,
    babelHelpers: 'bundled',
    include: ['src/**/*'],
    sourceMaps: true,
  }),
  url({
    excluse: null,
    include: [
      '**/*.svg',
      '**/*.png',
      '**/*.jpeg',
      '**/*.jpg',
      '**/*.webp',
    ],
    limit: 0, // Limit 0 means that no image will be bundled as base64 inside the js bundle
    // destDir: CONFIG.buildPath + '/static/',
    sourceDir: path.join(__dirname, 'src'),
    fileName: '[dirname][name]-[hash][extname]',
  }),
  postcss({
    // Full config info at: https://www.npmjs.com/package/rollup-plugin-postcss
    extract: path.resolve(CONFIG.buildPath + "/style.css"),
    minimize: CONFIG.isProduction,
  }),
  html({
    template: (opts) => {
      // const { attributes, bundle, files, publicPath, title } = opts;
      const htmlTemplate = readFileSync(path.resolve('./src/index.html'), { encoding: "utf8" });

      // replace code here
      // Must return final html as string

      // you can replace yourself and let the function to do it
      return formatToRollupPluginHtml(opts, htmlTemplate);
    }
  }),
];

if (CONFIG.isProduction) {
  globalPlugins.push(htmlMinifier({
    // Full config info at: https://www.npmjs.com/package/html-minifier
    removeComments: true,
    collapseWhitespace: true
  }));
}

export default {
  input: './src/index.ts',

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en/#external
  external: [],

  plugins: globalPlugins,

  watch: {
    include: 'src/**'
  },

  output: [
    // {
    //   file: pkg.main,
    //   format: 'cjs',
    // },
    // {
    //   file: pkg.module,
    //   format: 'es',
    // },
    {
      file: pkg.browser,
      format: 'iife',
      name: CONFIG.iifeWindowScope,
      sourcemap: (CONFIG.isProduction ? 'nosources-source-map' : 'source-map'),

      plugins: [
        (CONFIG.isProduction ? terser() : null)
      ],

      // https://rollupjs.org/guide/en/#outputglobals
      globals: {},
    }
  ],
};
