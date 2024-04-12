import * as AstTypes from '@solidity-parser/parser/src/ast-types'

export type ContractArtifact<T = AstTypes.BaseASTNode> = {
  id: number
  node: T
  // undefined for global scope
  scope?: AstTypes.ContractDefinition | AstTypes.FunctionDefinition
}

// // this represents a single contract/interface/library definition block
export class SourceDefinition {
  contracts: ContractArtifact<AstTypes.ContractDefinition>[] = []
  functions: ContractArtifact<AstTypes.FunctionDefinition>[] = []
  storage: ContractArtifact<AstTypes.StateVariableDeclaration>[] = [] // TODO: rename as variables? (to include floating immutables, constants)
  structs: ContractArtifact<AstTypes.StructDefinition>[] = []
  events: ContractArtifact<AstTypes.EventDefinition>[] = []
  errors: ContractArtifact<AstTypes.CustomErrorDefinition>[] = []
  enums: ContractArtifact<AstTypes.EnumDefinition>[] = []
}
