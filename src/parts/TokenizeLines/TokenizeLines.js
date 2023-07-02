import splitLines from 'split-lines'
import * as GetTokenNames from '../GetTokenNames/GetTokenNames.js'

export const tokenizeLines = (text, Tokenizer) => {
  let lineState = {
    ...Tokenizer.initialLineState,
  }
  const tokens = []
  const lines = splitLines(text)
  for (let i = 0; i < lines.length; i++) {
    lineState = Tokenizer.tokenizeLine(lines[i], lineState)
    const tokenNames = GetTokenNames.getTokenNames(Tokenizer, lineState.tokens)
    tokens.push(...tokenNames)
    tokens.push('NewLine')
  }
  tokens.pop()
  return tokens.join('\n')
}
