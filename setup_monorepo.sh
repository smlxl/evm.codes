#!/bin/sh
set -e

# start building packages
echo "Installing dependencies"
cd ethereumjs-monorepo
npm i

echo "Link @ethjs-eof/* packages to its monorepo for EOF supported"
cd ..
# sed -i 's/"name": "@ethereumjs\/block"/"name": "@ethjs-eof\/block"/g' ethereumjs-monorepo/packages/block/package.json
pnpm add @ethjs-eof/block@ethereumjs-monorepo/packages/block

# sed -i 's/"name": "@ethereumjs\/common"/"name": "@ethjs-eof\/common"/g' ethereumjs-monorepo/packages/common/package.json
pnpm add @ethjs-eof/common@ethereumjs-monorepo/packages/common

# sed -i 's/"name": "@ethereumjs\/evm"/"name": "@ethjs-eof\/evm"/g' ethereumjs-monorepo/packages/evm/package.json
pnpm add @ethjs-eof/evm@ethereumjs-monorepo/packages/evm

# sed -i 's/"name": "@ethereumjs\/tx"/"name": "@ethjs-eof\/tx"/g' ethereumjs-monorepo/packages/tx/package.json
pnpm add @ethjs-eof/tx@ethereumjs-monorepo/packages/tx

# sed -i 's/"name": "@ethereumjs\/util"/"name": "@ethjs-eof\/util"/g' ethereumjs-monorepo/packages/util/package.json
pnpm add @ethjs-eof/util@ethereumjs-monorepo/packages/util

# sed -i 's/"name": "@ethereumjs\/vm"/"name": "@ethjs-eof\/vm"/g' ethereumjs-monorepo/packages/vm/package.json
pnpm add @ethjs-eof/vm@ethereumjs-monorepo/packages/vm
