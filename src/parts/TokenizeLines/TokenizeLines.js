import * as GetInitialLineState from '../GetInitialLineState/GetInitialLineState.js'
import * as GetTokenNames from '../GetTokenNames/GetTokenNames.js'
import * as JoinLines from '../JoinLines/JoinLines.js'
import * as SplitLines from '../SplitLines/SplitLines.js'

export const tokenizeLines = (text, Tokenizer) => {
  let lineState = GetInitialLineState.getInitialLineState(Tokenizer)
  const tokens = []
  const lines = SplitLines.splitLines(text)
  for (let i = 0; i < lines.length; i++) {
    lineState = Tokenizer.tokenizeLine(lines[i], lineState)
    const tokenNames = GetTokenNames.getTokenNames(Tokenizer, lineState.tokens)
    tokens.push(...tokenNames)
    tokens.push('NewLine')
  }
  tokens.pop()
  return JoinLines.joinLines(tokens)
}
