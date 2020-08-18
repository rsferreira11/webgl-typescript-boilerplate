# Rollup-TypeScript-Babel WebGL

Focus in what matters! WebGL Boilerplate using Typescript transpiled by babel.

It supports:
- Rollup for module bundler.
- Minified bundle on release mode.
- Decidated testing server.
- all images are bundled as url.
- Custom index.html linking hashed javascript.
- postcss.
- shader code written in glsl are bundled as text.
- Sample code with running webgl program: [preview](https://rsferreira11.github.io/webgl-typescript-boilerplate/pages/).
- npm script to publish to github pages.

## Build and start a server on port 3000

```shell
npm start
```

## Build "debug" build

```shell
npm run build
```

## Build "release" build

```shell
npm run release
```

## Type-Checking the repo

```shell
npm run type-check
```

And to run in --watch mode:

```shell
npm run type-check:watch
```

## Build Javascript only

```shell
npm run build:js
```

And to run in --watch mode:

```shell
npm run build:js:watch
```

## Starting a server on port 8000

```shell
npm run serve -- --config-port=8000
```

## Release for publish on pages/github

```shell
npm run release:pages
```

PS: You need to enable github pages for you repo. Then you will have a url similar to:
https://rsferreira11.github.io/webgl-typescript-boilerplate/pages/
