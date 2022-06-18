export const State = {
  TopLevelContent: 1,
}

export const TokenType = {
  Comment: 1,
  PlainText: 2,
}

export const TokenMap = {
  [TokenType.Comment]: 'Comment',
  [TokenType.PlainText]: 'PlainText',
}

export const initialLineState = {
  state: State.TopLevelContent,
}

export const tokenizeLine = (line, lineState) => {
  if (line.startsWith('#')) {
    return {
      state: 1,
      tokens: [
        {
          type: TokenType.Comment,
        },
      ],
    }
  }
  return {
    state: 1,
    tokens: [{ type: TokenType.PlainText }],
  }
}
