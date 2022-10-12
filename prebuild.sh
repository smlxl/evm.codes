# This is a HACKY script to fix build errors that occur when using ethereumjs v6+
# Please refer to this issue if you don't understand what this is all about:
# https://github.com/ethereumjs/ethereumjs-monorepo/issues/2295#issue-1377817460
# Hopefully this will be removed when the issue is properly resolved.

sed -i "s/import AsyncEventEmitter = require('async-eventemitter')/import AsyncEventEmitter from 'async-eventemitter'/g" ./node_modules/@ethereumjs/evm/src/evm.ts
sed -i 's/export .*/export {   getActivePrecompiles, precompiles,   ripemdPrecompileAddress }\nexport type {   AddPrecompile,   CustomPrecompile,   DeletePrecompile, PrecompileFunc,   PrecompileInput }/g' ./node_modules/@ethereumjs/evm/src/precompiles/index.ts
sed -i '205,$d' ./node_modules/@ethereumjs/evm/src/precompiles/index.ts
