#!/bin/sh
set -e

# start building packages
echo "Installing dependencies"
cd ethereumjs-monorepo
npm i

echo "Add @ethjs-eof/* packages for EOF supported"
cd ..
pnpm add @ethjs-eof/block@ethereumjs-monorepo/packages/block
pnpm add @ethjs-eof/common@ethereumjs-monorepo/packages/common
pnpm add @ethjs-eof/evm@ethereumjs-monorepo/packages/evm
pnpm add @ethjs-eof/tx@ethereumjs-monorepo/packages/tx
pnpm add @ethjs-eof/util@ethereumjs-monorepo/packages/util
pnpm add @ethjs-eof/vm@ethereumjs-monorepo/packages/vm