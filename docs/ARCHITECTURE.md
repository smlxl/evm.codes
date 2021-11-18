# Architecture

evm.codes is a [NextJS](https://nextjs.org/) and [TailwindCSS](https://tailwindcss.com/) backed React application. Currently, it does not have any backend, so everything runs in the browser. It's written in TypeScript and uses the latest ES6 language features.

Below is the structure of the app:

```
app
├── components  - React components used throughout the application
|───── layouts  - Layout components
|───── ui       - Reusable UI components
├── context     - Shared React Contexts for the application-wide state
├── docs        - Documentation and MDX files used in the reference table
├── lib         - Common libraries and reusable React hooks
├── pages       - NextJS pages
├── public      - Public static assets
├── styles      - Global CSS styles
├── types       - TypeScript type definitions
└── utils       - Utility methods
```

## Ethereum Context

The core of the application is an [context/ethereumContext.tsx](../context/ethereumContext.tsx) powered by [EthereumJS](https://github.com/ethereumjs/ethereumjs-monorepo), which provides an application-wide state to the Ethereum Virtual Machine and its operating mechanics.

To be able to run NodeJS modules (such as EthereumJS [VM](https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/vm)) client-side, [postinstall](../package.json) script browserifies the [lib/ethereum.js](../lib/ethereum.js), which in turn exposes a global `EvmCodes` object with references to the `ethereum.js` libraries.

Additionally, smart contracts compilation is handled by the [SolcJC](https://github.com/ethereum/solc-js) through the [lib/solcWorker.js](../lib/solcWorker.js).

## MDX docs

The Opcodes reference table relies on the [MDX](https://mdxjs.com/) powered [docs/opcodes](../docs/opcodes), in order to to build dynamic documentation for each opcode. It follows a standard [markdown syntax](https://daringfireball.net/projects/markdown/syntax) with a few customizations, implemented by the [components/Reference/DocRow.tsx](../components/Reference/DocRow.tsx) and [components/ui/Doc.tsx](../components/ui/Doc.tsx) components:

- Supported page metadata (labels shown in the beginning of the doc) are: `fork`, `group`.
- Adding `*` in the markdown table header or column, leaves a borderless gap between the columns.
