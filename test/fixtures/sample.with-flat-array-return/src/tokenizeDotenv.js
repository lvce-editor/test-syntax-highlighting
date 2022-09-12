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

export const hasArrayReturn = true

export const tokenizeLine = (line, lineState) => {
  return {
    state: 1,
    tokens: [TokenType.Comment, 1, TokenType.Comment, 1],
  }
}
