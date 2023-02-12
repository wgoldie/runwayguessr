build-watch:
  ./node_modules/.bin/esbuild src/index.tsx --bundle --outfile=public/index.js --watch

build:
  ./node_modules/.bin/esbuild src/index.tsx --bundle --outfile=public/index.js

publish
   git subtree push --prefix public origin gh-pages
