const EvmCodes = {}

EvmCodes.Address = require('ethereumjs-util').Address
EvmCodes.Account = require('ethereumjs-util').Account
EvmCodes.BN = require('ethereumjs-util').BN
EvmCodes.Chain = require('@ethereumjs/common').Chain
EvmCodes.Common = require('@ethereumjs/common').default
EvmCodes.Transaction = require('@ethereumjs/tx').Transaction
EvmCodes.VM = require('@ethereumjs/vm').default
EvmCodes.Block = require('@ethereumjs/block').Block

window.EvmCodes = EvmCodes
