# evm.codes
Source code for evm.codes

To generate the full javascript source, clone https://github.com/ethereumjs/ethereumjs-monorepo.
Then go in the top level directory, install `npm` if you don't have it, and:
```
git checkout @ethereumjs/vm@5.5.3
git submodule init
git submodule update
npm install
cd packages/vm
npm install
cd examples/run-code-browser
npm install
```
At this point, replace the `index.html` and the `index.js` by the ones in this repository, and:
```
npm run example:browser
```
You can then take the `index.html` and the generated `bundle.js`, and copy them on your website.
