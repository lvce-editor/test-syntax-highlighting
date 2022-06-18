export const State = {
  TopLevelContent: 1,
}

export const TokenType = {
  Comment: 1,
}

export const TokenMap = {
  [TokenType.Comment]: 'Comment',
}

export const initialLineState = {
  state: State.TopLevelContent,
}

export const tokenizeLine = (line, lineState) => {
  return {
    state: 1,
    tokens: [{ type: TokenType.Comment }, { type: TokenType.Comment }],
  }
}
