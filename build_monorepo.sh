#!/bin/sh
set -e

# start building packages
echo "Installing dependencies"
cd ethereumjs-monorepo
npm i

echo "Add @ethereumjs/* packages"
cd ..
pnpm add ethereumjs-monorepo/packages/block
pnpm add ethereumjs-monorepo/packages/common
pnpm add ethereumjs-monorepo/packages/evm
pnpm add ethereumjs-monorepo/packages/tx
pnpm add ethereumjs-monorepo/packages/util
pnpm add ethereumjs-monorepo/packages/vm