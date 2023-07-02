import { InvariantError } from '../InvariantError/InvariantError.js'

const getTokenNamesWithArrayReturn = (Tokenizer, tokens) => {
  const tokenNames = []
  for (let i = 0; i < tokens.length; i += 2) {
    const tokenType = tokens[i]
    const tokenName = Tokenizer.TokenMap[tokenType]
    if (tokenName === undefined) {
      if (typeof tokenType !== 'number') {
        throw new Error(
          `token must be of type number, but was of type ${typeof tokenType}`
        )
      }
      throw new InvariantError(`TokenMap is missing property "${tokenType}"`)
    }
    tokenNames.push(tokenName)
  }
  return tokenNames
}

const getTokenNamesLegacy = (Tokenizer, tokens) => {
  const tokenNames = []
  for (const token of tokens) {
    const tokenType = token.type
    const tokenName = Tokenizer.TokenMap[tokenType]
    if (tokenName === undefined) {
      throw new InvariantError(`TokenMap is missing property "${tokenType}"`)
    }
    tokenNames.push(tokenName)
  }
  return tokenNames
}

export const getTokenNames = (Tokenizer, tokens) => {
  if (!Tokenizer.TokenMap) {
    throw new InvariantError('tokenizer is missing export const TokenMap')
  }
  if (Tokenizer.hasArrayReturn) {
    return getTokenNamesWithArrayReturn(Tokenizer, tokens)
  }
  return getTokenNamesLegacy(Tokenizer, tokens)
}
